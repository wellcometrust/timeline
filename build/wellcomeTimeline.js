// 9c39fb0 - 2013-03-04
//-------
// convert calendar to Julian date
// (Julian day number algorithm adopted from Press et al.)
//-------
function cal_to_jd( era, y, m, d, h, mn, s )
{
	var jy, ja, jm;			//scratch

	if( y == 0 ) {
		alert("There is no year 0 in the Julian system!");
        return "invalid";
    }
    if( y == 1582 && m == 10 && d > 4 && d < 15 ) {
		alert("The dates 5 through 14 October, 1582, do not exist in the Gregorian system!");
        return "invalid";
    }

//	if( y < 0 )  ++y;
    if( era == "BCE" ) y = -y + 1;
	if( m > 2 ) {
		jy = y;
		jm = m + 1;
	} else {
		jy = y - 1;
		jm = m + 13;
	}

	var intgr = Math.floor( Math.floor(365.25*jy) + Math.floor(30.6001*jm) + d + 1720995 );

	//check for switch to Gregorian calendar
    var gregcal = 15 + 31*( 10 + 12*1582 );
	if( d + 31*(m + 12*y) >= gregcal ) {
		ja = Math.floor(0.01*jy);
		intgr += 2 - ja + Math.floor(0.25*ja);
	}

	//correct for half-day offset
	var dayfrac = h/24.0 - 0.5;
	if( dayfrac < 0.0 ) {
		dayfrac += 1.0;
		--intgr;
	}

	//now set the fraction of a day
	var frac = dayfrac + (mn + s/60.0)/60.0/24.0;

    //round to nearest second
    var jd0 = (intgr + frac)*100000;
    var jd  = Math.floor(jd0);
    if( jd0 - jd > 0.5 ) ++jd;
    return jd/100000;
}

//-------
// convert Julian date to calendar date
// (algorithm adopted from Press et al.)
//-------
function julianToGregorian(jd)
{
	var	j1, j2, j3, j4, j5;			//scratch

	//
	// get the date from the Julian day number
	//
    var intgr   = Math.floor(jd);
    var frac    = jd - intgr;
    var gregjd  = 2299161;
	if( intgr >= gregjd ) {				//Gregorian calendar correction
		var tmp = Math.floor( ( (intgr - 1867216) - 0.25 ) / 36524.25 );
		j1 = intgr + 1 + tmp - Math.floor(0.25*tmp);
	} else {
		j1 = intgr;
    }
    //correction for half day offset
    var dayfrac = frac + 0.5;
    if( dayfrac >= 1.0 ) {
        dayfrac -= 1.0;
        ++j1;
    }

    j2 = j1 + 1524;
    j3 = Math.floor( 6680.0 + ( (j2 - 2439870) - 122.1 )/365.25 );
    j4 = Math.floor(j3*365.25);
    j5 = Math.floor( (j2 - j4)/30.6001 );

    var d = Math.floor(j2 - j4 - Math.floor(j5*30.6001));
    var m = Math.floor(j5 - 1);
    if( m > 12 ) m -= 12;
    var y = Math.floor(j3 - 4715);
    if( m > 2 )   --y;
    if( y <= 0 )  --y;

    //
    // get time of day from day fraction
    //
    var hr  = Math.floor(dayfrac * 24.0);
    var mn  = Math.floor((dayfrac*24.0 - hr)*60.0);
    f  = ((dayfrac*24.0 - hr)*60.0 - mn)*60.0;
    var sc  = Math.floor(f);
    f -= sc;
    if( f > 0.5 ) ++sc;

    //form.year.value          = y;
    //form.month[m-1].selected = true;
    //form.day[d-1].selected   = d;
    //form.hour.value          = hr;
    //form.minute.value        = mn;
    //form.second.value        = sc;
    
    var dateObj = new Object();
    dateObj.month = m;
    dateObj.day = d;
    
    if( y < 0 ) {
     	y = -y;
     	dateObj.era = "BC";
    } else {
        dateObj.era = "AD";
    }
    
    dateObj.year = y;
    
    return dateObj;
}

//-------
// calculate Julian date from calendar date or calendar date from Julian date
//-------
function JDcalc( form ) {
    var era;
    for( k=0; k < form.era.length; ++k ) {
        if( form.era[k].checked ) {
            era = form.era[k].value;
            break;
        }
    }
    var calctype;
    for( k=0; k < form.calctype.length; ++k ) {
        if( form.calctype[k].checked ) {
            calctype = form.calctype[k].value;
            break;
        }
    }
    if( calctype == "JD" ) {
        var m;
        for( var k=0; k < form.month.length; ++k ) {    //Netscape 4.7 is stoopid
            if( form.month[k].selected ) {
                m = k+1;
                break;
            }
        }
        var d;
        for( var k=1; k <= form.day.length; ++k ) {    //Netscape 4.7 is stoopid
            if( form.day[k-1].selected ) {
                d = k;
                break;
            }
        }
        var y  = parseFloat(form.year.value);
//      var m  = parseFloat(form.month.value);
//      var d  = parseFloat(form.day.value);
        var h  = parseFloat(form.hour.value);
        var mn = parseFloat(form.minute.value);
        var s  = parseFloat(form.second.value);
        if( y < 0 ) {
	    	y   = -y;
            era = "BCE";
            form.year.value = y;
            form.era[1].checked = true;
        }
        form.JDedit.value = cal_to_jd(era,y,m,d,h,mn,s);
    } else {
        jd_to_cal(form.JDedit.value,form);
    }
    //weekday
    var	weekday = new Array("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday");
    var t  = parseFloat(form.JDedit.value) + 0.5;
    var wd = Math.floor( (t/7 - Math.floor(t/7))*7 + 0.000000000317 );   //add 0.01 sec for truncation error correction
    form.wkday.value = weekday[wd];
}

