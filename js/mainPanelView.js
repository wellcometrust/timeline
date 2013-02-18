

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
                self.resize();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.ZOOM_IN, function () {
                self.zoomIn();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.ZOOM_OUT, function () {
                self.zoomOut();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.START_INDEX_CHANGE, function (e, index) {
                self.startIndexChange(index);
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
                var startDecade = self.getDecade(startDate);
                startDate = moment(new Date(startDecade, 1, 1));
                var endDecade = self.getDecade(endDate);
                endDate = moment(new Date(endDecade, 1, 1)).add('years', 10).subtract('days', 1);
            } else {
                // if more than a century, pick the first day of the first century and the last day
                // of the last century as the start and end dates
                var startCentury = self.getCentury(startDate);
                startDate = moment(new Date(startCentury, 1, 1));
                var endCentury = self.getCentury(endDate);
                endDate = moment(new Date(endCentury, 1, 1)).add('years', 100).subtract('days', 1);
            }

            self.startDate = startDate;
            self.endDate = endDate;

            self.days = self.endDate.diff(self.startDate, 'days');
            self.years = self.endDate.diff(self.startDate, 'years');
            self.decades = Math.floor(self.years / 10);
            self.centuries = Math.floor(self.years / 100);

            self.createBackgroundEvents();
            self.createEvents();
            self.createTicks();
        },

        createBackgroundEvents: function () {
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

        createEvents: function () {
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
                        self.selectEvent(index);
                    });

                    elem.on('mouseenter', function () {
                        if (self.isNavigating || self.isZooming) return;

                        var index = $(this).data('index');
                        self.highlightEvent(index);
                    });

                    elem.on('mouseleave', function () {
                        if (self.isNavigating || self.isZooming) return;

                        var index = $(this).data('index');
                        self.unhighlightEvent(index);
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

        createTicks: function () {
            var self = this;

            var i, l, tick;

            // 1 year is the minimum timespan.
            for (i = self.startDate.year(), l = self.endDate.year(); i < l; i++) {
                tick = { startYear: i, endYear: i };
                self.associateEventsWithTick(tick);
                self.yearTicks.ticks.push(tick);
            }

            self.yearTicks.elem = self.yearTicksElem;
            self.createTickElems(self.yearTicks);

            // if there are decades, create decade ticks.
            if (self.decades) {
                var startDecade = self.getDecade(self.startDate);
                var endDecade = self.getDecade(self.endDate);
                for (i = startDecade, l = endDecade; i < l; i += 10) {
                    tick = { startYear: i, endYear: i + 9 };
                    self.associateEventsWithTick(tick);
                    self.decadeTicks.ticks.push(tick);
                }

                self.decadeTicks.elem = self.decadeTicksElem;
                self.createTickElems(self.decadeTicks);
            }

            // if there are centuries, create century ticks.
            if (self.centuries) {
                var startCentury = self.getCentury(self.startDate);
                var endCentury = self.getCentury(self.endDate);
                for (i = startCentury, l = endCentury; i < l; i += 100) {
                    tick = { startYear: i, endYear: i + 99 };
                    self.associateEventsWithTick(tick);
                    self.centuryTicks.ticks.push(tick);
                }

                self.centuryTicks.elem = self.centuryTicksElem;
                self.createTickElems(self.centuryTicks);
            }
        },

        createTickElems: function (ticksType) {
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
                        self.selectEvent(index);
                    });

                    tickEventElem.on('mouseenter', function () {
                        if (self.isNavigating || self.isZooming) return;

                        var index = $(this).data('index');
                        self.highlightEvent(index);
                    });

                    tickEventElem.on('mouseleave', function () {
                        if (self.isNavigating || self.isZooming) return;

                        var index = $(this).data('index');
                        self.unhighlightEvent(index);
                    });

                    eventsElem.append(tickEventElem);
                }

                ticksType.elem.append(tick.elem);
            }
        },

        associateEventsWithTick: function (tick) {
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

        setEventsZIndex: function (stackLevel) {
            var self = this;

            // set zIndex, top stack is furthest back.
            for (var i = 0, l = self.events.length; i < l; i++) {
                var evnt = self.events[i];

                if (stackLevel != null) {
                    if (evnt.stackLevel == stackLevel) {
                        self.setEventZIndex(evnt);
                    }
                } else {
                    self.setEventZIndex(evnt);
                }
            }
        },

        setEventZIndex: function (evnt) {
            var self = this;

            var z = parseInt(self.eventsElem.css('zIndex')) + (evnt.stackLevel * 2) + 1;

            evnt.elem.css('zIndex', z);
        },

        setCurrentEventToTop: function () {
            var self = this;

            if (self.getCurrentEvent()) {
                self.setEventToTop(self.getCurrentEvent());
            }
        },

        setEventToTop: function (evnt) {
            var self = this;

            // reset all event zindexes for this
            // stack level and increase the passed event's zindex.
            self.setEventsZIndex(evnt.stackLevel);

            var z = parseInt(evnt.elem.css('zIndex')) + 1;

            evnt.elem.css('zIndex', z);
        },

        updateNavigationAvailability: function () {
            var self = this;

            if (self.isMinZoom()) {
                $.wellcome.timeline.isMinZoom = true;
            } else {
                $.wellcome.timeline.isMinZoom = false;
            }

            if (self.isMaxZoom()) {
                $.wellcome.timeline.isMaxZoom = true;
            } else {
                $.wellcome.timeline.isMaxZoom = false;
            }
        },

        // decide which events are visible.
        updateVisibleEvents: function () {
            var self = this;

            var i, l, evnt;

            // set all events to visible.
            for (i = 0, l = self.events.length; i < l; i++) {
                evnt = self.events[i];
                evnt.isVisible = true;
            }

            // if not at max zoom,  keep all visible.
            // otherwise, only show events that don't overlap.
            if (self.isMaxZoom()) return;

            // from left to right for each event stack level, update
            // event visibility.
            for (i = 0, l = self.eventStack.length; i < l; i++) {
                var stackLevel = self.eventStack[i];

                self.updateStackLevelVisibleEvents(stackLevel);
            }
        },

        updateStackLevelVisibleEvents: function (stackLevel) {
            var self = this;

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

        showVisibleEvents: function (callback) {
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

        isEventElemVisible: function (index) {

            var evnt = self.events[index];

            return evnt.elem.is(":visible");
        },

        getCurrentEvent: function () {
            return $.wellcome.timeline.getCurrentEvent();
        },

        updateVisibleTicks: function () {
            var self = this;

            var currentTicks = self.getCurrentTicks();

            for (var i = 0, l = currentTicks.ticks.length; i < l; i++) {
                var tick = currentTicks.ticks[i];

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

        selectEvent: function (index) {
            var self = this;

            if ($.wellcome.timeline.currentIndex != index) {
                self._trigger('onSelectEvent', null, index);
            }
        },

        selectTickEvent: function (evnt) {
            var self = this;

            var tickEventElem = self.getTickEventElem(evnt);
            tickEventElem.addClass('selected');

            // if at max zoom, reset zindex.
            if (self.isMaxZoom()) {
                self.setEventToTop(evnt);
            }
        },

        getCurrentTicks: function () {
            var self = this;

            if (self.yearTicks.elem && self.yearTicks.elem.is(':visible')) return self.yearTicks;
            if (self.decadeTicks.elem && self.decadeTicks.elem.is(':visible')) return self.decadeTicks;
            if (self.centuryTicks.elem && self.centuryTicks.elem.is(':visible')) return self.centuryTicks;
            return null;
        },

        // get the current tickEventElem for a given event.
        getTickEventElem: function (evnt) {
            var self = this;

            var currentTicks = self.getCurrentTicks();

            for (var i = 0, l = currentTicks.ticks.length; i < l; i++) {
                var tick = currentTicks.ticks[i];

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

        startIndexChange: function (index) {
            var self = this;

            if (index == -1) return;

            self.navigateToEvent(index, function () {
                self.onNavigateToEventComplete(index);
            });
        },

        navigateToEvent: function (index, callback) {
            var self = this;

            self.isNavigating = true;
            self._trigger('onStartNavigating');

            // get the target scroll position.
            var currentScroll = Math.floor((self.getContentWidth() * self.getCurrentScrollPosition()));
            var targetScroll = self.getEventScrollPosition(index);

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
                    self.scrollToPosition(Math.floor(this.val));

                    var pos = normalise(this.val, currentScroll, targetScroll);
                    self._trigger('onScrollStep', null, { direction: direction.toString(), pos: pos.toString() });
                },
                complete: function () {
                    self._trigger('onFinishScroll', null, direction.toString());
                    // scrolled into position, now zoom until visible.
                    self.zoomUntilVisible(index, callback);
                }
            });
        },

        onNavigateToEventComplete: function (index) {
            var self = this;

            self.refresh(function () {
                self.isNavigating = false;
                self._trigger('onFinishNavigating');
                self._trigger('onFinishZoom');
                self._trigger('onSelectEventComplete', null, index);
            });
        },

        zoomIn: function () {
            var self = this;

            self.zoom(1, function () {
                self.refresh(function () {
                    self._trigger('onFinishZoom');
                });
            });
        },

        zoomOut: function () {
            var self = this;

            self.zoom(-1, function () {
                self.refresh(function () {
                    self._trigger('onFinishZoom');
                });
            });
        },

        zoomUntilVisible: function (index, callback) {
            var self = this;

            var evnt = self.events[index];

            if (evnt.isVisible) {
                callback();
                return;
            } 

            self.refresh(function () {

                if (evnt.isVisible) {
                    callback();
                    return;
                }

                self.zoom(1, function () {
                    self.zoomUntilVisible(index, callback);
                });
            });
        },

        // direction 1 to zoom in, -1 to zoom out or 0 to just scroll.
        zoom: function (direction, callback) {
            var self = this;

            if (!self.canZoom(direction)) return;

            self.isZooming = true;
            self._trigger('onStartZoom');

            self.currentZoomLevel += direction;

            var currentScroll = self.getCurrentScrollPosition();
            var finalWidth = self.getNextZoomWidth(direction);
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
                        targetScroll = self.getEventScrollPosition(targetIndex);
                    } else {
                        // maintain current relative scroll position.
                        targetScroll = Math.floor((self.getContentWidth() * currentScroll));
                    }

                    self.scrollToPosition(targetScroll);
                    self.redraw(true, true);
                },
                easing: 'easeInOutCubic',
                duration: $.wellcome.timeline.provider.options.zoomAnimationDuration,
                complete: function () {
                    self.isZooming = false;
                    self.hasZoomed = true;

                    // do a final full redraw without clipping.
                    self.redraw(false, false);

                    if (callback) callback();
                }
            });
        },

        resize: function () {
            var self = this;

            self.scrollElem.width(self.element.width() - parseInt(self.scrollElem.css('margin-left')) - parseInt(self.scrollElem.css('margin-right')));
            self.contentElem.width(self.element.width());

            self.redraw(false, false);
            self.refresh(null, true);
        },

        redraw: function (clip, onlyVisible) {
            var self = this;

            self.drawBackgroundEvents();
            self.drawEvents(clip, onlyVisible);
            self.drawTicks();
            self.scroll.refresh();
        },

        refresh: function (callback, resize) {
            var self = this;

            if (!resize) {

                // if scrolled (not zoomed), select the current event
                // and call back.
                if (!self.hasZoomed) {
                    // if there is no previous zoom level,  set it to current.
                    if (self.lastZoomLevel === null) {
                        self.lastZoomLevel = self.currentZoomLevel;
                    }

                    self.selectCurrentEvent();
                    if (callback) callback();
                    return;
                } else {
                    // reset hasZoomed.
                    self.hasZoomed = false;
                }
            }

            log('refresh');
            self.updateVisibleEvents();
            self.setEventsZIndex();
            self.updateVisibleTicks();
                
            self.showVisibleEvents(function () {

                self.updateNavigationAvailability();
                self.selectCurrentEvent();
                
                self._trigger('onRefreshed');

                if (callback) callback();
            });
        },

        selectCurrentEvent: function() {
            var self = this;
            
            // ensure all events are cleared of highlight.
            self.eventsElem.find('.event').removeClass('highlighted');
            self.timeElem.find('.tickEvent').removeClass('highlighted');

            var evnt = self.getCurrentEvent();

            if (evnt) {
                self.setEventToTop(evnt);
                evnt.elem.addClass('selected');
                self.selectTickEvent(evnt);
            }
        },

        drawBackgroundEvents: function () {
            var self = this;

            var contentWidth = self.getContentWidth();

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

        drawEvents: function (clip, onlyVisible) {
            var self = this;

            var contentWidth = self.getContentWidth();
            var scrollWidth = self.getScrollWidth();

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

                if (evnt.lineHeight) continue;

                // line height hasn't been computed yet.
                var lineElem = evnt.elem.find('.line');

                evnt.lineHeight = self.eventsElem.height() - evnt.top - parseInt(evnt.elem.css('margin-top')) - parseInt(evnt.elem.height()) - (evnt.isPresent ? 9 : 7); // -7 is to make small gap above ticks bar

                lineElem.height(evnt.lineHeight);
            }
        },

        drawTicks: function () {
            var self = this;

            var availableWidth = self.getContentWidth();

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

            if (newTicks !== self.getCurrentTicks()) {

                self.timeElem.find('.ticks').hide();

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

            var intervalWidth = self.getInterval(newTicks.ticks);

            var marginLeft = null;

            for (var i = 0, l = newTicks.ticks.length; i < l; i++) {
                var tick = newTicks.ticks[i];

                if (!marginLeft) {
                    marginLeft = parseInt(tick.elem.css('margin-left'));
                }

                tick.elem.width(intervalWidth - marginLeft);
            }
        },

        isMaxZoom: function () {
            var self = this;

            if (!self.canZoom(1)) return true;

            return false;
        },

        isMinZoom: function () {
            var self = this;

            if (!self.canZoom(-1)) return true;

            return false;
        },

        getCurrentScrollPosition: function () {
            var self = this;

            return normalise(self.scroll.x, 0, self.getContentWidth());
            //return normalise(self.scroll.x - self.scroll.x, 0, self.contentElem.width());
        },

        scrollToPosition: function (position) {
            var self = this;

            // if position is less than the content width - viewport,
            // restrict to that bounding.
            var min = (self.getContentWidth() - self.getScrollWidth()) * -1;

            position = clamp(position, min, 0);

            self.scroll.scrollTo(position, 0);
        },

        getEventScrollPosition: function (index) {
            var self = this;

            var evnt = self.events[index];
            //var pos = Math.floor((evnt.position * self.getContentWidth()) - (self.getScrollWidth() / 2) + (evnt.elem.width() / 2)) * -1;
            var pos = Math.floor((evnt.position * self.getContentWidth()) - (self.getScrollWidth() / 2) + 100) * -1; // hard-code half of width (100) to ignore minimised event widths.
            return pos;
        },

        highlightEvent: function (index) {
            var self = this;

            if (self.isZooming) return;

            var evnt = self.events[index];
            evnt.elem.addClass('highlighted');

            var tickEventElem = self.getTickEventElem(evnt);
            tickEventElem.addClass('highlighted');

            // if at max zoom, bring to top
            if (self.isMaxZoom()) {
                self.setEventToTop(evnt);
            }
        },

        unhighlightEvent: function (index) {
            var self = this;

            if (self.isZooming) return;

            var evnt = self.events[index];
            evnt.elem.removeClass('highlighted');

            var tickEventElem = self.getTickEventElem(evnt);
            tickEventElem.removeClass('highlighted');

            // if at max zoom, reset zindex.
            if (self.isMaxZoom()) {
                self.setEventZIndex(evnt);

                // if an event is selected, return it to the top.
                if (self.getCurrentEvent()) {
                    self.setEventToTop(self.getCurrentEvent());
                }
            }
        },

        getNextZoomWidth: function (direction) {
            var self = this;

            var oldWidth = self.contentElem.width();
            var scaleFactor = Math.pow($.wellcome.timeline.provider.options.zoomFactor, direction);
            var newWidth = oldWidth * scaleFactor;

            return newWidth;
        },

        canZoom: function (direction) {
            var self = this;

            //var newZoomLevel = self.currentZoomLevel + direction;
            var newWidth = self.getNextZoomWidth(direction);

            // make sure the new width isn't less than the visible scrolling area.
            if (newWidth < self.scrollElem.width()) {
                return false;
            }

            // make sure the new width isn't more than the maximum width.
            if (newWidth > self.getMaxWidth()) {
                return false;
            }

            return true;
        },

        // year tick max width * # year ticks.
        getMaxWidth: function () {
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

        // gets the number of pixels between each tick.
        getInterval: function (ticks) {
            var self = this;

            return self.getContentWidth() / ticks.length;
        },

        getContentWidth: function () {
            var self = this;

            return self.contentElem.width();
        },

        getScrollWidth: function () {
            var self = this;

            return self.scrollElem.width();
        },

        getDecade: function (date) {
            var self = this;

            return Math.floor(date.year() / 10) * 10;
        },

        getCentury: function (date) {
            var self = this;

            return Math.floor(date.year() / 100) * 100;
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }
    });

})(jQuery);
