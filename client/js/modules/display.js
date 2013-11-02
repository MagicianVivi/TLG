define(function () {
    'use strict';
    
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

    function format_search_result(element, index, onclick) {
        var result_div = document.createElement('div');
        result_div.className = 'result';
        result_div.id = 'result' + index;
        result_div.textContent = element.full_name;
        result_div.addEventListener('click', onclick, false);
        result_div.setAttribute('data', element.url)

        return result_div;
    }

    function display_search_results(json, onclick) {
        var result_array = [];

        var items = json.items;
        items.forEach(function (element, index) {
            result_array.push(format_search_result(element, index, onclick));
        });

        var results_div = document.getElementById('search_results');
        remove_children(results_div);

        results_div.appendChild(create_children_fragment(result_array));
    }

    function extract_username(url) {
        return url.slice(url.lastIndexOf("/") + 1);
    }

    function display_repository_results(json) {

    }

    return {
        search_results: display_search_results,
        repository_results: display_repository_results
    };
});
