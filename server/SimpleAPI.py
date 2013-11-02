from flask import Flask, jsonify, request
from requests import get
from flask.ext.cors import origin

app = Flask(__name__)
app.config.from_object('configuration')

def get_request_json(url, params={}):
    """
    Helper for sending a get request and getting the returned json
    """
    auth_params = params.copy()
    auth_params['client_id'] = app.config['GITHUB_CLIENT_ID']
    auth_params['client_secret'] = app.config['GITHUB_CLIENT_SECRET']
    req = get(url, params=auth_params)
    return req.json()

@app.route('/search', methods=['GET'])
@origin('null')
def search():
    """
    Endpoint for calling Github search API.
    Pass the parameters given in the query_string 'as is' so that the user
    is free to use the filters from Github
    Return the JSON sent by the API
    TODO : think of a way to implement order and sort
    """

    query_url = app.config['GITHUB_API_SEARCH_URL'] + 'repositories'
    query_data = get_request_json(query_url, params=request.args)
    return jsonify(query_data)        

@app.route('/repository', methods=['GET'])
@origin('null')
def repository():
    """
    Endpoint for getting a repository data from the Github API.
    Return a custom JSON containing the top contributors (for the last 100
    commits) with their Github API url as key and an array of their commits
    (message and date) under the key 'commits' + a list of every contributors
    on the repository (again their Github API url) in an array under the 
    'contributors' key.
    """

    returned_data = {}

    repo_url = request.args.get('url')

    commits_params = {'per_page' : 100}
    commits_data = get_request_json(repo_url + '/commits', commits_params)
    returned_data['commits'] = process_commits(commits_data)

    contributors_data = get_request_json(repo_url + '/contributors')
    returned_data['contributors'] = format_contributors(contributors_data)

    return jsonify(returned_data)

def process_commits(commits):
    """
    Process the commits of a repository from the Github API.
    Return a dict with the url of every authors found as key, and an array
    of their commits as value.
    """

    results = {}
    
    for commit_object in commits:
        # The top level author object is null on some commit
        # mirroring problem on github end???
        author = commit_object.get('author',None)
        commit = format_commit(commit_object['commit'])
        if author is not None:
            author_url = author['url']
            results.setdefault(author_url, []).append(commit)
        else:
            results.setdefault('anonymous', []).append(commit)

    return results
        
def format_commit(commit):
    """
    Procces a commit object to return only the message and the timestamp in
    a dict.
    """

    return commit['author']['date']

def format_contributors(contributors):
    """
    Return a list of the Github API url of contributors for the repository
    """
    
    return [ u['url'] for u in contributors ]

if __name__ == '__main__':
    app.run()
