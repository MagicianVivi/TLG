var api = (function () {
    "use strict";

    function format_query(field_id) {
        var field = document.getElementById(field_id);
        var query = field.value.trim().replace(/\s+/g, '+');

        // set query to data attribute for further work
        field.setAttribute('data', query);
    }

    function create_query_string(field_id, search) {
        search = (search === undefined) ? false : search;

        var key;
        var value = document.getElementById(field_id).getAttribute('data');

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
        var field_id = 'search_field';

        format_query(field_id);
        var query_string = create_query_string(field_id, true);

        // put query_string in hash to make url bookmarkable
        update_hash(query_string);

        d3.json(
            construct_url('search', query_string),
            function (error, data) {
                if (data === undefined) {
                    alert('Error: the search request did not work, please try again');
                } else {
                    display_search_results(data);
                }
            }
        );
    }

    function call_repo_api(field_id) {
        var query_string = create_query_string(field_id);

        d3.json(
            construct_url('repository', query_string),
            function (error, data) {
                if (data === undefined) {
                    alert('Error: the repository request did not work, please try again');
                } else {
                    console.log(data);
                }
            }
        );
    }    

    function remove_children(parent) {
        while (parent.lastChild) {
            parent.removeChild(parent.lastChild);
        }
    }

    function create_children_fragment(children) {
        var fragment = document.createDocumentFragment();
        children.forEach(function (element) {
            fragment.appendChild(element);
        });

        return fragment;
    }

    function format_search_result(element, index) {
        var result_div = document.createElement('div');
        result_div.className = 'result';
        result_div.id = 'result' + index;
        result_div.textContent = element.full_name;
        result_div.onclick = function () {call_repo_api(result_div.id); };
        result_div.setAttribute('data', element.url)

        return result_div;
    }

    function display_search_results(json) {
        var result_array = [];

        var items = json.items;
        items.forEach(function (element, index) {
            result_array.push(format_search_result(element, index));
        });

        var results_div = document.getElementById('search_results');
        remove_children(results_div);

        results_div.appendChild(create_children_fragment(result_array));
    }

    return {
        call_search_api: call_search_api,
        call_repo_api: call_repo_api
    };

}());
