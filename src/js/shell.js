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