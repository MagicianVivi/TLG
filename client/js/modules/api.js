define(['./display'], function (display) {
    'use strict';

    function get_json(url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            var data;
            if (request.readyState === 4) {
                if (request.status === 200) {
                    data = JSON.parse(request.responseText);
                    callback(data);
                } else {
                    callback(undefined);
                }
            }
        };

        request.open('GET', url);
        request.send();
    }

    function format_query(field_id) {
        var field = document.getElementById(field_id),
        query = field.value.trim().replace(/\s+/g, '+');

        // set query to data attribute for further work
        field.setAttribute('data', query);
    }

    function create_query_string(field_id, search) {
        search = (search === undefined) ? false : search;

        var key,
        value = document.getElementById(field_id).getAttribute('data');

        if (search === true) {
            key = 'q';
        } else {
            key = 'url';
        }

        return key + '=' + value;
    }

    function update_hash(hash_string) {
        window.location.hash = '/' + hash_string;
    }

    function construct_url(endpoint, query_string) {
        var base_url = 'http://localhost:5000/';

        return base_url + endpoint + '?' + query_string;
    }

    function call_search_api() {
        var query_string,
        field_id = 'search_field';

        format_query(field_id);
        query_string = create_query_string(field_id, true);

        // put query_string in hash to make url bookmarkable
        update_hash(query_string);

        get_json(
            construct_url('search', query_string),
            function (data) {
                if (data === undefined) {
                    alert('Error: the search request did not work, please try again');
                } else {
                    display.search_results(data, call_repo_api);
                }
            }
        );
    }

    function call_repo_api() {
        var query_string = create_query_string(this.id);

        get_json(
            construct_url('repository', query_string),
            function (data) {
                if (data === undefined) {
                    alert('Error: the repository request did not work, please try again');
                } else {
                    display.repository_results(data);
                }
            }
        );
    }

    return {
        call_search_api: call_search_api,
        call_repo_api: call_repo_api
    };

});
