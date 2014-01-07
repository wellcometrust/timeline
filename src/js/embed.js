
(function (window, document, version, callback) {

    // only run this script once per page.
    if (window.wellcomeTimelineScriptIncluded) return;

    window.wellcomeTimelineScriptIncluded = true;

    // get the script location.
    var scripts = document.getElementsByTagName('script');
    var scriptUri;

    // loop backwards through the loaded scripts until you reach last one with a src.
    // fixes problem in IE when using an empty script with a comment to prevent wordpress wysiwyg editor script-stripping.
    for (var i = scripts.length - 1; i >= 0; i--) {
        var s = scripts[i];
        if (s.src) {
            scriptUri = s.src;
            break;
        }
    }

    var j, d;
    var loaded = false;

    // only load jQuery if not already included in page.
    if (!(j = window.jQuery) || version > j.fn.jquery || callback(j, scriptUri, loaded)) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "//ajax.googleapis.com/ajax/libs/jquery/" + version + "/jquery.min.js";
        script.onload = script.onreadystatechange = function () {
            if (!loaded && (!(d = this.readyState) || d == "loaded" || d == "complete")) {
                callback((j = window.jQuery).noConflict(1), scriptUri, loaded = true);
                j(script).remove();
            }
        };
        document.documentElement.childNodes[0].appendChild(script);
    }
})(window, document, "1.7.2", function ($, scriptUri, jqueryLoaded) {

    $.support.cors = true;

    // get the scriptUri domain.
    var a = document.createElement('a');
    a.href = scriptUri;
    var domain = a.hostname;
    var port = (a.port == 80 ? '' : ':' + a.port);

    $.when($.getScript('//' + domain + port + '/js/libs/easyXDM.min.js'),
        $.getScript('//' + domain + port + '/js/libs/json2.min.js')).done(function () {

            var timelines = $('.timeline');

            var isHomeDomain = document.domain === domain;
            var isOnlyInstance = timelines.length === 1;

            for (var i = 0; i < timelines.length; i++) {
                timeline(timelines[i], isHomeDomain, isOnlyInstance);
            }
        });

    function timeline(element, isHomeDomain, isOnlyInstance) {
        var socket, $timeline, $timelineFrame, dataUri, eventId, isFullScreen, height, top, left;

        $timeline = $(element);

        // empty the container of any 'no javascript' messages.
        $timeline.empty();

        // get initial params from the container's 'data-' attributes.
        dataUri = $timeline.attr('data-uri');
        dataUri = encodeURIComponent(dataUri);

        eventId = $timeline.attr('data-eventid');

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

            var uri = "http://" + domain + port + "/timeline.html?" +
                "isHomeDomain=" + isHomeDomain +
                "&isOnlyInstance=" + isOnlyInstance +
                "&dataUri=" + dataUri +
                "&eventId=" + eventId +
                "&embedScriptUri=" + scriptUri +
                "&url=" + document.URL;

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
                            if ("undefined" !== typeof (trackEvent)) {
                                trackEvent(message.eventObject.category, message.eventObject.action, message.eventObject.label, message.eventObject.value);
                            }
                            break;
                        case "onTrackVariable":
                            if ("undefined" !== typeof (trackVariable)) {
                                trackVariable(message.eventObject.slot, message.eventObject.name, message.eventObject.value, message.eventObject.scope);
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