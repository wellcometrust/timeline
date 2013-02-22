
(function (window, document, version, callback) {

    var j, d;
    var loaded = false;

    // only load jQuery if not already included in page.
    if (!(j = window.jQuery) || version > j.fn.jquery || callback(j, loaded)) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "//ajax.googleapis.com/ajax/libs/jquery/" + version + "/jquery.min.js";
        script.onload = script.onreadystatechange = function () {
            if (!loaded && (!(d = this.readyState) || d == "loaded" || d == "complete")) {
                callback((j = window.jQuery).noConflict(1), loaded = true);
                j(script).remove();
            }
        };
        document.documentElement.childNodes[0].appendChild(script);
    }
})(window, document, "1.7.2", function ($, jquery_loaded) {

    $.support.cors = true;

    // get the script domain.
    var scripts = document.getElementsByTagName('script');
    var domain;

    // loop backwards through the loaded scripts until you reach one with a src.
    // fixes problem in IE when using an empty script with a comment to prevent wordpress wysiwyg editor script-stripping.
    for (var i = scripts.length - 1; i >= 0; i--) {
        var script = scripts[i];
        
        if (script.src) {
            var a = document.createElement('a');
            a.href = script.src;
            domain = a.hostname;
            break;
        }
    }

    $.when($.getScript('//' + domain + '/js/libs/easyXDM.min.js'),
        $.getScript('//' + domain + '/js/libs/json2.js')).done(function () {

            var timelines = $('.timeline');

            var isHomeDomain = document.domain === domain;
            var isOnlyInstance = timelines.length === 1;

            for (var i = 0; i < timelines.length; i++) {
                timeline(timelines[i], isHomeDomain, isOnlyInstance);
            }
        });

    function timeline(element, isHomeDomain, isOnlyInstance) {
        var socket, $timeline, $timelineFrame, dataUri, isFullScreen, height, top, left;

        $timeline = $(element);

        // empty the container of any 'no javascript' messages.
        $timeline.empty();

        // get initial params from the container's 'data-' attributes.
        dataUri = $timeline.attr('data-uri');
        dataUri = encodeURIComponent(dataUri);

        isFullScreen = false;
        height = $timeline.height();
        var position = $timeline.position();
        top = position.top;
        left = position.left;

        $(window).resize(function () {
            resize();
        });

        window.onorientationchange = function () {
            resize();
        };

        createSocket();

        function resize() {
            if (!$timelineFrame) return;

            if (isFullScreen) {
                $timelineFrame.width($(this).width());
                $timelineFrame.height($(this).height());
            } else {
                $timelineFrame.width($timeline.width());
                $timelineFrame.height($timeline.height());
            }
        }

        function redirect(uri) {
            // store current location in cookie.
            jQuery.cookie('wlredirect', window.location.href, { path: '/' });
            window.location.replace(uri);
        }

        function refresh() {
            window.location.reload();
        }

        function triggerSocket(eventName, eventObject) {
            socket.postMessage(JSON.stringify({ eventName: eventName, eventObject: eventObject }));
        }

        function toggleFullScreen(fs) {
            isFullScreen = fs;

            if (isFullScreen) {
                $("html").css("overflow", "hidden");
                window.scrollTo(0, 0);

                var zIndex = 9999;

                $timelineFrame.css({
                    'position': 'fixed',
                    'z-index': zIndex,
                    'height': $(window).height(),
                    'width': $(window).width(),
                    'top': 0,
                    'left': 0
                });
            } else {
                $("html").css("overflow", "auto");

                $timelineFrame.css({
                    'position': 'static',
                    'z-index': 'auto',
                    'height': height,
                    'width': '100%',
                    'top': top,
                    'left': left
                });
            }

            resize();

            triggerSocket("onToggleFullScreen", isFullScreen);
        }

        function createSocket() {

            var uri = "http://" + domain + "/timeline.html?hd=" + isHomeDomain + "&oi=" + isOnlyInstance + "&d=" + dataUri + "&u=" + document.URL;

            socket = new easyXDM.Socket({
                remote: uri,
                container: $timeline.get(0),
                props: { style: { width: "100%", height: $timeline.height() + "px" }, scrolling: "no" },
                onReady: function () {
                    $timelineFrame = $timeline.find('iframe');
                },
                onMessage: function (message, origin) {
                    message = $.parseJSON(message);

                    switch (message.eventName) {
                        case "onToggleFullScreen":
                            toggleFullScreen(message.eventObject);
                            break;
                        case "onRedirect":
                            redirect(message.eventObject);
                            break;
                        case "onRefresh":
                            refresh();
                            break;
                        case "onTrackEvent":
                            //console.log(message.eventObject.category, message.eventObject.action, message.eventObject.label, message.eventObject.value, message.eventObject.noninteraction);
                            if ("undefined" !== typeof (_trackEvent)) {
                                _trackEvent(message.eventObject.category, message.eventObject.action, message.eventObject.label, message.eventObject.value, message.eventObject.noninteraction);
                            }
                            break;
                        default:
                            jQuery(document).trigger(message.eventName, [message.eventObject]);
                            break;
                    }
                }
            });
        }
    }
});