var	month = new Array("January","February","March","April","May","June","July",
					  "August","September","October","November","December");
var numdays = new Array(31,28,31,30,31,30,31,31,30,31,30,31);

function ModifiedDate() {
	updated = new Date(document.lastModified);
	Month   = month[updated.getMonth()];
	Day     = updated.getDate();
	Year    = updated.getYear();
	Hour    = updated.getHours();
	Min     = updated.getMinutes();
    if( Year < 2000 ) Year += 1900;
    if( Year < 2000 ) Year += 100;  //Netscape 3 and IE 4.7 return 0 instead of 100 for 2000
	if( Hour < 10 )  Hour = "0" + Hour;
	if( Min  < 10 )  Min  = "0" + Min;
	document.write("Last modified " + Month + " " + Day +  ", " + Year + " at " + Hour + ":" + Min);
}

function set_form_fields(form) {

    //grab the current USNO clock time
    var today = new Date();

    var year = today.getYear();
    if( year < 2000 ) year += 1900;
    if( year < 2000 ) year += 100;  //Netscape 3 and IE 4.7 return 0 instead of 100 for 2000
    var month = today.getMonth();
    var day   = today.getDate();
    var hour  = today.getHours();
    var mins  = today.getMinutes();
    var secs  = today.getSeconds();

    //convert to UT
    var TZ = today.getTimezoneOffset()/60;
    hour += TZ;
    if( hour >= 24 ) {
        hour -= 24;
        ++day;
        if( day > numdays[month-1] ) {
            day = 1;
            ++month;
            if( month > 11 ) {
                month -= 12;
                ++year;
            }
        }
    }

    //set the form fields
    form.year.value = year;
    for( k=0; k < form.month.length; ++k ) {    //Netscape 4.7 is stoopid
        if( k == month ) {
            form.month[k].selected = true;
            break;
        }
    }
    form.day.value = day;
    for( k=1; k <= form.day.length; ++k ) {    //Netscape 4.7 is stoopid
        if( k == day ) {
            form.day[k-1].selected = true;
            break;
        }
    }
    form.hour.value   = hour;
    form.minute.value = mins;
    form.second.value = secs;

    doJD(form);
}

function dodate(form) {
    for( k=0; k < form.calctype.length; ++k ) {
        if( form.calctype[k].value == "date" ) {
            form.calctype[k].checked = true;
            break;
        }
    }
}

function doJD(form) {
    for( k=0; k < form.calctype.length; ++k ) {
        if( form.calctype[k].value == "JD" ) {
            form.calctype[k].checked = true;
            break;
        }
    }
}

