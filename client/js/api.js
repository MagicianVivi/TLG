var api = (function(){

    function get_query_string(search_field_id){
        var search_field = document.getElementById(search_field_id);
        return "q=" + search_field.value.trim().replace(/\s+/g,"+");
    }

    function update_hash(hash_string){
        window.location.hash = hash_string;
    }

    function format_search_result(element){
        var result_div = document.createElement('div');
        result_div.className = 'result';
        result_div.textContent = element.full_name;
        result_div.onclick = function(){api.call_repo_api(element.url + "/")};

        return result_div
    }

    function append_children(parent, children){
        var fragment = document.createDocumentFragment();
        children.forEach(function(element, index, array){
            fragment.appendChild(element);
        });

        parent.appendChild(fragment);
        
    }

    function display_search_results(json){
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


    function call_search_api(){
        var query_string = get_query_string("search_field")
        update_hash("/" + query_string);
        d3.json(
            "http://localhost:5000/search?" + query_string,
            function(error,data){
                if (data === undefined){
                    alert("Error: the search request did not work, please try again");
                } else {
                    display_search_results(data);
                }
            }
        );
    }

    function call_repo_api(url){
        d3.json(
            "http://localhost:5000/repository?url=" + url,
            function(error,data){
                if (data === undefined){
                    alert("Error: the repository request did not work, please try again");
                } else {
                    console.log(data);
                }
            }
        );
    }
    
    return {
        call_search_api:call_search_api,
        call_repo_api:call_repo_api
    };
    
}());
