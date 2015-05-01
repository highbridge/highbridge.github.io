
/** 
 * PageManager
 *  - manages creating new pages via underscore templating
 *    with template/asset caching and page transition animations
 *
 * @author Michael Roth <mroth@highbridgecreative.com>
 * @version 1.0.0
 */
var PageManager = function(params) {

    // instance vars
    this.pages = {};
    this.currentPage = '';

    /** 
     * Page
     *  - a page object used 
     *    to create a new page
     */
    this.Page = function(params) {

        this.id = params.id; // page id
        this.contents = params.contents; // page raw html contents
        this.template = null; // the page _.template
        this.data = {}; // page data passed in to render the template
        this.dataUrl = params.dataUrl || ''; // url for this pages json data
        this.cache = (typeof(params.cache) !== 'undefined') ? params.cache : true; // data caching

        // initialize this page
        this.init();
    };

    /*
     * init
     * - initializes a page
     */
    this.Page.prototype.init = function(){
        // initialize this page
        var self = this;

        // get data and render the template
        if(self.dataUrl) {
            // get the data from the ajax url
            $.getJSON(self.dataUrl).always(function(data, status, xhr){
                self.data = data;
                self.render();
            });
        } else {
            // no data associated with this 
            // page render the contents
            self.render();
        }
    };

    /*
     * render
     * - renders a page
     */
    this.Page.prototype.render = function() {
        var self = this;

        // render this page
        if(self.template && self.cache) {
            // load the cached assets
            $('.js-ajax').html(self.template(self.data));
            // animate in
            self.in();
        } else {
            self.template = _.template(self.contents);

            // check children
            var loaded = 0;
            var $modules = $(self.contents).find('[data-module]');
            if($modules.length) {

                // loop through and load the 
                // data for this pages modules
                var loaded = 0;
                $modules.each(function(){
                    var modDataUrl = $(this).data('url');
                    var modName = $(this).data('module');

                    // check if we already  
                    // loaded this modules data
                    if(typeof(self.data[modName]) !== 'undefined' && self.cache) {
                        loaded++;

                        // all modules have loaded
                        // - load in the template
                        if(loaded == $modules.length) {
                            $('.js-ajax').html(self.template(self.data));

                            // animate in
                            self.in();
                        }
                    } else {
                        // get data from ajax url
                        self.data[modName] = [];
                        $.getJSON(modDataUrl).always(function(data,status,xhr){
                            self.data[modName] = data;
                            loaded++;

                            // all modules have loaded
                            // - load in the template
                            if(loaded == $modules.length) {
                                $('.js-ajax').html(self.template(self.data));

                                // animate in
                                 self.in();
                            }
                        });
                    }
                });
                
            } else {
                // then load this template
                $('.js-ajax').html(self.template(self.data));

                // animate in
                //$('.js-ajax').imagesLoaded().always(function(){
                    self.in();
                //});
            }

        }
    };

    /*
     * in
     * - page animate in
     */
    this.Page.prototype.in = function(){
        // animation items
        var $items = $('[data-anim]');
        var delay = 0;

        if($items.length == 0) {
            setTimeout(function(){
                $(window).trigger('animated-in');
            }, 200);
        } else {
            $items.each(function(){
                var anim = $(this).data('anim');
                delay += 0.05;

                switch(anim) {
                    case 'fade':
                        TweenLite.fromTo(this, 0.7, {y : -50, opacity: 0}, {delay : delay, y : 0, opacity: 1});
                        break;
                    case 'left':
                        TweenLite.fromTo(this, 0.7, {x : -1000, opacity: 0}, {delay : delay, x : 0, opacity: 1});
                        break;
                    case 'right':
                        TweenLite.fromTo(this, 0.7, {x : 1000, opacity: 0}, {delay : delay, x : 0, opacity: 1});
                        break;
                    default:
                        TweenLite.fromTo(this, 0.7, {y : -50, opacity: 0}, {delay : delay, y : 0, opacity: 1});
                        break;
                }
            });

            setTimeout(function(){
                 $(window).trigger('animated-in');
            }, (delay*1000) + 700);
        }
    };

    /*
     * out
     * - page animate out
     */
    this.Page.prototype.out = function(){
        // animation items
        var $items = $('[data-anim]');
        var delay = 0;

        if($items.length == 0) {
            setTimeout(function(){
                $(window).trigger('animated-out');
            }, 200);
        } else {
            $items.each(function(){
                var anim = $(this).data('anim');
                //delay += 0.1;

                switch(anim) {
                    case 'fade':
                        TweenLite.fromTo(this, 0.7, {y : 0, opacity: 1}, {delay : delay, y : -50, opacity: 0});
                        break;
                    case 'left':
                        TweenLite.fromTo(this, 0.7, {x : 0, opacity: 1}, {delay : delay, x : -1000, opacity: 0});
                        break;
                    case 'right':
                        TweenLite.fromTo(this, 0.7, {x : 0, opacity: 1}, {delay : delay, x : 1000, opacity: 0});
                        break;
                    default:
                        TweenLite.fromTo(this, 0.7, {y : 0, opacity: 1}, {delay : delay, y : -50, opacity: 0});
                        break;
                }
            });

            setTimeout(function(){
                 $(window).trigger('animated-out');
            }, (delay*1000) + 700);
        }
    };

};

/* 
 * exit
 *  - current page transition out
 */
PageManager.prototype.exit = function() { 
    // check if we have a current page
    if(this.currentPage) {
        this.pages[this.currentPage].out();
    } 
    // just trigger animated out
    else {
        $(window).trigger('animated-out');
    }
    
};

/* 
 * enter
 *  - page transition in
 *
 * @param {string} id
 * @param {string} contents
 * @param {string} dataUrl
 */
PageManager.prototype.enter = function(id, contents, dataUrl, cache) { 
    this.currentPage = id;

    // render the next page
    if(this.pages[id]) {
        this.pages[id].contents = contents;
        this.pages[id].dataUrl = dataUrl;
        this.pages[id].cache = cache;
        this.pages[id].render();
    } else {
        this.pages[id] = new this.Page({
            id : id,
            contents : contents,
            dataUrl : dataUrl,
            cache : cache
        });
    }

};

// Return PageManager module
module.exports = PageManager;