(function ($) {

    $.fn.repeatButton = function (pauseMS, repeatMS, func) {

        return this.each(function () {

            var $self = $(this);

            var intervalId;
            var timeoutId;

            $self.mousedown(function () {
                func();
                timeoutId = setTimeout(startFunc, pauseMS);
            }).mouseup(function () {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            }).mouseout(function () {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            });

            function startFunc() {
                intervalId = setInterval(func, repeatMS);
            }

        });

    };

    $.idleTimer = function (newTimeout, elem, opts) {

        // defaults that are to be stored as instance props on the elem

        opts = $.extend({
            startImmediately: true, //starts a timeout as soon as the timer is set up
            idle: false,         //indicates if the user is idle
            enabled: true,          //indicates if the idle timer is enabled
            timeout: 30000,         //the amount of time (ms) before the user is considered idle
            events: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove' // activity is one of these events
        }, opts);


        elem = elem || document;

        /* (intentionally not documented)
        * Toggles the idle state and fires an appropriate event.
        * @return {void}
        */
        var toggleIdleState = function (myelem) {

            // curse you, mozilla setTimeout lateness bug!
            if (typeof myelem === 'number') {
                myelem = undefined;
            }

            var obj = $.data(myelem || elem, 'idleTimerObj');

            //toggle the state
            obj.idle = !obj.idle;

            // reset timeout 
            var elapsed = (+new Date()) - obj.olddate;
            obj.olddate = +new Date();

            // handle Chrome always triggering idle after js alert or comfirm popup
            if (obj.idle && (elapsed < opts.timeout)) {
                obj.idle = false;
                clearTimeout($.idleTimer.tId);
                if (opts.enabled)
                    $.idleTimer.tId = setTimeout(toggleIdleState, opts.timeout);
                return;
            }

            //fire appropriate event

            // create a custom event, but first, store the new state on the element
            // and then append that string to a namespace
            var event = jQuery.Event($.data(elem, 'idleTimer', obj.idle ? "idle" : "active") + '.idleTimer');

            // we do want this to bubble, at least as a temporary fix for jQuery 1.7
            // event.stopPropagation();
            $(elem).trigger(event);
        },

        /**
        * Stops the idle timer. This removes appropriate event handlers
        * and cancels any pending timeouts.
        * @return {void}
        * @method stop
        * @static
        */
        stop = function (elem) {

            var obj = $.data(elem, 'idleTimerObj') || {};

            //set to disabled
            obj.enabled = false;

            //clear any pending timeouts
            clearTimeout(obj.tId);

            //detach the event handlers
            $(elem).off('.idleTimer');
        },


        /* (intentionally not documented)
        * Handles a user event indicating that the user isn't idle.
        * @param {Event} event A DOM2-normalized event object.
        * @return {void}
        */
        handleUserEvent = function () {

            var obj = $.data(this, 'idleTimerObj');

            //clear any existing timeout
            clearTimeout(obj.tId);



            //if the idle timer is enabled
            if (obj.enabled) {


                //if it's idle, that means the user is no longer idle
                if (obj.idle) {
                    toggleIdleState(this);
                }

                //set a new timeout
                obj.tId = setTimeout(toggleIdleState, obj.timeout);

            }
        };


        /**
        * Starts the idle timer. This adds appropriate event handlers
        * and starts the first timeout.
        * @param {int} newTimeout (Optional) A new value for the timeout period in ms.
        * @return {void}
        * @method $.idleTimer
        * @static
        */


        var obj = $.data(elem, 'idleTimerObj') || {};

        obj.olddate = obj.olddate || +new Date();

        //assign a new timeout if necessary
        if (typeof newTimeout === "number") {
            opts.timeout = newTimeout;
        } else if (newTimeout === 'destroy') {
            stop(elem);
            return this;
        } else if (newTimeout === 'getElapsedTime') {
            return (+new Date()) - obj.olddate;
        }

        //assign appropriate event handlers
        $(elem).on($.trim((opts.events + ' ').split(' ').join('.idleTimer ')), handleUserEvent);


        obj.idle = opts.idle;
        obj.enabled = opts.enabled;
        obj.timeout = opts.timeout;


        //set a timeout to toggle state. May wish to omit this in some situations
        if (opts.startImmediately) {
            obj.tId = setTimeout(toggleIdleState, obj.timeout);
        }

        // assume the user is active for the first x seconds.
        $.data(elem, 'idleTimer', "active");

        // store our instance on the object
        $.data(elem, 'idleTimerObj', obj);



    }; // end of $.idleTimer()

    // v0.9 API for defining multiple timers.
    $.fn.idleTimer = function (newTimeout, opts) {
        // Allow omission of opts for backward compatibility
        if (!opts) {
            opts = {};
        }

        if (this[0]) {
            $.idleTimer(newTimeout, this[0], opts);
        }

        return this;
    };

    $.fn.ellipsisFill = function (text) {

        return this.each(function () {

            var $self = $(this);

            $self.empty();

            $self.spanElem = $('<span title="' + text + '"></span>');
            $self.append($self.spanElem);

            $self.css('overflow', 'hidden');
            $self.spanElem.css('white-space', 'nowrap');

            $self.spanElem.html(text);

            // get the width of the span.
            // if it's wider than the container, remove a word until it's not.
            if ($self.spanElem.width() > $self.width()) {
                var lastText;

                while ($self.spanElem.width() > $self.width()) {
                    var t = $self.spanElem.html();

                    t = t.substring(0, t.lastIndexOf(' ')) + '&hellip;';

                    if (t == lastText) break;

                    $self.spanElem.html(t);

                    lastText = t;
                }
            }
        });
    };

    $.fn.ellipsisFixed = function (chars, buttonText) {

        return this.each(function () {

            var $self = $(this);

            var text = $self.text();

            $self.empty();

            var $span = $('<span></span>');

            var $ellipsis = $('<a href="#" title="more" class="ellipsis"></a>');

            if (buttonText) {
                $ellipsis.html(buttonText);
            } else {
                $ellipsis.html('&hellip;');
            }

            $ellipsis.click(function (e) {
                e.preventDefault();

                var $this = $(this);

                $span.html(text);

                $this.remove();
            });

            if (text.length > chars) {
                var trimmedText = text.substr(0, chars);
                trimmedText = trimmedText.substr(0, Math.min(trimmedText.length, trimmedText.lastIndexOf(" ")));

                $span.html(trimmedText + "&nbsp;");

                $span.append($ellipsis);
            } else {
                $span.html(text);
            }

            $self.append($span);
        });

    };

    $.fn.toggleExpandText = function (chars) {

        return this.each(function () {

            var $self = $(this);

            var expandedText = $self.text();

            if (chars > expandedText.length) return;

            var expanded = false;

            var collapsedText = expandedText.substr(0, chars);
            collapsedText = collapsedText.substr(0, Math.min(collapsedText.length, collapsedText.lastIndexOf(" ")));

            $self.toggle = function () {
                $self.empty();

                var $toggleButton = $('<a href="#" class="toggle"></a>');

                if (expanded) {
                    $self.html(expandedText + "&nbsp;");
                    $toggleButton.text("less");
                } else {
                    $self.html(collapsedText + "&nbsp;");
                    $toggleButton.text("more");
                }

                $toggleButton.one('click', function (e) {
                    e.preventDefault();

                    $self.toggle();
                });

                expanded = !expanded;

                $self.append($toggleButton);
            }

            $self.toggle();
        });

    };

    $.fn.ellipsis = function (chars) {

        return this.each(function () {

            var $self = $(this);

            var text = $self.text();

            if (text.length > chars) {
                var trimmedText = text.substr(0, chars);
                trimmedText = trimmedText.substr(0, Math.min(trimmedText.length, trimmedText.lastIndexOf(" ")))

                $self.empty().html(trimmedText + "&hellip;");
            }
        });

    };

})(jQuery);

