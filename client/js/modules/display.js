define(['../lib/chartjs/Chart'], function (chart) {
    'use strict';

    var results_id = 'results',
    contributors_id = 'contributors',
    timeline_id = 'timeline_canvas',
    impact_id = 'impact_canvas',
    charts_id = 'charts';

    function hide(id) {
        document.getElementById(id).className = 'hidden';
    }

    function unhide(id) {
        document.getElementById(id).className = '';
    }

    function create_fragment_from_array(array) {
        var fragment = document.createDocumentFragment();
        array.forEach(function (element) {
            fragment.appendChild(element);
        });

        return fragment;
    }

    function format_tag(tag, id, class_name){
        var result = document.createElement(tag);
        result.id = id;
        result.className = class_name;

        if (onclick !== undefined) {
            result.addEventListener('click', onclick, false);
        }

        return result;
    }

    function display_search_results(onclick, json) {

        function remove_children(parent) {
            while (parent.lastChild) {
                parent.removeChild(parent.lastChild);
            }
        }

        var result_array = [],
        items = json.items,
        results_div = document.getElementById(results_id),
        tmp_node,
        header,
        description;

        items.forEach(function (element, index) {
            var class_name = 'result',
            bound_onclick = onclick.bind(null, element.url);

            header = document.createElement('h3');
            header.textContent = element.full_name;
            description = document.createElement('p');
            description.textContent = element.description;

            tmp_node = format_tag('div', class_name + index, class_name);
            tmp_node.addEventListener('click', bound_onclick, false);
            
            tmp_node.appendChild(header);
            tmp_node.appendChild(description);
            
            result_array.push(tmp_node);
        });

        remove_children(results_div);

        results_div.appendChild(create_fragment_from_array(result_array));
        
        hide(contributors_id);
        hide(charts_id);
        unhide(results_id);
    }

    function extract_username(url) {
        return url.slice(url.lastIndexOf("/") + 1);
    }

    function prepare_chart(id) {
        var canvas = document.getElementById(id),
        ctx = canvas.getContext('2d');

        return new Chart(ctx);
    }

    function display_timeline(commits) {

        function format_timeline_data(commits){
            
            function make_label(month_year) {

                function get_month_name(month) {
                    var names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                    return names[month];
                }

                var split = month_year.split(' ');            
                return get_month_name(split[0]) + ' ' + split[1];
            }

            function sort_labels(a, b) {
                
                function parse_int(element) {
                    return parseInt(element, 10);
                }

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
            sorted_keys.forEach(function (key) {
                data.push(tmp_obj[key]);
            })

            returned_data.datasets = [{
                fillColor : '#F38630',
			          strokeColor : '#F38630',
                data : data
            }];

            returned_data.labels = sorted_keys.map(make_label);

            return returned_data;
        }

        function draw_timeline(data){
            var options = {
                scaleShowGridLines: false,
                /*
                  Even with integer value the string representation can be
                  in floating point notation…
                */
                scaleLabel: '<%=value.split(".")[0]%>',
                scaleFontSize: 9
            };

            prepare_chart(timeline_id).Bar(data, options);
        }

        draw_timeline(format_timeline_data(commits));
    }

    function display_contributors_impact(commits) {
        
        function color(i) {
            var color_array = ['#F38630', '#E0E4CC', '#69D2E7'];
            return color_array[i % color_array.length];
        }

        var data = [],
        key,
        i = 0;

        for(key in commits) {
           data.push({
               value: commits[key].length,
               color: color(i),
               label: extract_username(key)
           }); 
           i++;
        }

        prepare_chart(impact_id).Pie(data);
    }

    function display_contributors_list(json){

        function sort_by_username(a, b) {
            if (a.textContent.toLowerCase() > b.textContent.toLowerCase()) {
                return 1;
            }
            if (a.textContent.toLowerCase() < b.textContent.toLowerCase()) {
                return -1;
            }

            return 0;
        }

        var contributors_list,
        contributors_array = [],
        tmp_node;

        json.contributors.forEach(function (element, index) {
            var class_name = 'contributor';

            tmp_node = format_tag('div', class_name + index, class_name);
            tmp_node.textContent = extract_username(element);

            contributors_array.push(tmp_node);
        });

        contributors_array.sort(sort_by_username);

        contributors_list = document.getElementById(contributors_id);
        contributors_list.appendChild(
            create_fragment_from_array(contributors_array));        
        
        hide(results_id);
        unhide(contributors_id);
    }

    function display_commits_results(json) {
        display_timeline(json.commits);
        display_contributors_impact(json.commits);
        hide(results_id);
        unhide(charts_id);
    }

    return {
        search_results: display_search_results,
        commits_results: display_commits_results,
        contributors_list: display_contributors_list
    };
});
