define(['./display', './config'], function (display, config) {
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

    function construct_url(endpoint, query_string) {
        return config.base_url + endpoint + '?' + query_string;
    }

    function error_alert(key) {
        alert('Error: the ' + key + ' request did not work, please try again');
    }

    function call_search_api() {

        function format_search(field_id) {
            var field = document.getElementById(field_id),
            query = field.value.trim().replace(/\s+/g, '+');

            // set query to data attribute for further work
            field.setAttribute('data', query);
        }

        var query_string,
        field_id = 'search_field';

        format_search(field_id);
        query_string = create_query_string(field_id, true);

        // put query_string in hash to make url bookmarkable
        window.location.hash = "/" + query_string;

        get_json(
            construct_url(config.search_endpoint, query_string),
            function (data) {
                if (data === undefined) {
                    error_alert('search');
                } else {
                    display.search_results(data, call_repo_api);
                }
            }
        );
    }

    function call_repo_api() {
        var query_string = create_query_string(this.id);

        get_json(
            construct_url(config.repository_endpoint, query_string),
            function (data) {
                if (data === undefined) {
                    error_alert('repository')
                } else {
                    display.repository_results(data);
                }
            }
        );
    }

    /*
      For bookmarked search, unformat it before putting it back into the
      search field
    */
    function unformat_hash() {
        return window.location.hash.split('=')[1].replace('+', ' ');
    }

    return {
        call_search_api: call_search_api,
        call_repo_api: call_repo_api,
        unformat_hash: unformat_hash
    };

});
