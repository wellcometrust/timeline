
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
                $.getJSON(self.options.dataUri, function(data) {
                    self.data = data;
                    
                    self.viewPackage();
                });
            });
        },

        viewPackage: function () {
            var self = this;

            self.reset();

            //self.getParams();

            var options = {
                element: self.element,
                baseUri: self.options.baseUri,
                timelineId: self.options.timelineId,
                dataUriTemplate: self.options.dataUriTemplate,
                dataUri: self.options.dataUri,
                data: self.data,
                config: self.config,
                uri: self.options.uri,
                isHomeDomain: self.options.isHomeDomain,
                isOnlyInstance: self.options.isOnlyInstance
            };

            self.options.provider.create(options);
        },

        reset: function () {
            var self = this;

            self.element.empty();
            self.options.provider.remove();
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        }

    });

})(jQuery);
