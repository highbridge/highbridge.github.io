/*
 * history
 *  - Plugin for handling AJAX page loading via History.js
 *
 * @depends jQuery,History.js
 * @author Rachel Shelton<rshelton@highbridgecreative.com>
 * @version 1.0.0
 */
var history = {

    // Default plugin options
    defaults: {
        // Cancel ajax requests after 30 seconds
        timeout: 30000,
        // Default replacements
        // - An array of objects containing the source and destination selectors for replacements
        replacements: [{
            source: '#title',
            destination: 'title'
        }, {
            source: '.main',
            destination: '.main'
        }],
    },

    // Function to initialize the history plugin
    load: function(options) {
        history.options = $.extend({}, history.defaults, options);
        $.ajaxSetup({
            timeout: history.options.timeout
        });
        
        // Bind to all state changes
        $(window).on('statechange', function() {
            var state = History.getState();
            // Cancel any unfinished AJAX requests 
            if (history.request) {
                history.request.abort();
            }
            $(window).trigger('history-loading');
            history.request = $.get(state.url, {
                ajax: true
            }, function(response) {
                history.response = response;
                // Trigger history-loaded and pass the response data in case it needs to be handled elsewhere
                $(window).trigger('history-loaded', response);
            })
            // Automatically refresh the page when an AJAX requests time out
            .fail(function(xhr) {
                if (xhr.statusText != 'abort') {
                    window.location.reload();
                }
            });
        });

        // Event for adding pages to the browser history
        $(window).on('history-push', function(event, url) {
            History.pushState(null, null, url);
        });

        // Event which triggers this plugin to replace page content with response data
        $(window).on('history-replace', function(event, data) {
            // If override data is passed, replace the saved ajax response
            if (data) {
                history.response = data;
            }
            history.replace();
        });

        // Trigger history ready upon initialization
        $(window).trigger('history-ready');
    },

    // Function to remove this plugin
    unload: function(options) {
        delete history.options;
        delete history.response;
        $(window).off('statechange history-push history-replace');
    },

    // Function to replace elements on the page with loaded data
    replace: function() {
        // Only perform a replacement if we have a pending response
        if (history.response) {
            // Wrap the entire response in a div, so we can always use .find()
            var response = $("<div>" + history.response + "</div>");
            for (var i = 0, l = history.options.replacements.length; i < l; i++) {
                var replacement = history.options.replacements[i];
                var content = response.find(replacement.source).html();
                if (content) {
                    // Perform replacement if content exists
                    $(replacement.destination).html(content);
                } else {
                    // Otherwise hide the element
                    $(replacement.destination).hide();
                }
            }
            // Clear saved response after performing replacement
            delete history.response;
            // Trigger history ready after making replacements so events can be rebound
            $(window).trigger('history-ready');
        }
    }
};

module.exports = {
    load: history.load,
    unload: history.unload
};
