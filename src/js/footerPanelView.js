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
