function baseProvider() {
    this.options = {
        dataUriTemplate: '{0}{1}.js',
        embedScriptUri: 'http://library.wellcome.ac.uk/plugins/timeline/embed.js'
    };

    this.load = function () {
        var self = this;

        // any custom data manipulation/parsing goes here.
        self.data = self.options.data;
    };
}