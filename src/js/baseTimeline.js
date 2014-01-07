(function ($) {

    $.widget("wellcome.timeline_baseTimeline", {

        currentIndex: -1,
        isFullScreen: false,

        _create: function () {
            var self = this;

            // store global reference to plugin.
            $.wellcome.timeline = self;
            self.provider = self.options.provider;

            // global events
            self.RESIZE = "onResize";
            self.TOGGLE_FULLSCREEN = "onToggleFullScreen";
            self.ZOOM_IN = "onZoomIn";
            self.ZOOM_OUT = "onZoomOut";
            self.START_ZOOM = "onStartZoom";
            self.FINISH_ZOOM = "onFinishZoom";
            self.START_SCROLL = "onStartScroll";
            self.SCROLL_STEP = "onScrollStep";
            self.FINISH_SCROLL = "onFinishScroll";
            self.START_NAVIGATING = "onStartNavigating";
            self.FINISH_NAVIGATING = "onFinishNavigating";
            self.START_INDEX_CHANGE = "onStartIndexChange";
            self.FINISH_INDEX_CHANGE = "onFinishIndexChange";
            self.SHOW_GENERIC_DIALOGUE = "onShowGenericDialogue";
            self.HIDE_GENERIC_DIALOGUE = "onHideGenericDialogue";
            self.SHOW_EMBED_DIALOGUE = "onShowEmbedDialogue";
            self.HIDE_EMBED_DIALOGUE = "onHideEmbedDialogue";
            self.SHOW_HELP_DIALOGUE = "onShowHelpDialogue";
            self.HIDE_HELP_DIALOGUE = "onHideHelpDialogue";
            self.SHOW_EVENT_DETAILS_DIALOGUE = "onShowEventDetailsDialogue";
            self.HIDE_EVENT_DETAILS_DIALOGUE = "onHideEventDetailsDialogue";
            self.RETURN = "onReturn";
            self.ESCAPE = "onEscape";
            self.REDIRECT = "onRedirect";
            self.CLOSE_ACTIVE_DIALOGUE = "onCloseActiveDialogue";
            self.REFRESHED = "onRefreshed";

            // bind to global events.
            $.wellcome.timeline.bind($.wellcome.timeline.ESCAPE, function () {
                if (self.isFullScreen) {
                    self._toggleFullScreen();
                }
            });

            // communication with parent frame.
            self.socket = new easyXDM.Socket({
                onMessage: function (message, origin) {
                    message = $.parseJSON(message);
                    self.handleParentFrameEvent(message);
                }
            });

            // ui event handlers.
            $(window).resize(function () {
                self._resize();
            });

            // track unload
            $(window).bind('unload', function() {
                //$.wellcome.timeline.trackAction("Documents", "Unloaded");
            });

            // add classes.
            if (!self.options.isHomeDomain) self.element.addClass('embedded');

            // keyboard events.
            $(document).keyup(function(e) {
                if (e.keyCode === 27) self._trigger(self.ESCAPE);
                if (e.keyCode === 13) self._trigger(self.RETURN);
            });

            // mouse position.
            $(document).mousemove(function (e) {
                self.mouseX = e.pageX;
                self.mouseY = e.pageY;
            });

            if (!self.options.isHomeDomain){
                trackVariable(2, 'Timeline Embedded', self.options.url, 2);
            }
        },

        changeIndex: function (index) {
            var self = this;

            if (index < -1) return;
            if (index > self.provider.data.Events.length - 1) return;

            self.lastIndex = self.currentIndex;
            self._deselectCurrentEvent();
            self.currentIndex = index;

            self._trigger(self.START_INDEX_CHANGE, index);
            self._trigger(self.SHOW_EVENT_DETAILS_DIALOGUE);

            var eventId = "0";

            if (index != -1) {
                eventId = $.wellcome.timeline.getEventByIndex(index).EventId;
            }

            self.setAddress(eventId);
        },

        viewEvent: function(eventId) {
            var self = this;

            for (var i = 0, l = self.provider.data.Events.length; i < l; i++) {
                var evnt = self.provider.data.Events[i];

                if (evnt.EventId == eventId) {
                    // give IE a bit of breathing room...
                    setTimeout(function () {
                        self.changeIndex(i);
                    }, 100);

                    break;
                }
            }
        },

        getView: function (name) {
            var self = this;
            return self.element.timeline_shell('getView', name);
        },

        getAbsoluteUrl: function () {
            return $.address.baseURL() + '#' + $.address.path();
        },

        getRelativeUrl: function () {
            var self = this;

            var absUri = self.getAbsoluteUrl();
            var parts = getUrlParts(absUri);
            var relUri = parts.pathname + '#' + $.address.path();

            if (!relUri.startsWith("/")) {
                relUri = "/" + relUri;
            }

            return relUri;
        },

        // non-destructive address update.
        updateAddress: function () {
            var self = this;

            if (!self.urlParamsEnabled()) return;

            var args = Array.prototype.slice.call(arguments);

            var currentPathNames = $.address.pathNames();
            var length = Math.max(args.length, currentPathNames.length);
            var newPathNames = new Array(length);

            // construct a new pathnames array containing the old pathnames, but with
            // a length to accommodate new args.
            for (var i = 0; i < currentPathNames.length; i++) {
                newPathNames[i] = currentPathNames[i];
            }

            for (i = 0; i < args.length; i++) {
                newPathNames[i] = args[i];
            }

            // serialise pathNames.
            var hash = '#';

            for (i = 0; i < length; i++) {
                hash += newPathNames[i];

                if (i != length - 1) hash += '/';
            }

            self.updateParentHash(hash);
        },

        // destructive address update.
        setAddress: function () {
            var self = this;

            if (!self.urlParamsEnabled()) return;

            var args = Array.prototype.slice.call(arguments);

            var hash = '#';

            for (var i = 0; i < args.length; i++) {
                hash += args[i];

                if (i != args.length - 1) hash += '/';
            }

            self.updateParentHash(hash);
        },

        updateParentHash: function (hash) {

            var url = window.parent.document.URL;

            // remove hash value (if present).
            var index = url.indexOf('#');

            if (index != -1) {
                url = url.substr(0, url.indexOf('#'));
            }

            window.parent.document.location.replace(url + hash);
        },

        // helper for binding views to global events.
        bind: function (eventName, handler) {
            var self = this;

            self.element.bind(eventName, handler);
        },

        // trigger a global event.
        _trigger: function (eventName, eventObject) {
            var self = this;

            self.element.trigger(eventName, eventObject);
        },

        // trigger a socket event.
        triggerSocket: function (eventName, eventObject) {
            var self = this;

            if (self.socket) {
                self.socket.postMessage(JSON.stringify({ eventName: eventName, eventObject: eventObject }));
            }
        },

        handleParentFrameEvent: function (message) {
            var self = this;

            switch (message.eventName) {
                case self.TOGGLE_FULLSCREEN:
                    self._trigger(self.TOGGLE_FULLSCREEN, message.eventObject);
                    break;
            }
        },

        _resize: function () {
            var self = this;

            if (self.options.enforceMinWidth) {
                if ($(window).width() >= self.options.minWidth) {
                    self._trigger(self.RESIZE);
                }
            } else {
                self._trigger(self.RESIZE);
            }
        },

        redirect: function (uri) {
            var self = this;

            self.triggerSocket(self.REDIRECT, uri);
        },

        isEmbedEnabled: function () {
            var self = this;

            return self.options.config.Settings.EmbedEnabled !== "false";
        },

        urlParamsEnabled: function () {
            var self = this;

            return (self.options.isHomeDomain !== "false" && self.options.isOnlyInstance !== "false");
        },

        _toggleFullScreen: function () {
            var self = this;

            self.isFullScreen = !self.isFullScreen;
            self.triggerSocket(self.TOGGLE_FULLSCREEN, self.isFullScreen);
        },

        // dialogues.

        closeActiveDialogue: function () {
            var self = this;

            self._trigger(self.CLOSE_ACTIVE_DIALOGUE);
        },

        showDialogue: function (message, acceptCallback) {
            var self = this;

            self._trigger(self.SHOW_GENERIC_DIALOGUE,
                {
                    message: message,
                    acceptCallback: acceptCallback
                });
        },

        embed: function () {
            var self = this;

            self._trigger(self.SHOW_EMBED_DIALOGUE);
        },

        help: function () {
            var self = this;

            self._trigger(self.SHOW_HELP_DIALOGUE);
        }
    });

})(jQuery);
