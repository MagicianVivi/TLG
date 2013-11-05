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

    function format_tag(tag, id, class_name, text, onclick){
        var result = document.createElement(tag);
        result.id = id;
        result.className = class_name;
        result.textContent = text;

        if (onclick !== undefined) {
            result.addEventListener('click', onclick, false);
        }

        return result;
    }

    function display_search_results(onclick, json) {
        var result_array = [],
        items = json.items,
        results_div = document.getElementById('search_results');

        items.forEach(function (element, index) {
            var class_name = 'result',
            bound_onclick = onclick.bind(null, element.url);

            result_array.push(format_tag('div', class_name + index,
                                         class_name, element.full_name,
                                         bound_onclick));
        });

        remove_children(results_div);

        results_div.appendChild(create_fragment_from_array(result_array));
    }

    function extract_username(url) {
        return url.slice(url.lastIndexOf("/") + 1);
    }

    function prepare_chart(id, width, height) {
        var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

        canvas.id = id;
        canvas.width = width;
        canvas.height = height;

        document.body.appendChild(canvas);

        return new Chart(ctx);
    }

    function display_timeline(commits) {

        function format_timeline_data(commits){

            function get_month_name(month) {
                var names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 
                             'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                return names[month];
            }
            
            function make_label(month_year) {
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

            prepare_chart('timeline_canvas', '1000', '500').Bar(data, options);
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

        prepare_chart('impact_canvas', '500', '500').Pie(data);
        
    }

    function display_contributors_list(contributors){

        function sort_by_username(a, b) {
            if (a.textContent.toLowerCase() > b.textContent.toLowerCase()) {
                return 1;
            }
            if (a.textContent.toLowerCase() < b.textContent.toLowerCase()) {
                return -1;
            }

            return 0;
        }

        var list,
        li_array = [];

        contributors.forEach(function (element, index) {
            var class_name = 'contributor';
            li_array.push(format_tag('li', class_name + index, class_name, 
                                     extract_username(element)));
        });

        li_array.sort(sort_by_username);

        list = document.createElement('ul');
        list.appendChild(create_fragment_from_array(li_array));
        
        document.body.appendChild(list);
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
