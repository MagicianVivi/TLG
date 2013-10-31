function get_query_string(search_field_id){
    var search_field = document.getElementById(search_field_id);
    return "q=" + search_field.value.trim().replace(/\s+/g,"+");
}

function update_hash(hash_string){
    window.location.hash = hash_string;
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
                display_results(data);
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

