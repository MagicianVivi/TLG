from flask import Flask, jsonify, request
from requests import get

app = Flask(__name__)
GITHUB_API_BASE_URL = 'https://api.github.com/'
GITHUB_API_SEARCH_URL = GITHUB_API_BASE_URL + 'search/'

@app.route('/search', methods=['GET'])
def search():
    query_url = GITHUB_API_SEARCH_URL + 'repositories'
    query_request = get(query_url, params=request.args)
    query_data = query_request.json()
    return jsonify(query_data)        

@app.route('/repository', methods=['GET'])
def repository():
    json = {}
    json['data'] = "Hello"
    return jsonify(json)

if __name__ == '__main__':
    app.run(debug=True)
