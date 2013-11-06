define(['./display', './config'], function (display, config) {
    'use strict';
    
    var search_field_id = 'search_field',
    query_key = 'q';

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

    function create_query_string(query_params) {
        var key,
        params = {},
        query_string = query_key + '=' + query_params[query_key];
        
        for (key in query_params) {
            if (key !== query_key) {
                query_string += '&' + key + '=' + query_params[key];
            }
        }

        return query_string;
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

    function call_api(endpoint, callback, query_params) {
        var query_string = create_query_string(query_params);

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

    function call_search_api(query_params) {

        function format_search(field_id) {
            var field = document.getElementById(field_id),
            query = field.value.trim().replace(/\s+/g, '+');

            return query;
        }
        
        function search_callback(json) {
            var commits_params = { per_page: '100' },
            forEach = Array.prototype.forEach,
            url;

            display.search_results(json);

            forEach.call(document.querySelectorAll('.result'), 
                function (element) {
                    url = element.getAttribute('data');
                    element.addEventListener('click',
                        call_repo_api.bind(null, url, commits_params), false);
                });
        }
        
        if (!query_params.hasOwnProperty(query_key)) {
            query_params[query_key] = format_search(search_field_id);
        }

        call_api(config.search_endpoint, 
                 search_callback,
                 query_params);
    }

    function call_repo_api(value, commits_params) {
        var query_params = {},
        key;
  
        query_params[query_key] = value;
        call_api(config.contributors_endpoint, display.contributors_list,
                query_params);

        for (key in commits_params) {
            query_params[key] = commits_params[key];
        }

        call_api(config.commits_endpoint, display.commits_results,
                query_params);
    }

    /*
      For bookmarked search, unformat it before putting it back into the
      search field
    */
    function parse_bookmark() {
        
        function parse_query_string(query_string) {
            var query_dict = {};

            query_string.split('&').forEach(function (element) {
                var key_value = element.split('=');
                query_dict[key_value[0]] = key_value[1];
            });
            
            return query_dict;
        }

        var hash_value = window.location.hash.slice(2),
        query_dict = parse_query_string(hash_value),
        url;
        
        if (!query_dict.hasOwnProperty(query_key)) {
            alert('Error: unvalid bookmarking');
        } else if (query_dict[query_key].contains('http')) {
            url = query_dict[query_key];
            delete query_dict[query_key];

            call_repo_api(url, query_dict);
        } else {
            document.getElementById(search_field_id).value = 
                query_dict[query_key].replace('+', ' ');
            
            call_search_api(query_dict);
        }
    }

    return {
        call_search_api: call_search_api,
        call_repo_api: call_repo_api,
        parse_bookmark: parse_bookmark
    };
});
