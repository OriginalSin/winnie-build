window.nsGmx = window.nsGmx || {};
// window.nsGmx.CompositeScrollView = nsGmx.GmxWidget.extend({});
window.nsGmx.CompositeScrollView = nsGmx.GmxWidget.extend({
    className: 'compositeScrollView',

    // options.customScrollbar
    // options.staticWidget
    // options.scrollingWidget
    initialize: function(options) {
        this.options = _.extend({}, options);
        this.render();
    },

    render: function() {
        this.$el.empty();

        var $staticWidgetContainer = $('<div>').addClass('compositeScrollView-staticWidgetContainer').appendTo(this.$el);
        this.options.staticWidget.appendTo($staticWidgetContainer);

        var $scrollingWidgetContainer = $('<div>').addClass('compositeScrollView-scrollingWidgetContainer').appendTo(this.$el);

        if (this.options.customScrollbar) {
            this.$el.addClass('compositeScrollView_customScrollbar');
            var scrollView = this.scrollView = new nsGmx.ScrollView();
            scrollView.addView(this.options.scrollingWidget);
            scrollView.appendTo($scrollingWidgetContainer);
        } else {
            this.options.scrollingWidget.appendTo($scrollingWidgetContainer);
        }

        this.options.staticWidget.on('resize', this.reset, this);
        this.options.scrollingWidget.on('resize', this.reset, this);

        return this;
    },

    reset: function() {
        this._recalcuatePanes();
        this.options.staticWidget && this.options.staticWidget.reset && this.options.staticWidget.reset();
        this.scrollView && this.scrollView.reset && this.scrollView.reset();
    },

    _recalcuatePanes: function() {
        this.$('.compositeScrollView-scrollingWidgetContainer').height(
            this.$el.height() -
            this.$('.compositeScrollView-staticWidgetContainer').outerHeight(true)
        );
    }
});
