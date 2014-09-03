/**
 * jQuery UI-Popup component
 * @author Denis Izmaylov <izmaylov.dm@gmail.com>
 * @date 2013-09-03
 *
 * Usage:
 * 1. Create:
 *    $(elem).UIPopup({
 *      target: $('<div class="panel">My slow popup</div>'),
 *      timeout: 3000
 *    });
 *
 * 2. Read:
 *    $(elem).UIPopup('open');
 *    // => false
 *
 * 3. Update:
 *    $(elem).UIPopup('open', true);
 *    $(elem).UIPopup({
 *      position: 'top',
 *      openClass: 'visible',
 *      target: '#mySliderPanel'
 *    });
 *
 * 4. Destroy:
 *    $(elem).UIPopup('destroy');
 *
 * 5. Events:
 *    $(elem).on('open', function (event) { ... }); // when target open state turns on
 *    $(elem).on('close', function (event) { ... }); // when target open state turns off
 */

;(function (factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {

        // AMD. Register as an anonymous module
        define(['jquery'], factory);

    } else if (typeof exports === 'object') {

        // NodeJS / CommonJS
        factory(require('jquery'));

    } else {

        // Browser globals
        factory(jQuery);
    }

})(function ($) {

    'use strict';

    var PLUGIN_NAME = 'UIPopup',

        /**
         * Default component options,
         * you can override it via component constructor
         * @type {Object}
         */
        defaultOptions = {

            open: false,
            openClass: 'open',
            timeout: 1000,
            target: undefined,

            position: 'bottom', // only if target is a detached DOM element
            closeByTarget: false,
            closeByWindow: true

        }, // defaultOptions {...}



        /** @type {ComponentInstance[]} */
        componentInstances = [],


        ComponentPrototype = {

            /**
             * Create DOM elements, attach event handlers, etc
             * @param {Object} options
             */
            create: function (options) {

                this._onMouseOver = this.onMouseOver.bind(this);
                this._onMouseOut = this.onMouseOut.bind(this);

                // to support touch devices:

                // this._onTargetClick = this.onTargetClick.bind(this);
                // this._onOwnerTouchStart = this.onOwnerTouchStart.bind(this);
                // this._onWindowTouchStart = this.onWindowTouchStart.bind(this);



                /**
                 * Bind event handlers
                 */
                this.owner
                    .on('mouseover', this._onMouseOver)
                    .on('mouseout', this._onMouseOut);

                //$(window).on('touchstart', this._onWindowTouchStart);


                /**
                 * Assign specified options
                 */
                this.update(options);

                if (!options.target &&
                    this.owner.data('target')) {

                    this.setOption('target', this.owner.data('target'));
                }

            }, // create()


            /**
             * Detach event handlers
             */
            destroy: function () {

                this.setOption('target', '');

                this.owner
                    .off('mouseout', this._onMouseOut)
                    .off('mouseover', this._onMouseOver);

            }, // destroy()


            /**
             * Calls when the user tries to update component options
             * @param {Object} options
             */
            update: function (options) {

                for (var key in options) {
                    if (!options.hasOwnProperty(key)) continue;

                    this.setOption(key, options[key]);
                }

            }, // update()


            /**
             * @param {String} name
             * @param {*} value
             * @todo we can extract DOM operations to external method
             */
            setOption: function (name, value) {

                var previousValue = this.options[name];

                this.options[name] = value;


                switch (name) {

                    case 'target':

                        var newTargetObj;

                        if (value instanceof $) {

                            newTargetObj = value;

                        } else if (typeof value === 'string') {

                            newTargetObj = $(value);
                        }


                        if (this.targetObj) {

                            this.targetObj
                                .off('mouseover', this._onMouseOver)
                                .off('mouseout', this._onMouseOut);
                        }

                        if (newTargetObj) {

                            newTargetObj
                                .on('mouseover', this._onMouseOver)
                                .on('mouseout', this._onMouseOut);

                            this.targetObj = newTargetObj;
                        }

                        break;


                    case 'open':

                        if (this.targetObj) {

                            this.targetObj.toggleClass(this.options.openClass, value);

                            // we can handle position property here
                            // but for we have to dettach/attach object
                            // to body element before

                            this.owner.trigger(value ? 'open' : 'close');
                        }

                        break;

                } // switch (...)

            }, // setOption()


            /**
             * @param {String} name
             * @returns {*}
             */
            getOption: function (name) {

                var result = this.options[name];

                return result;

            }, // getOption()


            /*
             * Snippet:
             * Repairs jquery event object to support iPhone and iPad events
             * @param {Object} [event] jQuery event
             */
            prepareJQueryTouchEvent: function (event) {

                var originalEvent = event.originalEvent || event;

                if (originalEvent.targetTouches && originalEvent.targetTouches[0]) {

                    event.pageX = originalEvent.targetTouches[0].pageX;
                    event.pageY = originalEvent.targetTouches[0].pageY;
                }

                if (typeof originalEvent.preventDefault == 'function' &&
                    typeof event.stopPropagation != 'function') {

                    event.stopPropagation = originalEvent.preventDefault.bind(originalEvent);
                }

            }, // prepareJQueryTouchEvent()


            onMouseOver: function () {

                clearTimeout(this.closeTimer);

                this.setOption('open', true);

            }, // onMouseOver()


            onMouseOut: function () {

                clearTimeout(this.closeTimer);

                this.closeTimer = setTimeout(
                    this.setOption.bind(this, 'open', false),
                    this.options.timeout
                );

            } // onMouseOut()

        }, // ComponentPrototype {...}



        /**
         * Component instance constructor,
         * will be placed at <componentInstances>
         * @param {jQuery} [owner]
         * @param {Object} [options]
         * @constructor
         */
        ComponentInstance = function (owner, options) {

            /** @type {jQuery} */
            this.owner = owner;

            /** @type {Object} */
            this.options = {};


            this.create(
                $.extend({}, defaultOptions, options)
            );

        }; // ComponentInstance()


    $.extend(ComponentInstance.prototype, ComponentPrototype);



    /**
     * jQuery Plugin Interface layer
     * @param {String|Object} [param] action name (i.e. 'destroy') or params to update
     * @this {jQuery}
     */
    $.fn[PLUGIN_NAME] = function (param) {

        var result,
            action = (typeof param === 'string') ? param : 'create',
            options = (typeof param === 'object') ? param : arguments[1];


        // Process each element
        this.each(function () {

            var $this = $(this);

            /**
             * Try to find a component instance for this element,
             * also update <action> in successful ('create' --> 'update')
             */
            var currentInstance,
                currentIndex;

            for (var index = 0, length = componentInstances.length;
                index < length; index++) {

                if (componentInstances[index].owner.is($this)) {

                    currentInstance = componentInstances[index];
                    currentIndex    = index;

                    if (action === 'create') {

                        action = 'update';
                    }

                    break;
                }
            }



            /**
             * Process basic actions ('create', 'update', 'destroy')
             */
            switch (action) {

                case 'create':

                    currentInstance = new ComponentInstance(
                        $this,
                        $.extend({}, options) // copy defaults options and override it by specified
                    );

                    componentInstances.push(currentInstance);

                    break;



                case 'update':

                    if (currentInstance) {

                        currentInstance.update(options);
                    }

                    break;



                case 'destroy':

                    if (currentIndex) {

                        currentInstance.destroy();

                        componentInstances.splice(currentIndex, 1);
                    }

                    break;



                default:

                    if (currentInstance) {

                        if (typeof currentInstance[action] === 'function') {

                            result = currentInstance[action](options);

                        } else {

                            result = currentInstance.options[action];

                            if (typeof options !== 'undefined') {

                                currentInstance.setOption(action, options);
                            }
                        }
                    }

                    break;

            } // switch (action)

        });


        return (typeof result !== 'undefined') ? result : this;

    }; // $.fn[PLUGIN_NAME]()

});