from flask import Flask, render_template, request, jsonify
import os
import main

app = Flask(__name__)


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

        stop_distance = main.get_stop_distance(int(range_))
        directions = main.get_directions(start, end)
        points = main.get_gas_stop(start, end, stop_distance)
        if points == "You Don't Need To Fuel Up for this Trip!":
            return "You Don't Need to Fuel Up for this Trip"
        addresses = []

        for point in points:
            addresses.append(main.get_gas_stations(point, 40233))
        print("gas_stations:")
        gas_stations = []

        for address in addresses:
            gas_stations.append(main.sort(address, gas_type))

        results = []

        for stop in gas_stations:
            results.append(stop[0])
        print(results)

        results = jsonify(results)
        return results


if __name__ == "__main__":
    app.run(debug= True, host='0.0.0.0', port=os.environ.get('PORT', '5000'))