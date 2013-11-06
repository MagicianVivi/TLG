define(['./display', './config'], function (display, config) {
    'use strict';
    
    var search_field_id = 'search_field',
    search_key = 'q',
    repo_key = 'url';

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

    function create_query_string(value, search) {
        search = (search === undefined) ? false : search;

        var key;

        if (search === true) {
            key = search_key;
        } else {
            key = repo_key;
        }

        return key + '=' + value;
    }

    function construct_url(endpoint, query_string) {
        return config.base_url + endpoint + '?' + query_string;
    }

    function error_alert(key) {
        alert('Error: the request to the endpoint /' + 
                key + ' did not work, please try again');
    }
    
    function update_hash(query) {
        window.location.hash = "/" + query;
    }

    function call_api(endpoint, query, callback, search) {
        var query_string = create_query_string(query, search);

        // put query_string in hash to make url bookmarkable
        update_hash(query_string);

        get_json(
            construct_url(endpoint, query_string),
            function (data) {
                if (data === undefined) {
                    error_alert(endpoint);
                } else {
                    callback(data);
                }
            }
        );
    }

    function call_search_api() {

        function format_search(field_id) {
            var field = document.getElementById(field_id),
            query = field.value.trim().replace(/\s+/g, '+');

            return query;
        }

        call_api(config.search_endpoint, format_search(search_field_id), 
                 display.search_results.bind(null, call_repo_api), true);
    }

    function call_repo_api(value) {
        call_api(config.contributors_endpoint, value,
                display.contributors_list);
        call_api(config.commits_endpoint, value, 
                 display.commits_results);
    }

    /*
      For bookmarked search, unformat it before putting it back into the
      search field
    */
    function parse_bookmark() {
        var split_hash = window.location.hash.split('='),
        key = split_hash[0],
        value = split_hash[1];
        
        if (key.endsWith(search_key)) {
            document.getElementById(search_field_id).value = value.replace(
                '+', ' ');
            call_search_api();
        } else if (key.endsWith(repo_key)) {
            call_repo_api(value);
        } else {
            alert('Error: unvalid bookmarking');
        }
    }

    return {
        call_search_api: call_search_api,
        call_repo_api: call_repo_api,
        parse_bookmark: parse_bookmark
    };

});
