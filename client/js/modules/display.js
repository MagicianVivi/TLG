define(['../lib/chartjs/Chart'], function (chart) {
    'use strict';
    
    function remove_children(parent) {
        while (parent.lastChild) {
            parent.removeChild(parent.lastChild);
        }
    }

    function create_fragment_from_array(array) {
        var fragment = document.createDocumentFragment();
        array.forEach(function (element) {
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
        var result_array = [],
        items = json.items,
        results_div = document.getElementById('search_results');

        items.forEach(function (element, index) {
            result_array.push(format_search_result(element, index, onclick));
        });

        remove_children(results_div);

        results_div.appendChild(create_fragment_from_array(result_array));
    }

    function extract_username(url) {
        return url.slice(url.lastIndexOf("/") + 1);
    }

    function format_contributor(contributor, index){
        var contributor_li = document.createElement('li');
        contributor_li.className = 'contributor';
        contributor_li.id = 'contributor' + index;
        contributor_li.textContent = extract_username(contributor);
        contributor_li.setAttribute('data', contributor);
        
        return contributor_li;
    }

    function get_month_name(month) {
        var names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
                     'Sep', 'Oct', 'Nov', 'Dec'];

        return names[month];
    }
    
    function make_label(month_year) {
        var split = month_year.split(' ');            
        return get_month_name(split[0]) + ' ' + split[1];
    }

    function parse_int(element) {
        return parseInt(element, 10);
    }

    function sort_labels(a, b) {
        var split_a = a.split(' ').map(parse_int);
        var split_b = b.split(' ').map(parse_int);
        
        // index 0 is the month from 0 to 11, index 1 is the full year
        if (split_a[1] > split_b[1]) {
            return 1;
        }
        if (split_a[1] < split_b[1]) {
            return -1;
        }
        if (split_a[0] > split_b[0]) {
            return 1;
        }
        if (split_a[0] < split_b[0]) {
            return -1;
        }
        return 0;
    }

    function format_timeline_data(commits){
        var tmp_obj = {},
        returned_data = {},
        date,
        month_year,
        sorted_keys,
        data = [];

        for (var key in commits){
            commits[key].forEach( function (element) {
                date = new Date(Date.parse(element));
                month_year = date.getMonth() + ' ' + date.getFullYear();
                if (tmp_obj.hasOwnProperty(month_year)) {
                    tmp_obj[month_year] += 1;
                } else {
                    tmp_obj[month_year] = 1;
                }
            });
        }
        
        sorted_keys = Object.keys(tmp_obj).sort(sort_labels);
        sorted_keys.forEach(function (element) {
                data.push(tmp_obj[element]);
        })

        returned_data.datasets = [{
            fillColor : "rgba(151,187,205,0.5)",
			      strokeColor : "rgba(151,187,205,1)",
            data : data
        }];

        returned_data.labels = sorted_keys.map(make_label);

        return returned_data;
    }

    function display_timeline(commits) {
        var canvas = document.createElement('canvas');
        canvas.id = 'chart2';
        canvas.width = '500';
        canvas.height = '500';
        var ctx = canvas.getContext('2d');
        var data = format_timeline_data(commits);

        new Chart(ctx).Bar(data);
        document.body.appendChild(canvas);
    }

    function display_contributors_impact(commits) {
        var canvas = document.createElement('canvas');
        canvas.id = 'myChart';
        canvas.width = '500';
        canvas.height = '500';
        var color = function () {
            return '#'+Math.floor(Math.random()*16777215).toString(16);
        };
        var ctx = canvas.getContext('2d');
        var data = []

        for(var key in commits) {
           data.push({
               value: commits[key].length,
               color: color(),
               label: extract_username(key)
           }); 
        }

        new Chart(ctx).Pie(data);
        document.body.appendChild(canvas);
    }

    function display_contributors_list(contributors){
        var list,
        li_array = [];
        
        contributors.forEach(function (element, index) {
            li_array.push(format_contributor(element, index));
        });

        // sort array by username
        li_array.sort(function (a, b) {
            if (a.textContent.toLowerCase() > b.textContent.toLowerCase()) {
                return 1;
            }
            if (a.textContent.toLowerCase() < b.textContent.toLowerCase()) {
                return -1;
            }
            return 0;
        });

        list = document.createElement('ul');
        list.appendChild(create_fragment_from_array(li_array));
        
        document.body.appendChild(list)
    }

    function display_repository_results(json) {
        display_timeline(json.commits);
        display_contributors_impact(json.commits);
        display_contributors_list(json.contributors);
    }

    return {
        search_results: display_search_results,
        repository_results: display_repository_results
    };
});
