from flask import Flask, render_template, request, jsonify
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


if __name__ == "__main__":
    app.run(debug=True)