
function BaseProvider() {
    this.options = {
        dataUriTemplate: '{0}{1}.js'
    };

    this.load = function() {
        var self = this;

        // any custom data manipulation/parsing goes here.
        self.data = self.options.data;
    };
};