from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/", methods=["POST", "GET"])
def main():
    # TODO: DO stuff
    return jsonify({"Result":"200"})

if __name__=="__main__":
    app.run(debug=True, port=5000)
