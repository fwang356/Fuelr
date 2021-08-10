from flask import Flask, render_template, request, jsonify
import main
from celery import Celery

app = Flask(__name__)
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('home.html')


@app.route('/autocomplete', methods=['GET', 'POST'])
def autocomplete():
    if request.method == 'POST':
        input = request.form.get("input")
        results = jsonify(main.search(input))
        return results


@app.route('/gas-station', methods=['GET', 'POST'])
def gas_station():
    if request.method == 'POST':
        start = request.form.get("start")
        end = request.form.get("end")
        range_ = request.form.get("range")
        gas_type = request.form.get("gas_type")
        print("starting task")
        task = background_task(start, end, range_, gas_type)

        return jsonify({}), 202, {'Location': url_for('taskstatus',
                                                  task_id=task.id)}


@celery.task(bind=True)
def background_task(self, start, end, range_, gas_type):
    print('in task')
    stop_distance = main.get_stop_distance(int(range_))
    directions = main.get_directions(start, end)
    points = main.get_gas_stop(start, end, stop_distance)
    addresses = []
    for point in points:
        addresses.append(main.get_gas_stations(point, 40233))
    gas_stations = []
    for address in addresses:
        gas_stations.append(main.sort(address, gas_type))

    results = []

    for stop in gas_stations:
        results.append(stop[0])

    results = jsonify(results)
    return results


@app.route('/status/<task_id>')
def taskstatus(task_id):
    task = background_task.AsyncResult(task_id)
    if task.state == 'PENDING':
        # job did not start yet
        response = {
            'state': task.state,
            'status': 'Pending...'
        }
    elif task.state != 'FAILURE':
        response = {
            'state': task.state,
            'response': task.info,
            'status': 'Completed'
        }
    else:
        response = {
            'state': task.state,
            'status': str(task.info),
        }
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)