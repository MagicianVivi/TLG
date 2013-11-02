require(['domReady!', './api'], function (domReady, api) {
    'use strict';
    document.getElementById('submit_query').onclick = api.call_search_api;
});