// debug

// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function () {
    log.history = log.history || [];   // store logs to an array for reference
    log.history.push(arguments);
    if (this.console) {
        console.log(Array.prototype.slice.call(arguments));
    }
};

// end debug

// string

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
};

String.prototype.startsWith = function (str) { return this.indexOf(str) == 0; };
String.prototype.trim = function () { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };
String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };
String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };
String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };
String.prototype.toFileName = function () { return this.replace(/[^a-z0-9]/gi, '_').toLowerCase(); };

function ellipsis(text, chars) {
    if (text.length <= chars) return text;
    var trimmedText = text.substr(0, chars);
    trimmedText = trimmedText.substr(0, Math.min(trimmedText.length, trimmedText.lastIndexOf(" ")));
    return trimmedText + "&hellip;";
}

function numericalInput (event) {
    // Allow: backspace, delete, tab and escape
    if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 ||
        // Allow: Ctrl+A
        (event.keyCode == 65 && event.ctrlKey === true) ||
        // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
        // let it happen, don't do anything
        return true;
    } else {
        // Ensure that it is a number and stop the keypress
        if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
            return false;
        }
        return true;
    }
}

// end string

// math

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function roundNumber(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}

function normalise(num, min, max) {
    return (num - min) / (max - min);
}

function fitRect(width1, height1, width2, height2) {
    var ratio1 = height1 / width1;
    var ratio2 = height2 / width2;

    var width, height, scale;

    if (ratio1 < ratio2) {
        scale = width2 / width1;
        width = width1 * scale;
        height = height1 * scale;
    }
    if (ratio2 < ratio1) {
        scale = height2 / height1;
        width = width1 * scale;
        height = height1 * scale;
    }

    return { width: Math.floor(width), height: Math.floor(height) };
}

// end math

// array

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    };
}

// end array

// date

function getTimeStamp() {
    return new Date().getTime();
}

// end date

// querystring

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// end querystring

// uri

function getUrlParts(url) {
    var a = document.createElement('a');
    a.href = url;

    return {
        href: a.href,
        host: a.host,
        hostname: a.hostname,
        port: a.port,
        pathname: a.pathname,
        protocol: a.protocol,
        hash: a.hash,
        search: a.search
    };
}

function convertToRelativeUrl(url) {
    var parts = getUrlParts(url);
    var relUri = parts.pathname + parts.search;

    if (!relUri.startsWith("/")) {
        relUri = "/" + relUri;
    }

    return relUri;
}

// end uri

// objects

if (typeof Object.create !== 'function') {
    Object.create = function(o) {
        var F = function() {
        };
        F.prototype = o;
        return new F();
    };
}

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// end objects

// events

function debounce(fn, debounceDuration) {
    // summary:
    //      Returns a debounced function that will make sure the given 
    //      function is not triggered too much.
    // fn: Function
    //      Function to debounce.
    // debounceDuration: Number
    //      OPTIONAL. The amount of time in milliseconds for which we 
    //      will debounce the function. (defaults to 100ms)

    debounceDuration = debounceDuration || 100;

    return function () {
        if (!fn.debouncing) {
            var args = Array.prototype.slice.apply(arguments);
            fn.lastReturnVal = fn.apply(window, args);
            fn.debouncing = true;
        }
        clearTimeout(fn.debounceTimeout);
        fn.debounceTimeout = setTimeout(function () {
            fn.debouncing = false;
        }, debounceDuration);

        return fn.lastReturnVal;
    };
};

// end events

// dom

function getMaxZIndex(){
    return Math.max.apply(null,$.map($('body > *'), function(e,n){
        if($(e).css('position')=='absolute')
            return parseInt($(e).css('z-index'))||1 ;
        })
    );
}

// end dom

function BaseProvider() {
    this.options = {
        dataUriTemplate: '{0}{1}.js'
    };

    this.load = function() {
        var self = this;

        // any custom data manipulation/parsing goes here.
        self.data = self.options.data;
    };
};

WellcomeTimelineProvider.prototype = new BaseProvider();
WellcomeTimelineProvider.prototype.constructor = WellcomeTimelineProvider;

function WellcomeTimelineProvider(options) {

    $.extend(this.options, options, {
        provider: this,
        maxTicks: 100,
        maxYearIntervalWidth: 500,
        maxDecadeIntervalWidth: 2000,
        maxCenturyIntervalWidth: 500,
        zoomAnimationDuration: 1000,
        eventFadeDuration: 500,
        zoomFactor: 3,
        eventStackSize: 3,
        padding: 0
    });

    this.create = function (opts) {
        var self = this;

        $.extend(self.options, opts);

        self.load();

        self.options.element.timeline(self.options);
    };

    this.getTimelineStartDate = function() {
        var self = this;

        return self.getDate(self.data.EarliestJulianDay).add('years', self.options.padding * -1);
    };

    this.getTimelineEndDate = function () {
        var self = this;

        return self.getDate(self.data.LastJulianDay).add('years', self.options.padding);
    };

    this.setEventStartDate = function (evnt) {
        var self = this;

        evnt.startDate = self.getDate(evnt.JulianDayStart);
    };

    this.setEventEndDate = function (evnt) {
        var self = this;

        if (evnt.JulianDayEnd < 0) {
            evnt.endDate = self.getDate(evnt.JulianDayStart);
        } else {
            evnt.endDate = self.getDate(evnt.JulianDayEnd);
        }
    };

    this.getDate = function(julianDay) {
        var dateObj = julianToGregorian(julianDay);
        var m = moment(new Date(dateObj.year, dateObj.month - 1, dateObj.day));
        return m;
    };

    this.remove = function() {

    };
}
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

