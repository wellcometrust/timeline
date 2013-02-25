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
