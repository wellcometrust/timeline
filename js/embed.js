
(function (window, document, version, callback) {

    var domain, j, d;
    var loaded = false;

    // This line should be carefully maintained. The hostname here is replaced in the build process. It needs
    // to match the regex "domain = '([^']+)';" (don't leave domain blank).
    domain = 'ed-yoga13.internal.digirati.co.uk';

    // only load jQuery if not already included in page.
    if (!(j = window.jQuery) || version > j.fn.jquery || callback(j, domain, loaded)) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "//" + domain + "/js/libs/jquery-1.7.2.min.js";
        script.onload = script.onreadystatechange = function () {
            if (!loaded && (!(d = this.readyState) || d == "loaded" || d == "complete")) {
                callback((j = window.jQuery).noConflict(1), domain, loaded = true);
                j(script).remove();
            }
        };
        document.documentElement.childNodes[0].appendChild(script);
    }
})(window, document, "1.7.2", function ($, domain, jquery_loaded) {

    $.support.cors = true;

    $.when($.getScript('http://' + domain + '/js/libs/easyXDM.min.js'),
        $.getScript('http://' + domain + '/js/libs/json2.js')).done(function () {

            var timelines = $('.timeline');

            var isHomeDomain = true;
            var isOnlyInstance = true;

            if (document.domain != domain) {
                isHomeDomain = false;
            }

            if (timelines.length > 1) {
                isOnlyInstance = false;
            }

            for (var i = 0; i < timelines.length; i++) {
                new Timeline(timelines[i], isHomeDomain, isOnlyInstance);
            }
        });

    function Timeline(element, isHomeDomain, isOnlyInstance) {
        var socket, $timeline, $timelineFrame, dataUri, isFullScreen, height, top, left;

        $timeline = $(element);

        // empty the container of any 'no javascript' messages.
        $timeline.empty();

        // get initial params from the container's 'data-' attributes.
        dataUri = $timeline.attr('data-uri');

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