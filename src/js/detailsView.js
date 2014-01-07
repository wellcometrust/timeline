(function ($) {

    $.widget("wellcome.timeline_detailsView", $.wellcome.timeline_baseDialogueView, {

        isCloseEnabled: true,
        isPrevEnabled: false,
        isNextEnabled: false,
        isNavigating: false,

        options: {
            maxWidth: 950
        },

        _create: function () {
            var self = this;

            $.wellcome.timeline_baseDialogueView.prototype._create.call(self);

            self.allowClose = false;

            // bind to global events.
            $.wellcome.timeline.bind($.wellcome.timeline.START_ZOOM, function () {
                self._disableClose();
                self._disablePrev();
                self._disableNext();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.FINISH_ZOOM, function () {
                self._refresh();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.START_NAVIGATING, function (e, direction) {
                self.isNavigating = true;
            });

            $.wellcome.timeline.bind($.wellcome.timeline.FINISH_NAVIGATING, function (e, direction) {
                self.isNavigating = false;
                self._refresh();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.SHOW_EVENT_DETAILS_DIALOGUE, function () {
                self.open();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.HIDE_EVENT_DETAILS_DIALOGUE, function () {
                self.close();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.START_SCROLL, function (e, direction) {
                self._disableClose();
                self._disablePrev();
                self._disableNext();
                self._prepEvent(direction, self.events[$.wellcome.timeline.currentIndex + 1]);
            });

            $.wellcome.timeline.bind($.wellcome.timeline.SCROLL_STEP, function (e, obj) {
                self._scroll(parseInt(obj.direction), obj.pos);
            });

            $.wellcome.timeline.bind($.wellcome.timeline.FINISH_SCROLL, function (e, direction) {
                self.currentDetailsElem = self.nextDetailsElem;
                self.centerColElem.find('.wrapper').not(self.currentDetailsElem).remove();
                self.nextDetailsElem = null;
            });

            // create ui.
            self.leftColElem = $('<div class="leftCol"></div>');
            self.contentElem.append(self.leftColElem);

            self.prevBtnElem = $('<div class="prev"></div>');
            self.leftColElem.append(self.prevBtnElem);

            self.centerColElem = $('<div class="centerCol"></div>');
            self.contentElem.append(self.centerColElem);

            self.detailsTemplate = $('\
                <div class="wrapper">\
                    <div class="centerLeftCol"></div>\
                    <div class="centerRightCol">\
                        <div class="text"></div>\
                    </div>\
                </div>');

            self.rightColElem = $('<div class="rightCol"></div>');
            self.contentElem.append(self.rightColElem);

            self.nextBtnElem = $('<div class="next"></div>');
            self.rightColElem.append(self.nextBtnElem);

            // init ui.
            self.prevBtnElem.prop('title', $.wellcome.timeline.options.config.DetailsPanelView.Previous);

            self.nextBtnElem.prop('title', $.wellcome.timeline.options.config.DetailsPanelView.Next);

            self.prevBtnElem.on('click', function (e) {
                e.preventDefault();

                if (self.isPrevEnabled) {
                    // if at the first event, show intro.
                    if ($.wellcome.timeline.currentIndex == 0) {
                        self._prepEvent(-1, self.events[0]);

                        $({ val: 0 }).animate({ val: 1 }, {
                            duration: 500,
                            easing: 'easeInOutCubic',
                            step: function () {
                                self._scroll(1, this.val);
                            },
                            complete: function () {
                                self.currentDetailsElem = self.nextDetailsElem;
                                self._refresh();

                            }
                        });
                    }

                    self._trigger('onSelectPrev');

                    trackEvent('Timeline Interaction', 'Prev', '', '');
                }
            });

            self.nextBtnElem.on('click', function (e) {
                e.preventDefault();

                if (self.isNextEnabled) {
                    self._trigger('onSelectNext');

                    trackEvent('Timeline Interaction', 'Next', '', '');
                }
            });

            // override close button behaviour.
            self.closeButtonElem.off('click').on('click', function (e) {
                e.preventDefault();

                if (!self.isCloseEnabled) return;
                self.close();
            });

            self.events = $.wellcome.timeline.provider.data.Events.slice();

            // add intro to start.
            self.events.unshift($.wellcome.timeline.provider.data);

            self._prepEvent(0, self.events[0]);
            self.currentDetailsElem = self.nextDetailsElem;
            self._refresh();
            self.open();
        },

        _refresh: function () {
            var self = this;

            if (self.isNavigating) return;

            // make sure details animation completed.
            self.currentDetailsElem.css('left', 0);

            var currentIndex = $.wellcome.timeline.currentIndex;

            self._enableClose();

            if (currentIndex == -1) {
                self._disablePrev();
            } else {
                self._enablePrev();
            }

            var length = $.wellcome.timeline.provider.data.Events.length;

            if ($.wellcome.timeline.provider.data.Events[length - 1].isPresent) {
                length = length - 1;
            }

            if (currentIndex == length - 1) {
                self._disableNext();
            } else {
                self._enableNext();
            }
        },

        _resize: function() {
            var self = this;

            var $win = $(window);

            var width = $win.width() - parseInt(self.element.css('margin-left')) - parseInt(self.element.css('margin-right'));

            if (width > self.options.maxWidth) {
                width = self.options.maxWidth;
            }

            self.element.width(width);

            self.element.css({
                left: ($win.width() / 2) - (self.element.outerWidth(true) / 2)
            });

            var centerColWidth = width - self.leftColElem.outerWidth() - self.rightColElem.outerWidth();

            self.centerColElem.width(centerColWidth);
            self.centerColElem.find('.wrapper').width(centerColWidth);

            var centerLeftColWidth = self.centerLeftColElem.outerWidth(true);
            var centerRightColWidth = self.centerColElem.width() - centerLeftColWidth;

            var leftMargin = parseInt(self.centerRightColElem.css('margin-left'));
            var rightMargin = parseInt(self.centerRightColElem.css('margin-right'));

            centerRightColWidth = centerRightColWidth - (leftMargin + rightMargin);

            self.centerRightColElem.width(centerRightColWidth);
        },

        _prepEvent: function (direction, evnt) {
            var self = this;

            self.nextDetailsElem = self.detailsTemplate.clone();

            var imgContainerElem = self.nextDetailsElem.find('.centerLeftCol');

            var imgElem = $('<img />');

            if (evnt.FeatureImagePath) {
                imgElem.prop('src', evnt.FeatureImagePath);
            } else {
                imgElem.prop('src', $.wellcome.timeline.provider.data.FeatureImagePath);
            }

            imgContainerElem.append(imgElem);

            var $textElem = self.nextDetailsElem.find('.text');

            var $header = $('<header></header>');

            var headerHtml = '<h1>' + evnt.Title + '</h1>';

            if (evnt.StartDisplay) {
                var date = evnt.StartDisplay;

                if (evnt.EndDisplay) {
                    date += " - " + evnt.EndDisplay;
                }

                headerHtml += '<h2>' + date + '</h2>';
            }

            $header.html(headerHtml);

            $textElem.append($header);

            var $section = $('<section></section>');

            $section.html(evnt.Body);

            if (evnt.LinkText && evnt.LinkTarget) {
                var actionLinkHtml = '<p><a class="action" href="' + evnt.LinkTarget + '">' + evnt.LinkText + '</a></p>';
                $section.append(actionLinkHtml);
            }

            if (evnt.ImageCredit) {
                $section.append('<p><em>' + evnt.ImageCredit + '</em></p>');
            }

            // ensure anchor tags link to _blank.
            $section.find('a').prop('target', '_blank');

            $textElem.append($header);
            $textElem.append($section);


            self.centerColElem.append(self.nextDetailsElem);

            // if there's already a visible event, position the next event
            // before or after current event according to direction.
            if (self.currentDetailsElem) {
                self.nextDetailsElem.css('left', self.nextDetailsElem.width() * direction);
            };

            self.centerLeftColElem = self.nextDetailsElem.find('.centerLeftCol');
            self.centerRightColElem = self.nextDetailsElem.find('.centerRightCol');

            self._resize();
        },

        _scroll: function (direction, pos) {
            var self = this;

            // if there's a current details element, move it out of the way
            // and slide in next event.
            // otherwise, the next event is already correctly positioned.
            if (self.currentDetailsElem) {
                var targetLeft = self.contentElem.width() * direction;
                targetLeft *= pos;
                self.currentDetailsElem.css('left', targetLeft);

                pos = 1 - pos;
                targetLeft = (self.contentElem.width() * (direction * -1)) * pos;

                self.nextDetailsElem.css('left', targetLeft);
            }
        },

        _disableClose: function () {
            var self = this;

            self.isCloseEnabled = false;
            self.closeButtonElem.addClass('disabled');
        },

        _enableClose: function () {
            var self = this;

            self.isCloseEnabled = true;
            self.closeButtonElem.removeClass('disabled');
        },

        _disablePrev: function () {
            var self = this;

            self.isPrevEnabled = false;
            self.prevBtnElem.addClass('disabled');
        },

        _enablePrev: function () {
            var self = this;

            self.isPrevEnabled = true;
            self.prevBtnElem.removeClass('disabled');
        },

        _disableNext: function () {
            var self = this;

            self.isNextEnabled = false;
            self.nextBtnElem.addClass('disabled');
        },

        _enableNext: function () {
            var self = this;

            self.isNextEnabled = true;
            self.nextBtnElem.removeClass('disabled');
        },

        _init: function () {

        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }
    });

})(jQuery);
