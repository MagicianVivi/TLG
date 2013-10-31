from flask import Flask, jsonify, request
app = Flask(__name__)

@app.route('/search', methods=['GET'])
def search():
    pass

@app.route('/repository', methods=['GET'])
def repository():
    json = {}
    json['data'] = "Hello"
    return jsonify(json)

if __name__ == '__main__':
    app.run()
