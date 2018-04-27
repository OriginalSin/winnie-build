nsGmx.SwitchingCollectionWidget = nsGmx.GmxWidget.extend({
    className: 'switchingCollectionWidget',

    _collapseInactiveViews: function() {
        this._childViews.map(function(v) {
            if (v.cid !== this._activeViewCid) {
                v.collapse();
            }
        }.bind(this));
    },

    initialize: function(opts) {
        opts = opts || {};
        if (!opts.collection) {
            this.collection = new Backbone.Collection();
        }
        this.reEmitEvents = this.reEmitEvents || opts.reEmitEvents || [];
        this.reEmitEvents.push('resize');
        this.itemView = this.itemView || opts.itemView;
        if (!this.itemView) {
            throw new Error('SwitchingCollectionWidget requires \'itemView\'');
        }
        this._activeViewCid = '';
        this._childViews = [];
        this.render();
        this.setCollection(this.collection);
    },

    render: function() {
        this.$el.empty();
        if (!this.collection) {
            return;
        }
        this._childViews.map(function(cv) {
            cv.destroy && cv.destroy();
        });
        this._childViews = this.collection.map(function(model) {
            var childView = new this.itemView({
                model: model
            });

            childView.on('expanding', function() {
                this._activeViewCid = childView.cid;
                this._collapseInactiveViews();
                this.trigger('selected', model);
            }.bind(this));

            this.reEmitEvents && this.reEmitEvents.map(function(evName) {
                childView.on(evName, function() {
                    var args = [evName];
                    for (var i = 0; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    this.trigger.apply(this, args);
                }.bind(this));
            }.bind(this));

            this.$el.append(childView.$el);

            return childView;
        }.bind(this));
        this.trigger('resize');
    },

    setCollection: function(collection) {
        this.collection.off('update', this.render, this);
        this.collection = collection;
        this.collection.on('update', this.render, this);
        this.render();
        this.trigger('resize');
    },
    
    closeActiveItem: function() {
        this._childViews.map(function(v) {
            if (v.cid == this._activeViewCid) {
                v.collapse();
            }
        }.bind(this));
    }
});
