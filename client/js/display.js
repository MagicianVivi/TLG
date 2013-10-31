function display_results(json){
    var tmp_result_div;
    var result_array = [];

    var items = json.items;
    items.forEach(function(element, index, array){
        result_array.push(format_search_result(element));
    });

    var results_div = document.getElementById('search_results');
    results_div.textContent = "";
    append_children(results_div, result_array);
}

function format_search_result(element){
    var result_div = document.createElement('div');
    result_div.className = 'result';
    result_div.textContent = element.full_name;
    result_div.onclick = function(){call_repo_api(element.url + "/")};

    return result_div
}

function append_children(parent, children){
    var fragment = document.createDocumentFragment();
    children.forEach(function(element, index, array){
        fragment.appendChild(element);
    });

    parent.appendChild(fragment);
    
}
