from flask import Flask, jsonify, request
from requests import get
from flask.ext.cors import origin

app = Flask(__name__)
GITHUB_API_BASE_URL = 'https://api.github.com/'
GITHUB_API_SEARCH_URL = GITHUB_API_BASE_URL + 'search/'

@app.route('/search', methods=['GET'])
@origin('null')
def search():
    query_url = GITHUB_API_SEARCH_URL + 'repositories'
    query_request = get(query_url, params=request.args)
    query_data = query_request.json()
    return jsonify(query_data)        

@app.route('/repository', methods=['GET'])
@origin('null')
def repository():
    repo_url = request.args.get('url')

    commits_request = get(repo_url + "commits?per_page=100")
    commits_data = commits_request.json()
    returned_data = process_commits(commits_data)

    contributors_request = get(repo_url + "contributors")
    contributors_data = contributors_request.json()
    returned_data["others"] = get_other_contributors(contributors_data, 
                                                     returned_data)

    return jsonify(returned_data)

def process_commits(commits):
    results = {}
    
    for commit_object in commits:
        author = commit_object.get("author",None)
        if author is not None:
            author_url = author["url"]
            if author_url in results:
                results[author_url].append(format_commit(
                                           commit_object["commit"]))
            else:
                results[author_url] = [format_commit(commit_object["commit"])]

    return results
        
def format_commit(commit):
    commit_light_dict = {}
    
    commit_light_dict["message"] = commit["message"]
    commit_light_dict["date"] = commit["author"]["date"]

    return commit_light_dict

def get_other_contributors(contributors, commits_light_data):
    known_contributors = commits_light_data.keys()
    
    return [ u["url"] for u in contributors 
             if u["url"] not in known_contributors ]

if __name__ == '__main__':
    app.run(debug=True)
