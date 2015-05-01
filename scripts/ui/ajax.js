
// page status
var status;

// setup our Page Manager
var PageManager = require('../app/page-manager');
var pm = new PageManager();

// history-loading
//  - Remove all event listeners  
//    and begin exit transition
$(window).on('history-loading', function(event) {
    
    // unbind
    status = 'loading';
    $('body').off();
    $(window).off('resize');

    // animate out
    $('.js-loading').fadeIn();
    pm.exit();
});

// animated-out
//  - page exit transition finished
$(window).on('animated-out', function(event) {
    // Check if page is already loaded
    if(status == 'loaded') {
        // Trigger page replacement
        $(window).trigger('history-replace');
    } else {
        status = 'animated';
    }
});

// history-loaded
//  - history ajax request finished
$(window).on('history-loaded', function(event, response) {
    $('.js-ajax').css('min-height', $(window).height());
    
    // Check if animations are finished
    if(status == 'animated') {
        // Trigger page replacement
        
        $(window).trigger('history-replace');
    } else {
        status = 'loaded';
    }
});

// history-ready
//  - history-replace finished and page is ready
$(window).on('history-ready', function(event) {
    $('.js-ajax').css('min-height', $(window).height());

    // find template
    var $tmpl = $('.js-ajax').find('.js-template');
        
    // load template
    if($tmpl.length) {  

        var title = $tmpl.data('title'),
            classes = $tmpl.data('body-class'),
            description = $tmpl.data('description');
            pageId = $tmpl.data('page'),
            dataUrl = $tmpl.data('url'),
            
            // NOTE: js-no-cache has to be top level in the _.js-template for ($.filter)
            cache = $($tmpl.html()).filter('.js-no-cache').length ? false : true; 

        $('title').html(title);
        $('body').attr('class', classes);
        $('meta[name="description"]').attr('content', description);

        pm.enter(pageId, $tmpl.html(), dataUrl, cache);
    }
});

// animated-in
//  - animate in completed, page fully ready
//    bind events and init plugins, etc...
$(window).on('animated-in', function(event){
    // --- bind events dependent on DOM --- //

    // bind ajax button clicks
    $('body').on('click', 'a', function(event) {
        if ($(this).data('ajax') !== undefined) {
            event.preventDefault();
            var url = $(this).attr('href');
            $(window).trigger('history-push', url);
        }
    });

    // trigger ajax ready for 
    // all includes to bind to
    $('.js-loading').fadeOut();
    $(window).trigger('ajax-ready');
    
});
