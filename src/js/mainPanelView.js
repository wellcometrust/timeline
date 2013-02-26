

(function ($) {

    $.widget("wellcome.timeline_mainPanelView", {

        currentZoomLevel: 0,
        lastZoomLevel: null,
        hasZoomed: false,
        isZooming: false,
        isNavigating: false,

        days: 0,
        years: 0,
        decades: 0,
        centuries: 0,

        yearTicks: { elem: null, ticks: [] },
        decadeTicks: { elem: null, ticks: [] },
        centuryTicks: { elem: null, ticks: [] },

        _create: function () {
            var self = this;

            // bind to global events.
            $.wellcome.timeline.bind($.wellcome.timeline.RESIZE, function () {
                self._resize();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.ZOOM_IN, function () {
                self._zoomIn();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.ZOOM_OUT, function () {
                self._zoomOut();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.START_INDEX_CHANGE, function (e, index) {
                if (index == -1) return;
                self._navigateToEvent(self.events[index]);
            });

            // create ui.
            self.scrollElem = $('<div id="scroll"></div>');
            self.element.append(self.scrollElem);

            self.contentElem = $('<div class="content"></div>');
            self.scrollElem.append(self.contentElem);

            self.backgroundEventsElem = $('<div class="backgroundEvents"></div>');
            self.contentElem.append(self.backgroundEventsElem);

            self.eventsElem = $('<div class="events"></div>');
            self.contentElem.append(self.eventsElem);

            self.timeElem = $('<div class="time"></div>');
            self.contentElem.append(self.timeElem);

            self.yearTicksElem = $('<div class="ticks years"></div>');
            self.timeElem.append(self.yearTicksElem);

            self.decadeTicksElem = $('<div class="ticks decades"></div>');
            self.timeElem.append(self.decadeTicksElem);

            self.centuryTicksElem = $('<div class="ticks centuries"></div>');
            self.timeElem.append(self.centuryTicksElem);

            self.backgroundEventTemplateElem = $('\
                <div class="event">\
                    <div class="title"></div>\
                    <div class="timeSpan"></div>\
                </div>');

            self.eventTemplateElem = $('\
                <div class="event">\
                    <div class="wrap">\
                        <div class="leftCol"><img /></div>\
                        <div class="rightCol">\
                            <div class="date"></div>\
                            <div class="title"></div>\
                        </div>\
                    </div>\
                    <div class="arrow"></div>\
                    <div class="line"></div>\
                </div>');

            self.tickTemplateElem = $('\
                <div class="tick">\
                    <div class="date"></div>\
                    <div class="events"></div>\
                </div>');

            self.tickEventTemplateElem = $('<div class="tickEvent"></div>');
        },

        _init: function () {
            var self = this;

            self.scroll = new iScroll('scroll', {
                hScrollbar: false,
                vScrollbar: false,
                hideScrollbar: true
            });
            
            $(self.scroll.scroller).on('selectstart', function () {
                return false;
            });

            self.yearTicksElem.hide();
            self.decadeTicksElem.hide();
            self.centuryTicksElem.hide();

            self.backgroundEvents = $.wellcome.timeline.provider.data.BackgroundEvents;
            self.events = $.wellcome.timeline.provider.data.Events;

            var startDate = $.wellcome.timeline.provider.getTimelineStartDate();
            var endDate = $.wellcome.timeline.provider.getTimelineEndDate();

            // round the start and end dates to the nearest year, decade or century.
            if (endDate.year() == startDate.year()) {
                // if in days (less than a year), pick the first and last day of that year
                // as the start and end dates. 
                startDate = moment(new Date(startDate.year(), 1, 1));
                endDate = startDate.add('years', 1).subtract('days', 1);
            } else if (endDate.year() - startDate.year() < 10) {
                // if less than a decade, pick the first day of the first year and the last day
                // of the last year as the start and end dates.
                startDate = moment(new Date(startDate.year(), 1, 1));
                endDate = moment(new Date(endDate.year(), 1, 1)).add('years', 1).subtract('days', 1);
            } else if (endDate.year() - startDate.year() < 100) {
                // if less than a century, pick the first day of the first decade and the last day of
                // the last decade as the start and end dates.
                var startDecade = self._getDecade(startDate);
                startDate = moment(new Date(startDecade, 1, 1));
                var endDecade = self._getDecade(endDate);
                endDate = moment(new Date(endDecade, 1, 1)).add('years', 10).subtract('days', 1);
            } else {
                // if more than a century, pick the first day of the first century and the last day
                // of the last century as the start and end dates
                var startCentury = self._getCentury(startDate);
                startDate = moment(new Date(startCentury, 1, 1));
                var endCentury = self._getCentury(endDate);
                endDate = moment(new Date(endCentury, 1, 1)).add('years', 100).subtract('days', 1);
            }

            self.startDate = startDate;
            self.endDate = endDate;

            self.days = self.endDate.diff(self.startDate, 'days');
            self.years = self.endDate.diff(self.startDate, 'years');
            self.decades = Math.floor(self.years / 10);
            self.centuries = Math.floor(self.years / 100);

            self._createBackgroundEvents();
            self._createEvents();
            self._createTicks();
        },

        _createBackgroundEvents: function () {
            var self = this;

            var i, l, evnt;

            for (i = 0, l = self.backgroundEvents.length; i < l; i++) {
                evnt = self.backgroundEvents[i];
                evnt.index = i;

                var elem = self.backgroundEventTemplateElem.clone();
                evnt.elem = elem;
                elem.data('index', evnt.index);

                evnt.titleElem = elem.find('.title');
                evnt.titleElem.text(evnt.Title);

                elem.prop('title', evnt.Title);

                evnt.timeSpanElem = elem.find('.timeSpan');

                $.wellcome.timeline.provider.setEventStartDate(evnt);
                $.wellcome.timeline.provider.setEventEndDate(evnt);

                self.backgroundEventsElem.append(elem);

                var startDayIndex = evnt.startDate.diff(self.startDate, 'days');
                evnt.startPosition = normalise(startDayIndex, 0, self.days);

                var endDayIndex = evnt.endDate.diff(self.startDate, 'days');
                evnt.endPosition = normalise(endDayIndex, 0, self.days);
            }
        },

        _createEvents: function () {
            var self = this;
            var i, l, evnt;

            // if the timeline extends to the present day, add an extra event
            // to signify that.
            var present = moment();

            if (self.endDate.year() >= present.year()) {

                var presentEvent = {
                    isPresent: true,
                    startDate: present,
                    endDate: present,
                    Title: $.wellcome.timeline.options.config.MainPanelView.PresentDay,
                    Priority: 1
                };

                self.events.push(presentEvent);
            }

            for (i = 0, l = self.events.length; i < l; i++) {
                evnt = self.events[i];
                evnt.index = i;

                var elem = self.eventTemplateElem.clone();
                evnt.elem = elem;
                elem.data('index', evnt.index);

                var imgElem = elem.find('img');
                var dateElem = elem.find('.date');
                var titleElem = elem.find('.title');

                if (evnt.ThumbnailPath) {
                    elem.removeClass('min');
                    imgElem.prop('src', evnt.ThumbnailPath);
                } else {
                    elem.addClass('min');
                }

                titleElem.text(evnt.Title);
                titleElem.ellipsis(45);

                if (evnt.isPresent) {
                    dateElem.text(evnt.startDate.year());

                    elem.addClass('present');
                } else {
                    dateElem.text(evnt.StartDisplayYear);

                    elem.prop('title', evnt.StartDisplayYear + ": " + evnt.Title);

                    elem.on('click', function () {
                        if (self.isNavigating || self.isZooming) return;

                        var index = parseInt($(this).data('index'));
                        self._selectEvent(index);
                    });

                    elem.on('mouseenter', function () {
                        if (self.isNavigating || self.isZooming) return;

                        var index = $(this).data('index');
                        self._highlightEvent(index);
                    });

                    elem.on('mouseleave', function () {
                        if (self.isNavigating || self.isZooming) return;

                        var index = $(this).data('index');
                        self._unhighlightEvent(index);
                    });

                    $.wellcome.timeline.provider.setEventStartDate(evnt);
                    $.wellcome.timeline.provider.setEventEndDate(evnt);
                }

                self.eventsElem.append(elem);

                var dayIndex = evnt.startDate.diff(self.startDate, 'days');
                evnt.position = normalise(dayIndex, 0, self.days);
                evnt.width = evnt.elem.outerWidth();

                evnt.elem.hide();
            }

            self.eventStack = [];

            // prepare event stack.
            for (i = 0, l = $.wellcome.timeline.provider.options.eventStackSize; i < l; i++) {
                self.eventStack.push([]);
            }

            var stackLevel = 0;

            for (i = 0, l = self.events.length; i < l; i++) {
                evnt = self.events[i];
                evnt.stackLevel = stackLevel;

                // add to event stack.
                self.eventStack[stackLevel].push(evnt);

                if (stackLevel == $.wellcome.timeline.provider.options.eventStackSize - 1) {
                    stackLevel = 0;
                } else {
                    stackLevel++;
                }
            }
        },

        _createTicks: function () {
            var self = this;

            var i, l, tick;

            // 1 year is the minimum timespan.
            for (i = self.startDate.year(), l = self.endDate.year(); i < l; i++) {
                tick = { startYear: i, endYear: i };
                self._associateEventsWithTick(tick);
                self.yearTicks.ticks.push(tick);
            }

            self.yearTicks.elem = self.yearTicksElem;
            self._createTickElems(self.yearTicks);

            // if there are decades, create decade ticks.
            if (self.decades) {
                var startDecade = self._getDecade(self.startDate);
                var endDecade = self._getDecade(self.endDate);
                for (i = startDecade, l = endDecade; i < l; i += 10) {
                    tick = { startYear: i, endYear: i + 9 };
                    self._associateEventsWithTick(tick);
                    self.decadeTicks.ticks.push(tick);
                }

                self.decadeTicks.elem = self.decadeTicksElem;
                self._createTickElems(self.decadeTicks);
            }

            // if there are centuries, create century ticks.
            if (self.centuries) {
                var startCentury = self._getCentury(self.startDate);
                var endCentury = self._getCentury(self.endDate);
                for (i = startCentury, l = endCentury; i < l; i += 100) {
                    tick = { startYear: i, endYear: i + 99 };
                    self._associateEventsWithTick(tick);
                    self.centuryTicks.ticks.push(tick);
                }

                self.centuryTicks.elem = self.centuryTicksElem;
                self._createTickElems(self.centuryTicks);
            }
        },

        _createTickElems: function (ticksType) {
            var self = this;

            for (var i = 0, l = ticksType.ticks.length; i < l; i++) {
                var tick = ticksType.ticks[i];
                var elem = self.tickTemplateElem.clone();
                tick.elem = elem;
                tick.elem.find('.date').append(tick.startYear);

                // append tickEventElems.
                var eventsElem = tick.elem.find('.events');

                // get events for tick.
                for (var j = 0, ll = tick.events.length; j < ll; j++) {
                    var evnt = tick.events[j];

                    var tickEventElem = self.tickEventTemplateElem.clone();
                    tickEventElem.data('index', evnt.index);

                    tickEventElem.attr('title', evnt.StartDisplayYear + ": " + evnt.Title);

                    tickEventElem.on('click', function () {
                        if (self.isNavigating || self.isZooming) return;

                        var index = $(this).data('index');
                        self._selectEvent(index);
                    });

                    tickEventElem.on('mouseenter', function () {
                        if (self.isNavigating || self.isZooming) return;

                        var index = $(this).data('index');
                        self._highlightEvent(index);
                    });

                    tickEventElem.on('mouseleave', function () {
                        if (self.isNavigating || self.isZooming) return;

                        var index = $(this).data('index');
                        self._unhighlightEvent(index);
                    });

                    eventsElem.append(tickEventElem);
                }

                ticksType.elem.append(tick.elem);
            }
        },

        _associateEventsWithTick: function (tick) {
            var self = this;

            tick.events = [];

            for (var i = 0, l = self.events.length; i < l; i++) {
                var event = self.events[i];

                if (event.isPresent) return;

                var startYear = event.startDate.year();

                // if the event's start year is within the tick, associate it.
                if (startYear >= tick.startYear && startYear <= tick.endYear) {
                    tick.events.push(event);
                }
            }
        },

        _setEventsZIndex: function (stackLevel) {
            var self = this;

            // set zIndex, top stack is furthest back.
            for (var i = 0, l = self.events.length; i < l; i++) {
                var evnt = self.events[i];

                if (stackLevel != null) {
                    if (evnt.stackLevel == stackLevel) {
                        self._setEventZIndex(evnt);
                    }
                } else {
                    self._setEventZIndex(evnt);
                }
            }
        },

        _setEventZIndex: function (evnt) {
            var self = this;

            var z = parseInt(self.eventsElem.css('zIndex')) + (evnt.stackLevel * 2) + 1;

            evnt.elem.css('zIndex', z);
        },

        _setCurrentEventToTop: function () {
            var self = this;

            if (self._getCurrentEvent()) {
                self._setEventToTop(self._getCurrentEvent());
            }
        },

        _setEventToTop: function (evnt) {
            var self = this;

            // reset all event zindexes for this
            // stack level and increase the passed event's zindex.
            self._setEventsZIndex(evnt.stackLevel);

            var z = parseInt(evnt.elem.css('zIndex')) + 1;

            evnt.elem.css('zIndex', z);
        },

        _updateNavigationAvailability: function () {
            var self = this;

            $.wellcome.timeline.isMinZoom = self._isMinZoom();
            $.wellcome.timeline.isMaxZoom = self._isMaxZoom();
        },

        // decide which events are visible.
        _updateVisibleEvents: function () {
            var self = this;

            var i, l, evnt;

            // set all events to visible.
            for (i = 0, l = self.events.length; i < l; i++) {
                evnt = self.events[i];
                evnt.isVisible = true;
            }

            // if not at max zoom,  keep all visible.
            // otherwise, only show events that don't overlap.
            if (self._isMaxZoom()) return;

            // from left to right for each event stack level, update
            // event visibility.
            for (i = 0, l = self.eventStack.length; i < l; i++) {
                var stackLevel = self.eventStack[i];

                self._updateStackLevelVisibleEvents(stackLevel);
            }
        },

        _updateStackLevelVisibleEvents: function (stackLevel) {

            for (var i = 0, l = stackLevel.length; i < l; i++) {

                var currentEvent = stackLevel[i];

                if (currentEvent.isVisible) {
                    var overlap = currentEvent.leftPos + currentEvent.width + 10; // add 10px margin

                    for (var j = i + 1, ll = stackLevel.length; j < ll; j++) {
                        var nextEvent = stackLevel[j];

                        // if the next event's left position overlaps
                        // the current event.
                        if (nextEvent.isVisible) {
                            if (nextEvent.leftPos < overlap) {
                                // if the next event's priority is lower, hide it.
                                // if higher, hide the current event.
                                // if the same, hide the next event.
                                if (nextEvent.Priority > currentEvent.Priority) {
                                    nextEvent.isVisible = false;
                                } else if (nextEvent.Priority < currentEvent.Priority) {
                                    currentEvent.isVisible = false;
                                    break;
                                } else {
                                    nextEvent.isVisible = false;
                                }
                            } else {
                                break;
                            }
                        }
                    }
                }
            }
        },

        _showVisibleEvents: function (callback) {
            var self = this;

            var visibleElems = $();
            var hiddenElems = $();

            for (var i = 0, l = self.events.length; i < l; i++) {
                var evnt = self.events[i];

                if (evnt.isVisible) {
                    visibleElems = visibleElems.add(evnt.elem);
                } else {
                    hiddenElems = hiddenElems.add(evnt.elem);
                }
            }

            $.when(visibleElems.fadeIn($.wellcome.timeline.options.eventFadeDuration),
                hiddenElems.fadeOut($.wellcome.timeline.options.eventFadeDuration)).then(function () {
                    callback();
                });
        },

        _getCurrentEvent: function () {
            return $.wellcome.timeline.getCurrentEvent();
        },

        _updateVisibleTicks: function () {
            var self = this;

            for (var i = 0, l = self.currentTicks.ticks.length; i < l; i++) {
                var tick = self.currentTicks.ticks[i];

                // for each tick, check if its event is visible
                // and set tickevent class to hidden if not.
                var tickEventElems = tick.elem.find('.events .tickEvent');

                for (var j = 0, ll = tickEventElems.length; j < ll; j++) {
                    var tickEventElem = $(tickEventElems[j]);

                    var evnt = $.wellcome.timeline.getEventByIndex(tickEventElem.data('index'));

                    if (evnt.isVisible) {
                        tickEventElem.addClass('available');
                        tickEventElem.removeClass('hidden');
                    } else {
                        tickEventElem.removeClass('available');
                        tickEventElem.addClass('hidden');
                    }
                }
            }
        },

        _selectEvent: function (index) {
            var self = this;

            if ($.wellcome.timeline.currentIndex != index) {
                self._trigger('onSelectEvent', null, index);
            }
        },

        _selectTickEvent: function (evnt) {
            var self = this;

            var tickEventElem = self._getTickEventElem(evnt);
            tickEventElem.addClass('selected');

            // if at max zoom, reset zindex.
            if (self._isMaxZoom()) {
                self._setEventToTop(evnt);
            }
        },

        // get the current tickEventElem for a given event.
        _getTickEventElem: function (evnt) {
            var self = this;

            for (var i = 0, l = self.currentTicks.ticks.length; i < l; i++) {
                var tick = self.currentTicks.ticks[i];

                var tickEventElems = tick.elem.find('.tickEvent');

                for (var j = 0, ll = tickEventElems.length; j < ll; j++) {
                    var tickEventElem = $(tickEventElems[j]);

                    var tickEvent = $.wellcome.timeline.getEventByIndex(tickEventElem.data('index'));

                    if (evnt === tickEvent) {
                        return tickEventElem;
                    }
                }
            }

            return null;
        },
        
        _navigateToEvent: function (evnt) {
            var self = this;

            self.isNavigating = true;
            self._trigger('onStartNavigating');

            // get the target scroll position.
            var currentScroll = Math.floor((self._getContentWidth() * self._getCurrentScrollPosition()));
            var targetScroll = self._getEventScrollPosition(evnt.index);

            var direction;

            if ($.wellcome.timeline.lastIndex < $.wellcome.timeline.currentIndex) {
                direction = -1;
            } else {
                direction = 1;
            }

            // if current and target scrolls are the same, offset them
            // by the direction.
            if (currentScroll == targetScroll) {
                targetScroll = currentScroll + direction;
            }

            // limit scroll animation time.
            var diff = Math.abs(currentScroll - targetScroll);

            var minDiff = 750;
            var maxDiff = 1250;

            diff = clamp(diff, minDiff, maxDiff);

            self._trigger('onStartScroll', null, direction.toString());

            $({ val: currentScroll }).animate({ val: targetScroll }, {
                duration: diff * 0.6,
                easing: 'easeInOutCubic',
                step: function () {
                    self._scrollToPosition(Math.floor(this.val));

                    var pos = normalise(this.val, currentScroll, targetScroll);
                    self._trigger('onScrollStep', null, { direction: direction.toString(), pos: pos.toString() });
                },
                complete: function () {
                    self._trigger('onFinishScroll', null, direction.toString());
                    // scrolled into position, now zoom until visible.
                    self._zoomUntilVisible(evnt, function () {
                        self._refresh(function () {
                            self.isNavigating = false;
                            self._trigger('onFinishNavigating');
                            self._trigger('onFinishZoom');
                            self._trigger('onSelectEventComplete', null, evnt.index);
                        });
                    });
                }
            });
        },

        _zoomIn: function () {
            var self = this;

            self._zoom(1, function () {
                self._refresh(function () {
                    self._trigger('onFinishZoom');
                });
            });
        },

        _zoomOut: function () {
            var self = this;

            self._zoom(-1, function () {
                self._refresh(function () {
                    self._trigger('onFinishZoom');
                });
            });
        },

        _zoomUntilVisible: function (evnt, callback) {
            var self = this;

            if (evnt.isVisible) {
                callback();
                return;
            } 

            self._refresh(function () {

                if (evnt.isVisible) {
                    callback();
                    return;
                }

                self._zoom(1, function () {
                    self._zoomUntilVisible(evnt, callback);
                });
            });
        },

        // direction 1 to zoom in, -1 to zoom out or 0 to just scroll.
        _zoom: function (direction, callback) {
            var self = this;

            if (!self._canZoom(direction)) return;

            self.isZooming = true;
            self._trigger('onStartZoom');

            self.currentZoomLevel += direction;

            var currentScroll = self._getCurrentScrollPosition();
            var finalWidth = self._getNextZoomWidth(direction);
            var targetIndex = $.wellcome.timeline.currentIndex;

            // update the width of the content in the scroll area.
            self.contentElem.animate({
                width: finalWidth
            },
            {
                step: function (now, fx) {
                    // if an event is selected, scroll to that.
                    // otherwise maintain the current position.
                    var targetScroll;

                    if (targetIndex != -1) {
                        targetScroll = self._getEventScrollPosition(targetIndex);
                    } else {
                        // maintain current relative scroll position.
                        targetScroll = Math.floor((self._getContentWidth() * currentScroll));
                    }

                    self._scrollToPosition(targetScroll);
                    self._redraw(true, true);
                },
                easing: 'easeInOutCubic',
                duration: $.wellcome.timeline.provider.options.zoomAnimationDuration,
                complete: function () {
                    self.isZooming = false;
                    self.hasZoomed = true;

                    // do a final full redraw without clipping.
                    self._redraw(false, false);

                    if (callback) callback();
                }
            });
        },

        _resize: function () {
            var self = this;

            self.scrollElem.width(self.element.width() - parseInt(self.scrollElem.css('margin-left')) - parseInt(self.scrollElem.css('margin-right')));
            self.contentElem.width(self.element.width());

            self._redraw(false, false);
            self._refresh(null, true);
        },

        _redraw: function (clip, onlyVisible) {
            var self = this;

            self._drawBackgroundEvents();
            self._drawEvents(clip, onlyVisible);
            self._drawTicks();
            self.scroll.refresh();
        },

        _refresh: function (callback, resize) {
            var self = this;

            if (!resize) {

                // if scrolled (not zoomed), select the current event
                // and call back.
                if (!self.hasZoomed) {
                    // if there is no previous zoom level,  set it to current.
                    if (self.lastZoomLevel === null) {
                        self.lastZoomLevel = self.currentZoomLevel;
                    }

                    self._selectCurrentEvent();
                    if (callback) callback();
                    return;
                } else {
                    // reset hasZoomed.
                    self.hasZoomed = false;
                }
            }

            self._updateVisibleEvents();
            self._setEventsZIndex();
            self._updateVisibleTicks();
                
            self._showVisibleEvents(function () {

                self._updateNavigationAvailability();
                self._selectCurrentEvent();
                
                self._trigger('onRefreshed');

                if (callback) callback();
            });
        },

        _selectCurrentEvent: function() {
            var self = this;
            
            // ensure all events are cleared of highlight.
            self.eventsElem.find('.event').removeClass('highlighted');
            self.timeElem.find('.tickEvent').removeClass('highlighted');

            var evnt = self._getCurrentEvent();

            if (evnt) {
                self._setEventToTop(evnt);
                evnt.elem.addClass('selected');
                self._selectTickEvent(evnt);
            }
        },

        _drawBackgroundEvents: function () {
            var self = this;

            var contentWidth = self._getContentWidth();

            for (var i = 0, l = self.backgroundEvents.length; i < l; i++) {
                var evnt = self.backgroundEvents[i];

                var left = Math.ceil((evnt.startPosition * contentWidth));
                var width = Math.ceil((evnt.endPosition * contentWidth)) - left;

                evnt.elem.css({
                    'left': left + "px",
                    'width': width + "px"
                });

                evnt.titleElem.ellipsisFill(evnt.Title);
            }
        },

        _drawEvents: function (clip, onlyVisible) {
            var self = this;

            var contentWidth = self._getContentWidth();
            var scrollWidth = self._getScrollWidth();

            for (var i = 0, l = self.events.length; i < l; i++) {
                var evnt = self.events[i];

                var left = Math.ceil((evnt.position * contentWidth));

                evnt.leftPos = left;

                if (onlyVisible && !evnt.isVisible) continue;

                // if clip == true, only position the event if it's within this frame's visible zoom area.
                if (clip) {
                    var scrollPos = self.scroll.x * -1;
                    var elemWidth = 300; // evnt.elem.width();

                    if (left < scrollPos - elemWidth || left > scrollPos + scrollWidth) {
                        // event is outside visible area, so don't position it.
                        if (!evnt.clipped) {
                            evnt.elem.css({
                                'left': "-" + elemWidth + "px"
                            });
                        }
                        evnt.clipped = true;
                        continue;
                    }

                    // else, continue to position the event as normal.
                }

                evnt.clipped = false;

                if (!evnt.top) {
                    evnt.top = evnt.elem.outerHeight(true) * evnt.stackLevel;
                }

                evnt.elem.css({
                    'left': left + "px",
                    'top': evnt.top
                });

                if (!evnt.lineHeight) {

                    // line height hasn't been computed yet.
                    var lineElem = evnt.elem.find('.line');

                    evnt.lineHeight = self.eventsElem.height() - evnt.top - parseInt(evnt.elem.css('margin-top')) - parseInt(evnt.elem.height()) - (evnt.isPresent ? 9 : 7); // -7 is to make small gap above ticks bar

                    lineElem.height(evnt.lineHeight);
                }
            }
        },

        _drawTicks: function () {
            var self = this;

            var availableWidth = self._getContentWidth();

            var newTicks;

            if ((availableWidth / self.centuries) <= $.wellcome.timeline.provider.options.maxCenturyIntervalWidth) {
                newTicks = self.centuryTicks;
            } else if ((availableWidth / self.decades) <= $.wellcome.timeline.provider.options.maxDecadeIntervalWidth) {
                newTicks = self.decadeTicks;
            } else if (self.years < $.wellcome.timeline.provider.options.maxTicks) {
                newTicks = self.yearTicks;
            } else {
                newTicks = self.decadeTicks;
            }

            if (newTicks !== self.currentTicks) {

                if (self.currentTicks != null) {
                    self.currentTicks.elem.hide();
                }

                self.currentTicks = newTicks;

                // update current ticks.
                switch (newTicks) {
                    case self.yearTicks:
                        self.yearTicks.elem.show();
                        break;
                    case self.decadeTicks:
                        self.decadeTicks.elem.show();
                        break;
                    case self.centuryTicks:
                        self.centuryTicks.elem.show();
                        break;
                }

            }

            var intervalWidth = availableWidth / newTicks.ticks.length;

            if (!self.tickMargin) self.tickMargin = parseInt(newTicks.elem.find('.tick').first().css('margin-left'));
            var tickWidth = intervalWidth - self.tickMargin;

            //newTicks.elem.find('.tick').width(tickWidth);

            for (var i = 0, l = newTicks.ticks.length; i < l; i++) {
                newTicks.ticks[i].elem.width(tickWidth);
            }
        },

        _isMaxZoom: function () {
            var self = this;

            if (!self._canZoom(1)) return true;

            return false;
        },

        _isMinZoom: function () {
            var self = this;

            if (!self._canZoom(-1)) return true;

            return false;
        },

        _getCurrentScrollPosition: function () {
            var self = this;

            return normalise(self.scroll.x, 0, self._getContentWidth());
            //return normalise(self.scroll.x - self.scroll.x, 0, self.contentElem.width());
        },

        _scrollToPosition: function (position) {
            var self = this;

            // if position is less than the content width - viewport,
            // restrict to that bounding.
            var min = (self._getContentWidth() - self._getScrollWidth()) * -1;

            position = clamp(position, min, 0);

            self.scroll.scrollTo(position, 0);
        },

        _getEventScrollPosition: function (index) {
            var self = this;

            var evnt = self.events[index];
            //var pos = Math.floor((evnt.position * self.getContentWidth()) - (self.getScrollWidth() / 2) + (evnt.elem.width() / 2)) * -1;
            var pos = Math.floor((evnt.position * self._getContentWidth()) - (self._getScrollWidth() / 2) + 100) * -1; // hard-code half of width (100) to ignore minimised event widths.
            return pos;
        },

        _highlightEvent: function (index) {
            var self = this;

            if (self.isZooming) return;

            var evnt = self.events[index];
            evnt.elem.addClass('highlighted');

            var tickEventElem = self._getTickEventElem(evnt);
            tickEventElem.addClass('highlighted');

            // if at max zoom, bring to top
            if (self._isMaxZoom()) {
                self._setEventToTop(evnt);
            }
        },

        _unhighlightEvent: function (index) {
            var self = this;

            if (self.isZooming) return;

            var evnt = self.events[index];
            evnt.elem.removeClass('highlighted');

            var tickEventElem = self._getTickEventElem(evnt);
            tickEventElem.removeClass('highlighted');

            // if at max zoom, reset zindex.
            if (self._isMaxZoom()) {
                self._setEventZIndex(evnt);

                // if an event is selected, return it to the top.
                if (self._getCurrentEvent()) {
                    self._setEventToTop(self._getCurrentEvent());
                }
            }
        },

        _getNextZoomWidth: function (direction) {
            var self = this;

            var oldWidth = self.contentElem.width();
            var scaleFactor = Math.pow($.wellcome.timeline.provider.options.zoomFactor, direction);
            var newWidth = oldWidth * scaleFactor;

            return newWidth;
        },

        _canZoom: function (direction) {
            var self = this;

            //var newZoomLevel = self.currentZoomLevel + direction;
            var newWidth = self._getNextZoomWidth(direction);

            // make sure the new width isn't less than the visible scrolling area.
            if (newWidth < self.scrollElem.width()) {
                return false;
            }

            // make sure the new width isn't more than the maximum width.
            if (newWidth > self._getMaxWidth()) {
                return false;
            }

            return true;
        },

        // year tick max width * # year ticks.
        _getMaxWidth: function () {
            var self = this;

            var maxYearIntervalWidth = $.wellcome.timeline.provider.options.maxYearIntervalWidth;
            var maxDecadeIntervalWidth = $.wellcome.timeline.provider.options.maxDecadeIntervalWidth;
            var maxWidth;

            if (self.years > $.wellcome.timeline.provider.options.maxTicks) {
                maxWidth = maxDecadeIntervalWidth * self.decades;
            } else {
                maxWidth = maxYearIntervalWidth * self.years;
            }

            return maxWidth;
        },

        _getContentWidth: function () {
            var self = this;

            return self.contentElem.width();
        },

        _getScrollWidth: function () {
            var self = this;

            return self.scrollElem.width();
        },

        _getDecade: function (date) {
            return Math.floor(date.year() / 10) * 10;
        },

        _getCentury: function (date) {
            return Math.floor(date.year() / 100) * 100;
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }
    });

})(jQuery);
