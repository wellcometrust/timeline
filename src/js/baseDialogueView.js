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
