// --- main --- //

// avoid doing anything on older browsers
if(!document.addEventListener) return false;

// load History
var history = require("./plugins/history");

// load everything else
require("./ui/ajax");
require("./ui/general");

// init
$(document).ready(function() {
    
    // init history js
    history.load({
        replacements: [
            // TODO title, description, en/fr switch
            {source : '.js-ajax', destination : '.js-ajax'}
        ]
    });

});