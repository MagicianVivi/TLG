from flask import Flask, jsonify, request
from requests import get
from flask.ext.cors import origin

app = Flask(__name__)
app.config.from_object('configuration')

def get_request_json(url, params={}):
    """
    Helper for sending a get request and getting the returned json
    """
    auth_params = dict(params)
    auth_params['client_id'] = app.config['GITHUB_CLIENT_ID']
    auth_params['client_secret'] = app.config['GITHUB_CLIENT_SECRET']
    req = get(url, params=auth_params)
    return req.json()

def get_repository_info(request_dict, endpoint):
    """
    """
    params = dict(request_dict)
    # Remove url from request args before passing them to the request
    repo_url = params.pop('url')[0]

    return get_request_json(repo_url + endpoint, params)


@app.route('/search', methods=['GET'])
@origin(app.config['ORIGIN'])
def search():
    """
    Endpoint for calling Github search API.
    Pass the parameters given in the query_string 'as is' so that the user
    is free to use the filters from Github
    Return the JSON sent by the API.
    """

    query_url = app.config['GITHUB_API_SEARCH_URL'] + 'repositories'
    query_data = get_request_json(query_url, request.args)
    return jsonify(query_data)        

@app.route('/commits', methods=['GET'])
@origin(app.config['ORIGIN'])
def commits():
    """
    Endpoint for getting a repository data from the Github API.
    Return a custom JSON containing the top contributors (for the last 100
    commits) with their Github API url as key and an array of their commits
    (message and date) under the key 'commits'
    """

    def format_commit(commit):
        """
        Procces a commit object to return only the message and the timestamp in
        a dict.
        """

        return commit['author']['date']

    def process_commits(commits):
        """
        Process the commits of a repository from the Github API.
        Return a dict with the url of every authors found as key, and an array
        of their commits as value.
        """

        results = {'timeline': []}
        impact = {}
    
        for commit_object in commits:
            results['timeline'].append(format_commit(commit_object['commit']))
            # The top level author object is null on some commit
            # mirroring problem on github end???
            author = commit_object.get('author',None)
            if author is not None:
                author_url = author['url']
                impact[author_url] = impact.get(author_url, 0) + 1
            else:
                impact['anonymous'] = impact.get('anonymous', 0) + 1
                
        results['impact'] = impact

        return results

    return jsonify(process_commits(
        get_repository_info(request.args, '/commits')))

@app.route('/contributors', methods=['GET'])
@origin(app.config['ORIGIN'])
def contributors():
    """
    Endpoint for getting the contributors of a repository from the Github API.
    Returns a list of every contributors on the repository (their Github API
    url) in an array under the 'contributors' key.
    """
    
    def format_contributors(contributors):
        """
        Return a list of the Github API url of contributors for the repository.
        """
            
        return [ u['url'] for u in contributors ]

    return jsonify(contributors = format_contributors(
        get_repository_info(request.args, '/contributors')))


if __name__ == '__main__':
    app.run()
