nsGmx.DateInterval = Backbone.Model.extend({
    initialize: function() {
        if (!('dateBegin' in this.attributes) && !('dateEnd' in this.attributes)) {
            this.set(nsGmx.DateInterval.getUTCDayBoundary());
        }
    },
    
    saveState: function() {
        return {
            version: '1.1.0',
            dateBegin: +this.attributes.dateBegin,
            dateEnd: +this.attributes.dateEnd
        }
    },
    
    loadState: function(state) {
        if (!state.version || state.version === '1.1.0' || state.version === '1.0.0') {
            this.set({
                dateBegin: new Date(state.dateBegin),
                dateEnd: new Date(state.dateEnd)
            })
        } else {
            throw 'Unknown state version';
        }
    }
}, {
    //number of milliseconds in one day
    MS_IN_DAY: 24*3600*1000,
    
    //set time to UTC midnight
    toMidnight: function(date) {
        return new Date(date - date % nsGmx.DateInterval.MS_IN_DAY);
    },
    
    getUTCDayBoundary: function(date) {
        date = date || new Date();
        
        var midnight = nsGmx.DateInterval.toMidnight(date);
        return {
            dateBegin: midnight,
            dateEnd: new Date(midnight.valueOf() + nsGmx.DateInterval.MS_IN_DAY)
        }
    }
});