(function ($) {

    $.widget("wellcome.wellcomeTimeline", {

        options: {
        },

        _create: function () {
            var self = this;

            // load config.
            $.getJSON(self.options.configUri, function (config) {

                self.config = config;

                // load data.
                $.getJSON(self.options.dataUri, function (data) {
                    self.data = data;

                    self._viewPackage();
                });
            });
        },

        _viewPackage: function () {
            var self = this;

            self._reset();

            self.options.provider.create(
            {
                element: self.element,
                baseUri: self.options.baseUri,
                timelineId: self.options.timelineId,
                dataUriTemplate: self.options.dataUriTemplate,
                dataUri: self.options.dataUri,
                eventId: self.options.eventId,
                data: self.data,
                config: self.config,
                embedScriptUri: self.options.embedScriptUri,
                isHomeDomain: self.options.isHomeDomain,
                isOnlyInstance: self.options.isOnlyInstance
            });
        },

        _reset: function () {
            var self = this;

            self.element.empty();
            self.options.provider.remove();
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }

    });

})(jQuery);
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
(function ($) {

    $.widget("wellcome.timeline_shell", {

        options: {

        },

        view: function (name, element) {
            this.name = name;
            this.element = element;
        },

        views: [],

        _create: function () {
            var self = this;

            // bind to global events.
            $.wellcome.timeline.bind($.wellcome.timeline.RESIZE, function () {
                self._resize();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.SHOW_EVENT_DETAILS_DIALOGUE, function () {
                //self.overlayMaskElem.show();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.HIDE_EVENT_DETAILS_DIALOGUE, function () {
                //self.overlayMaskElem.hide();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.SHOW_EMBED_DIALOGUE, function () {
                self.overlayMaskElem.show();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.HIDE_EMBED_DIALOGUE, function () {
                self.overlayMaskElem.hide();
            });

            // create ui.
            self.containerElem = self.element;

            self.headerPanelElem = $('<div class="headerPanel"></div>');
            self.containerElem.append(self.headerPanelElem);
            self.views.push(new self.view('header', self.headerPanelElem));

            self.mainPanelElem = $('<div class="mainPanel"></div>');
            self.containerElem.append(self.mainPanelElem);
            self.views.push(new self.view('main', self.mainPanelElem));

            self.footerPanelElem = $('<div class="footerPanel"></div>');
            self.containerElem.append(self.footerPanelElem);
            self.views.push(new self.view('footer', self.footerPanelElem));

            self.detailsViewElem = $('<div class="overlay detailsView"></div>');
            self.containerElem.append(self.detailsViewElem);
            self.views.push(new self.view('details', self.detailsViewElem));

            self.overlayMaskElem = $('<div class="overlayMask"></div>');
            self.containerElem.append(self.overlayMaskElem);

            self.helpViewElem = $('<div class="overlay helpView"></div>');
            self.containerElem.append(self.helpViewElem);
            self.views.push(new self.view('help', self.helpViewElem));

            self.genericDialogueViewElem = $('<div class="overlay genericDialogueView"></div>');
            self.containerElem.append(self.genericDialogueViewElem);
            self.views.push(new self.view('genericDialogue', self.genericDialogueViewElem));

            self.embedViewElem = $('<div class="overlay embedView"></div>');
            self.containerElem.append(self.embedViewElem);
            self.views.push(new self.view('embed', self.embedViewElem));

            // init ui
            self.overlayMaskElem.hide();

            self.overlayMaskElem.click(function (e) {
                e.preventDefault();

                self._trigger('onCloseActiveDialogue');
            });
        },

        _toggleFullScreen: function () {
            var self = this;

            var $win = $(window);
            self.containerElem.width($win.width());
            self.containerElem.height($win.height());
        },

        _resize: function () {
            var self = this;

            var $win = $(window);
            var width = $win.width();
            var height = $win.height();

            self.containerElem.width(width);
            self.containerElem.height(height);

            var mainHeight = height - self.headerPanelElem.outerHeight(true) - self.footerPanelElem.outerHeight(true); // - 8; // 8px top border

            self.mainPanelElem.height(mainHeight);

            // position details view
            var minTop = self.headerPanelElem.height() + self.mainPanelElem.find('#scroll').height();
            var top;
            if (height - self.footerPanelElem.height() < minTop + self.detailsViewElem.height()) {
                top = (height / 2) - (self.detailsViewElem.height() / 2);
            } else {
                top = minTop;
            }

            self.detailsViewElem.css({
                top: top,
                left: (width / 2) - (self.detailsViewElem.width() / 2)
            });

            // resize overlay mask
            self.overlayMaskElem.width(width);
            self.overlayMaskElem.height(height);

            // position dialogue view
            self._centerView(height, width, self.genericDialogueViewElem);

            // position embed view
            self.embedViewElem.css({
                top: height - self.embedViewElem.outerHeight(true)
            });
        },

        _centerView: function (height, width, view) {
            view.css({
                top: (height / 2) - (view.height() / 2),
                left: (width / 2) - (view.width() / 2)
            });
        },

        getView: function (name) {
            var self = this;

            for (var i = 0; i < self.views.length; i++) {
                var view = self.views[i];

                if (view.name.toLowerCase() == name.toLowerCase()) return view.element;
            }

            return null;
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }

    });

})(jQuery);
(function ($) {

    $.widget("wellcome.timeline_headerPanelView", {

        isZoomInEnabled: true,
        isZoomOutEnabled: true,
        isNavigating: false,

        _create: function () {
            var self = this;

            // bind to global events.
            $.wellcome.timeline.bind($.wellcome.timeline.RESIZE, function () {
                self._resize();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.START_ZOOM, function () {
                self._disableZoomIn();
                self._disableZoomOut();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.FINISH_ZOOM, function () {
                self._refresh();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.START_SCROLL, function (e, direction) {
                self._disableZoomIn();
                self._disableZoomOut();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.START_NAVIGATING, function (e, direction) {
                self.isNavigating = true;
            });

            $.wellcome.timeline.bind($.wellcome.timeline.FINISH_NAVIGATING, function (e, direction) {
                self.isNavigating = false;
            });
            
            $.wellcome.timeline.bind($.wellcome.timeline.REFRESHED, function () {
                self._refresh();
            });

            // create ui.
            self.leftColElem = $('<div class="leftCol"></div>');
            self.element.append(self.leftColElem);

            self.titleElem = $('<div class="title"></div>');
            self.leftColElem.append(self.titleElem);

            self.rightColElem = $('<div class="rightCol"></div>');
            self.element.append(self.rightColElem);

            self.zoomOutButtonElem = $('<div class="zoomOut"></div>');
            self.rightColElem.append(self.zoomOutButtonElem);

            self.zoomInButtonElem = $('<div class="zoomIn"></div>');
            self.rightColElem.append(self.zoomInButtonElem);

            // init ui.

            self.title = $.wellcome.timeline.options.provider.data.Title;

            // add start and end dates to title.
            self.title += ": <span>" + $.wellcome.timeline.provider.data.StartDateDisplay + " - " + $.wellcome.timeline.provider.data.EndDateDisplay + "</span>";

            self.titleElem.ellipsisFill(self.title);

            self.zoomInButtonElem.prop('title', $.wellcome.timeline.options.config.HeaderPanelView.ZoomIn);
            
            self.zoomOutButtonElem.prop('title', $.wellcome.timeline.options.config.HeaderPanelView.ZoomOut);

            // ui event handlers.
            self.zoomInButtonElem.on('click', function (e) {
                e.preventDefault();

                if (self.isZoomInEnabled) {
                    self._trigger('onZoomIn');
                }
            });

            self.zoomOutButtonElem.on('click', function (e) {
                e.preventDefault();

                if (self.isZoomOutEnabled) {
                    self._trigger('onZoomOut');
                }
            });
        },

        _disableZoomIn: function () {
            var self = this;

            self.isZoomInEnabled = false;
            self.zoomInButtonElem.fadeTo(0, 0.5);
        },

        _enableZoomIn: function () {
            var self = this;

            self.isZoomInEnabled = true;
            self.zoomInButtonElem.fadeTo(0, 1);
        },

        _disableZoomOut: function () {
            var self = this;

            self.isZoomOutEnabled = false;
            self.zoomOutButtonElem.fadeTo(0, 0.5);
        },

        _enableZoomOut: function () {
            var self = this;

            self.isZoomOutEnabled = true;
            self.zoomOutButtonElem.fadeTo(0, 1);
        },

        _resize: function () {
            var self = this;

            var availWidth = self.element.width() - self.rightColElem.width();

            self.leftColElem.width(availWidth);

            self.titleElem.ellipsisFill(self.title);
        },

        _refresh: function () {
            var self = this;

            if (self.isNavigating) return;

            if ($.wellcome.timeline.isMinZoom) {
                self._disableZoomOut();
            } else {
                self._enableZoomOut();
            }

            if ($.wellcome.timeline.isMaxZoom) {
                self._disableZoomIn();
            } else {
                self._enableZoomIn();
            }
        },

        _init: function () {
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }
    });

})(jQuery);


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
(function ($) {

    $.widget("wellcome.timeline_footerPanelView", {

        _create: function () {
            var self = this;

            // bind to global events.
            $.wellcome.timeline.bind($.wellcome.timeline.TOGGLE_FULLSCREEN, function (e, obj) {
                self._toggleFullScreen(obj);
            });

            // create ui.
            self.optionsContainerElem = $('<div class="options"></div>');
            self.element.append(self.optionsContainerElem);

            self.embedButtonElem = $('<a class="imageButton embed"></a>');
            self.optionsContainerElem.append(self.embedButtonElem);

            self.fullScreenButtonElem = $('<a class="imageButton fullScreen"></a>');
            self.optionsContainerElem.append(self.fullScreenButtonElem);

            // init ui.
            self.fullScreenButtonElem.click(function (e) {
                e.preventDefault();

                self._trigger('onToggleFullScreen');
            });

            self.embedButtonElem.click(function (e) {
                e.preventDefault();

                self._trigger('onEmbed');
            });

            if (!$.wellcome.timeline.isEmbedEnabled()) self.embedButtonElem.hide();
        },

        _toggleFullScreen: function (isFullScreen) {
            var self = this;

            if (isFullScreen) {
                //$.wellcome.timeline.trackAction("Options", "Fullscreen - Open");

                self.fullScreenButtonElem.removeClass('fullScreen');
                self.fullScreenButtonElem.addClass('normal');
            } else {
                //$.wellcome.timeline.trackAction("Options", "Fullscreen - Close");

                self.fullScreenButtonElem.removeClass('normal');
                self.fullScreenButtonElem.addClass('fullScreen');
            }
        },

        _init: function () {
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }
    });

})(jQuery);
(function ($) {

    $.widget("wellcome.timeline_baseDialogueView", {

        _create: function () {
            var self = this;

            self.isActive = false;
            self.allowClose = true;

            // bind to global events.
            $.wellcome.timeline.bind($.wellcome.timeline.RESIZE, function () {
                self._resize();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.ESCAPE, function () {
                if (self.isActive) {
                    if (self.allowClose) {
                        self.close();
                    }
                }
            });

            $.wellcome.timeline.bind($.wellcome.timeline.CLOSE_ACTIVE_DIALOGUE, function () {
                if (self.isActive) {
                    if (self.allowClose) {
                        self.close();
                    }
                }
            });

            // create ui.
            self.topElem = $('<div class="top"></div>');
            self.element.append(self.topElem);

            self.closeButtonElem = $('<div class="close"></div>');
            self.topElem.append(self.closeButtonElem);

            self.middleElem = $('<div class="middle"></div>');
            self.element.append(self.middleElem);

            self.contentElem = $('<div class="content"></div>');
            self.middleElem.append(self.contentElem);

            self.bottomElem = $('<div class="bottom"></div>');
            self.element.append(self.bottomElem);

            // initialise ui.

            // ui event handlers.
            self.closeButtonElem.click(function (e) {
                e.preventDefault();

                self.close();
            });
        },

        enableClose: function () {
            var self = this;

            self.allowClose = true;
            self.closeButtonElem.show();
        },

        disableClose: function () {
            var self = this;

            self.allowClose = false;
            self.closeButtonElem.hide();
        },

        setArrowPosition: function () {
            var self = this;

            // set bottom background position to mouse x.
            var paddingLeft = parseInt(self.element.css("padding-left"));
            var pos = $.wellcome.timeline.mouseX - paddingLeft - 10;
            if (pos < 0) pos = 0;
            self.bottomElem.css('backgroundPosition', pos + 'px 0px');
        },

        open: function () {
            var self = this;

            self.element.show();
            self.setArrowPosition();
            self.isActive = true;
        },

        close: function () {
            var self = this;

            if (self.isActive) {
                self.element.hide();
                self.isActive = false;

                self._trigger('onClose');
            }
        },

        _resize: function () {
        },

        _init: function () {
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }
    });

})(jQuery);
(function ($) {

    $.widget("wellcome.timeline_genericDialogueView", {

        _create: function () {
            var self = this;

            // bind to global events.

            // create ui.

            // init ui.

        },
		
        _init: function () {
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }
    });

})(jQuery);
(function ($) {

    $.widget("wellcome.timeline_embedView", $.wellcome.timeline_baseDialogueView, {

        embedScriptTemplate: "<div class=\"timeline\" data-uri=\"{0}\" data-eventid=\"{1}\" style=\"width:{2}px; height:{3}px; background-color: #000\"></div>\n<script type=\"text/javascript\" src=\"{4}\"></script><script type=\"text/javascript\">/* wordpress fix */</script>",

        _create: function () {
            var self = this;

            $.wellcome.timeline_baseDialogueView.prototype._create.call(self);

            // bind to global events.
            $.wellcome.timeline.bind($.wellcome.timeline.SHOW_EMBED_DIALOGUE, function () {
                //$.wellcome.timeline.trackAction("Dialogues", "Embed - Open");
                self.open();
            });

            $.wellcome.timeline.bind($.wellcome.timeline.HIDE_EMBED_DIALOGUE, function () {
                //$.wellcome.timeline.trackAction("Dialogues", "Embed - Close");
                self.close();
            });
            
            $.wellcome.timeline.bind($.wellcome.timeline.REFRESHED, function () {
                self._refresh();
            });
            
            $.wellcome.timeline.bind($.wellcome.timeline.START_INDEX_CHANGE, function (e, direction) {
                self._refresh();
            });

            self.smallWidth = 600;
            self.smallHeight = 600;

            self.mediumWidth = 800;
            self.mediumHeight = 600;

            self.largeWidth = 900;
            self.largeHeight = 900;

            self.currentWidth = self.smallWidth;
            self.currentHeight = self.smallHeight;

            // create ui.
            self.titleElem = $('<h1>' + $.wellcome.timeline.options.config.EmbedView.Title + '</h1>');
            self.contentElem.append(self.titleElem);

            self.introElem = $('<p>' + $.wellcome.timeline.options.config.EmbedView.EmbedInstructions + '</p>');
            self.contentElem.append(self.introElem);

            self.codeElem = $('<textarea class="code"></textarea>');
            self.contentElem.append(self.codeElem);

            self.copyToClipboardElem = $('<div class="copyToClipboard"></div>');
            self.contentElem.append(self.copyToClipboardElem);

            //self.copyToClipboardButtonElem = $('<a class="button" href="#">' + $.wellcome.timeline.options.config.EmbedView.CopyToClipboard + '</a>');
            //self.copyToClipboardElem.append(self.copyToClipboardButtonElem);

            self.sizesElem = $('<div class="sizes"></div>');
            self.contentElem.append(self.sizesElem);

            self.smallSizeElem = $('<div class="size small"></div>');
            self.sizesElem.append(self.smallSizeElem);
            self.smallSizeElem.append('<p>' + self.smallWidth + ' x ' + self.smallHeight + '</p>');
            self.smallSizeElem.append('<div class="box"></div>');

            self.mediumSizeElem = $('<div class="size medium"></div>');
            self.sizesElem.append(self.mediumSizeElem);
            self.mediumSizeElem.append('<p>' + self.mediumWidth + ' x ' + self.mediumHeight + '</p>');
            self.mediumSizeElem.append('<div class="box"></div>');

            self.largeSizeElem = $('<div class="size large"></div>');
            self.sizesElem.append(self.largeSizeElem);
            self.largeSizeElem.append('<p>' + self.largeWidth + ' x ' + self.largeHeight + '</p>');
            self.largeSizeElem.append('<div class="box"></div>');

            self.customSizeElem = $('<div class="size custom"></div>');
            self.sizesElem.append(self.customSizeElem);
            self.customSizeElem.append('<p>Custom size</p>');
            self.customSizeWrapElem = $('<div class="wrap"></div>');
            self.customSizeElem.append(self.customSizeWrapElem);
            self.customSizeWidthWrapElem = $('<div class="width"></div>');
            self.customSizeWrapElem.append(self.customSizeWidthWrapElem);
            self.customSizeWidthWrapElem.append('<label for="width">Width</label>');
            self.customWidthElem = $('<input id="width" type="text" maxlength="5"></input>');
            self.customSizeWidthWrapElem.append(self.customWidthElem);
            self.customSizeWidthWrapElem.append('<span>px</span>');
            self.customSizeHeightWrapElem = $('<div class="height"></div>');
            self.customSizeWrapElem.append(self.customSizeHeightWrapElem);
            self.customSizeHeightWrapElem.append('<label for="height">Height</label>');
            self.customHeightElem = $('<input id="height" type="text" maxlength="5"></input>');
            self.customSizeHeightWrapElem.append(self.customHeightElem);
            self.customSizeHeightWrapElem.append('<span>px</span>');

            // initialise ui.

            // ui event handlers.
            self.codeElem.focus(function () {
                $(this).select();
            });

            self.codeElem.mouseup(function (e) {
                e.preventDefault();
            });
            /*
            self.copyToClipboardButtonElem.click(function (e) {
            e.preventDefault();
            });

            self.copyToClipboardButtonElem.zclip({
            path: '/scripts/ZeroClipboard.swf',
            copy: function () { return self.code; },
            afterCopy: function () {
            alert($.wellcome.timeline.options.config.EmbedView.CopiedToClipboard);
            }
            });
            */
            self.smallSizeElem.click(function (e) {
                e.preventDefault();

                self.currentWidth = self.smallWidth;
                self.currentHeight = self.smallHeight;

                self._refresh();
            });

            self.mediumSizeElem.click(function (e) {
                e.preventDefault();

                self.currentWidth = self.mediumWidth;
                self.currentHeight = self.mediumHeight;

                self._refresh();
            });

            self.largeSizeElem.click(function (e) {
                e.preventDefault();

                self.currentWidth = self.largeWidth;
                self.currentHeight = self.largeHeight;

                self._refresh();
            });

            self.smallSizeElem.addClass('selected');

            self.sizesElem.find('.size').click(function (e) {
                e.preventDefault();

                self.sizesElem.find('.size').removeClass('selected');
                $(this).addClass('selected');
            });

            self.customWidthElem.keydown(function (event) {
                numericalInput(event);
            });

            self.customWidthElem.keyup(function (event) {
                self._getCustomSize();
            });

            self.customHeightElem.keydown(function (event) {
                numericalInput(event);
            });

            self.customHeightElem.keyup(function (event) {
                self._getCustomSize();
            });

            self._refresh();

            // hide
            self.element.hide();
        },

        _getCustomSize: function () {
            var self = this;

            self.currentWidth = self.customWidthElem.val();
            self.currentHeight = self.customHeightElem.val();

            self._refresh();
        },

        _refresh: function () {
            var self = this;

            var currentEvent = $.wellcome.timeline.getCurrentEvent();

            var eventId = "";
            
            if (currentEvent) {
                eventId = currentEvent.EventId;
            }

            self.code = String.format(self.embedScriptTemplate,
                $.wellcome.timeline.options.dataUri,
                eventId,
                self.currentWidth,
                self.currentHeight,
                $.wellcome.timeline.options.embedScriptUri);

            self.codeElem.val(self.code);
        },

        _resize: function () {
        },

        _init: function () {
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }
    });

})(jQuery);
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
                }
            });

            self.nextBtnElem.on('click', function (e) {
                e.preventDefault();

                if (self.isNextEnabled) {
                    self._trigger('onSelectNext');
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
