(function ($) {

    $.widget("wellcome.timeline", $.wellcome.timeline_baseTimeline, {

        _create: function () {

            var self = this;

            $.wellcome.timeline_baseTimeline.prototype._create.call(self);

            // create shell.
            self.element.timeline_shell(
            {
                onCloseActiveDialogue: function () {
                    $.wellcome.timeline.closeActiveDialogue();
                }
            });

            // create views.

            // header panel
            self.headerPanelView = self.getView('header');
            self.headerPanelView.timeline_headerPanelView(
            {
                onZoomIn: function () {
                    self._trigger(self.ZOOM_IN);
                },
                onZoomOut: function () {
                    self._trigger(self.ZOOM_OUT);
                }
            });

            // main panel
            self.mainPanelView = self.getView('main');
            self.mainPanelView.timeline_mainPanelView(
            {
                onSelectEvent: function (e, index) {
                    if (typeof (index) == "object") index = 0;
                    self.changeIndex(index);
                },
                onSelectEventComplete: function (e, index) {
                    if (typeof (index) == "object") index = 0;
                    self._trigger(self.FINISH_INDEX_CHANGE, index);
                },
                onStartZoom: function () {
                    self._trigger(self.START_ZOOM);
                },
                onFinishZoom: function () {
                    self._trigger(self.FINISH_ZOOM);
                },
                onStartScroll: function (e, direction) {
                    self._trigger(self.START_SCROLL, direction);
                },
                onScrollStep: function (e, obj) {
                    self._trigger(self.SCROLL_STEP, { direction: obj.direction, pos: obj.pos });
                },
                onFinishScroll: function (e, direction) {
                    self._trigger(self.FINISH_SCROLL, direction);
                },
                onStartNavigating: function () {
                    self._trigger(self.START_NAVIGATING);
                },
                onFinishNavigating: function () {
                    self._trigger(self.FINISH_NAVIGATING);
                },
                onRefreshed: function() {
                    self._trigger(self.REFRESHED);
                }
            });

            // footer panel
            self.footerPanelView = self.getView('footer');
            self.footerPanelView.timeline_footerPanelView(
            {
                onToggleFullScreen: function () {
                    self._toggleFullScreen();
                },
                onEmbed: function () {
                    self.embed();
                }
            });

            // details view 
            self.detailsView = self.getView('details');
            self.detailsView.timeline_detailsView(
            {
                onClose: function () {
                    self._deselectCurrentEvent();
                    self._trigger(self.HIDE_EVENT_DETAILS_DIALOGUE);
                },
                onSelectPrev: function () {
                    var newIndex = self.currentIndex - 1;

                    self.changeIndex(newIndex);
                },
                onSelectNext: function () {
                    var newIndex = self.currentIndex + 1;

                    self.changeIndex(newIndex);
                }
            });

            // generic dialogue view 
            self.genericDialogueView = self.getView('genericDialogue');
            self.genericDialogueView.timeline_genericDialogueView(
            {
                onClose: function () {
                    self._trigger(self.HIDE_GENERIC_DIALOGUE);
                },
                onAccept: function () {
                    self._trigger(self.HIDE_GENERIC_DIALOGUE);
                }
            });

            // embed view
            self.embedView = self.getView('embed');
            self.embedView.timeline_embedView(
            {
                onClose: function () {
                    self._trigger(self.HIDE_EMBED_DIALOGUE);
                }
            });

            // initial positioning.
            self._resize();
            
            self._getParams();
        },

        _getParams: function() {
            var self = this;
            
            // use $.address to get initial params.
            if (self.urlParamsEnabled()) {
                // disable jquery address history.
                $.address.history(true);

                var pathNames = $.address.pathNames();

                // has event id been specified?
                if (pathNames.length) {
                    var eventId = Number(pathNames[0]);

                    if (eventId != 0) {
                        self.viewEvent(eventId);
                    }
                }
            } else {
                // check if an eventid was passed in the embed code.
                if (self.options.eventId) {
                    self.viewEvent(self.options.eventId);
                }
            }
        },

        _deselectCurrentEvent: function () {
            var self = this;

            self.currentIndex = -1;

            // deselect current event.
            self.element.find('.event').removeClass('selected');
            self.element.find('.tickEvent').removeClass('selected');
        },

        getCurrentEvent: function () {
            var self = this;

            if (self.currentIndex == -1) return null;

            return self.getEventByIndex(self.currentIndex);
        },

        getEventByIndex: function (index) {
            var self = this;

            return self.provider.data.Events[index];
        },

        _init: function () {
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }
    });

})(jQuery);
