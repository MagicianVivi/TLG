define(function () {
    var base_url = 'http://localhost:5000/',
    commits_endpoint = 'commits',
    contributors_endpoint = 'contributors',
    search_endpoint = 'search';

    return {
        base_url: base_url,
        commits_endpoint: commits_endpoint,
        contributors_endpoint: contributors_endpoint,
        search_endpoint: search_endpoint
    }
});
