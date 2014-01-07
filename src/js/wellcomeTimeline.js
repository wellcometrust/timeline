
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
                isOnlyInstance: self.options.isOnlyInstance,
                url: self.options.url
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