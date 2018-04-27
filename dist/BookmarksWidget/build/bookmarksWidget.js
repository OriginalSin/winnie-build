var BookmarksWidgetNode = nsGmx.GmxWidget.extend({
    className: 'ui-widget-content gmx-listNode bookmarksWidgetNode',
    events: {
        'click': function() {
            this._expanded ? this.collapse() : this.expand();
        }
    },
    initialize: function() {
        this.collapse();
    },
    render: function() {
        this.$el.empty();
        this.$el.append($('<div>').addClass('bookmarksWidgetNode-title').html(this.model.get('name_' + nsGmx.Translations.getLanguage())));
        if (this._expanded) {
            this.$el.append($('<div>').addClass('bookmarksWidgetNode-description').html(this.model.get('description')));
            this.$el.find('img').each(function(i, el) {
                el.addEventListener('load', function() {
                    this.trigger('resize');
                }.bind(this));
            }.bind(this));
        }
        return this;
    },
    expand: function() {
        this.trigger('expanding');
        this.$el.addClass('bookmarksWidgetNode_expanded');
        this.$el.removeClass('gmx-listNode_hoverable gmx-listNode_clickable bookmarksWidgetNode_collapsed');
        this._expanded = true;
        this.render();
        this.trigger('expanded');
        this.trigger('resize');
    },
    collapse: function() {
        this.trigger('collapsing');
        this.$el.removeClass('bookmarksWidgetNode_expanded');
        this.$el.addClass('gmx-listNode_hoverable gmx-listNode_clickable bookmarksWidgetNode_collapsed');
        this._expanded = false;
        this.render();
        this.trigger('collapsed');
        this.trigger('resize');
    }
});

nsGmx.BookmarksWidget = nsGmx.SwitchingCollectionWidget.extend({
    className: 'bookmarksWidget ui-widget',
    itemView: BookmarksWidgetNode
});;