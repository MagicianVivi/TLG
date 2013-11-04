require(['lib/requirejs/domReady!', 'modules/api'], function (domReady, api) {
    'use strict';
    
    document.getElementById('submit_query').onclick = api.call_search_api;

    // If bookmarked search, send request after load
    if (window.location.hash !== ''){
        document.getElementById('search_field').value = api.unformat_hash();
        api.call_search_api();
    }

});
