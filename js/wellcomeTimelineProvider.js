
WellcomeTimelineProvider.prototype = new BaseProvider();
WellcomeTimelineProvider.prototype.constructor = WellcomeTimelineProvider;

function WellcomeTimelineProvider(options) {

    $.extend(this.options, options, {
        provider: this,
        maxTicks: 100,
        maxYearIntervalWidth: 500,
        maxDecadeIntervalWidth: 2000,
        maxCenturyIntervalWidth: 500,
        zoomAnimationDuration: 1000,
        eventFadeDuration: 500,
        zoomFactor: 3,
        eventStackSize: 3,
        padding: 0
    });

    this.create = function (opts) {
        var self = this;

        $.extend(self.options, opts);

        self.load();

        self.options.element.timeline(self.options);
    };

    this.getTimelineStartDate = function() {
        var self = this;

        return self.getDate(self.data.EarliestJulianDay).add('years', self.options.padding * -1);
    };

    this.getTimelineEndDate = function () {
        var self = this;

        return self.getDate(self.data.LastJulianDay).add('years', self.options.padding);
    };

    this.setEventStartDate = function (evnt) {
        var self = this;

        evnt.startDate = self.getDate(evnt.JulianDayStart);
    };

    this.setEventEndDate = function (evnt) {
        var self = this;

        if (evnt.JulianDayEnd < 0) {
            evnt.endDate = self.getDate(evnt.JulianDayStart);
        } else {
            evnt.endDate = self.getDate(evnt.JulianDayEnd);
        }
    };

    this.getDate = function(julianDay) {
        var dateObj = julianToGregorian(julianDay);
        var m = moment(new Date(dateObj.year, dateObj.month - 1, dateObj.day));
        return m;
    };

    this.remove = function() {

    };
}