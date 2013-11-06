require(['lib/requirejs/domReady!', 'modules/api'], function (domReady, api) {
    'use strict';
    
    document.getElementById('submit_query').onclick = 
        api.call_search_api.bind(null, {});
    
    // If bookmarked search, send request after load
    if (window.location.hash !== ''){
        api.parse_bookmark();
    }

});
