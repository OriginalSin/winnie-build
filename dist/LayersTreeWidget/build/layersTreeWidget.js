window.nsGmx = nsGmx || {};window.nsGmx.Templates = window.nsGmx.Templates || {};window.nsGmx.Templates.LayersTreeWidget = {};
window.nsGmx.Templates.LayersTreeWidget["contentView"] = "<div class=\"gmx-table\">\n" +
    "    <div class=\"gmx-table-cell layersTreeWidget-contentView-primaryIconCell\">\n" +
    "        <i class=\"\n" +
    "            layersTreeWidget-contentView-icon\n" +
    "            layersTreeWidget-contentView-primaryIcon\n" +
    "            layersTreeWidget-contentView-activeArea\n" +
    "        \"></i>\n" +
    "    </div>\n" +
    "    <div class=\"gmx-table-cell layersTreeWidget-contentView-titleCell\">\n" +
    "        <div class=\"\n" +
    "            layersTreeWidget-contentView-title\n" +
    "            layersTreeWidget-contentView-activeArea\n" +
    "        \"></div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "";;
var nsGmx = nsGmx || {};

// options.LayersTree
// options.maxDepth
// options.popoverOptions
// options.showDebugIcon
// options.showCenterIcon
nsGmx.LayersTreeWidget = nsGmx.GmxWidget.extend({
    className: 'layersTreeWidget ui-widget',

    options: {
        maxDepth: Infinity,
        showInfoIcon: true,
		showLegendIcon: false,
        showDebugIcon: false,
        showCenterIcon: false,
        isMobile: false,
        popoversOptions: {
            container: 'body',
            animation: true,
            placement: 'left',
            html: true,
            delay: 1
        }
    },

    events: {
        'wheel': 'reset'
    },

    initialize: function(options) {
        this.options = $.extend(true, this.options, {
            isMobile: nsGmx.Utils &&
                nsGmx.Utils.isMobile &&
                nsGmx.Utils.isMobile()
        }, options);
        this.model = this.options.layersTree;
        this.customViews = {};
        this.render();
    },

    destroy: function () {
        this._childViews && this._childViews.map(function (childView) {
            childView.destroy && childView.destroy();
        })
    },

    setModel: function (model) {
        this.model = model;
        this.render();
    },

    render: function() {
        var ltree = this.model;
        this.destroy();
        this.$el.empty();
        this._childViews = [];
        if (!ltree || !ltree.get('childrenNodes')) {
            return;
        }
        for (var i = 0; i < ltree.get('childrenNodes').length; i++) {
            var childView = new nsGmx.LayersTreeWidget.NodeView({
                model: ltree.get('childrenNodes').at(i),
                rootView: this,
                parentView: this,
                widgetOptions: this.options
            });
            this._childViews.push(childView);
            childView.appendTo(this.$el);
        }
        this.trigger('resize');
    },

    reset: function() {
        if (this._activePopoverView) {
            this._activePopoverView.reset();
        }
        this._activePopoverView = null;
    },

    setActivePopoverView: function(view) {
        this.reset();
        this._activePopoverView = view;
    },

    getActivePopoverView: function() {
        return this._activePopoverView;
    },

    addCustomView: function (nodeId, ViewClass) {
        this.customViews[nodeId] = ViewClass;
        this.render();
    }
});
;
nsGmx.LayersTreeWidget.NodeView = nsGmx.GmxWidget.extend({
    className: 'layersTreeWidgetNode',

    initialize: function(options) {
        this.options = _.extend(this.options || {}, options);
        this.hasChildren = !!this.model.get('childrenNodes') && (this.model.get('depth') < this.options.widgetOptions.maxDepth);
        this.render();
        this.model.on('change:expanded', this._onModelChangeExpanded, this);
    },

    destroy: function () {
        this.model.off('change:expanded', this._onModelChangeExpanded, this);
        this.contentView && this.contentView.destroy && this.contentView.destroy();
        this._childViews && this._childViews.map(function (childView) {
            childView.destroy && childView.destroy();
        });
    },

    render: function() {
        this.$el.empty();
        delete this.contentView;

        this.$contentContainer = $('<div>')
            .addClass('layersTreeWidgetNode-content')
            .addClass('ui-widget-content')
            .addClass('gmx-listNode')
            .appendTo(this.$el);

        if (!this.options.widgetOptions.isMobile) {
            this.$contentContainer.on('mouseenter', function() {
                this.$contentContainer.addClass('ui-state-hover');
            }.bind(this)).on('mouseleave', function() {
                this.$contentContainer.removeClass('ui-state-hover');
            }.bind(this));
        }

        this.$childrenContainer = $('<div>')
            .addClass('layersTreeWidgetNode-children')
            .appendTo(this.$el);

        var id = this.model.get('properties').LayerID || this.model.get('properties').GroupID;
        if (this.options.rootView.customViews[id]) {
            this.contentView = new this.options.rootView.customViews[id]({
                model: this.model,
                rootView: this.options.rootView,
                parentView: this,
                widgetOptions: this.options.widgetOptions
            });
        } else {
            if (this.hasChildren) {
                this.contentView = new nsGmx.LayersTreeWidget.GroupView({
                    model: this.model,
                    rootView: this.options.rootView,
                    parentView: this,
                    widgetOptions: this.options.widgetOptions
                });

                if (this.model.get('expanded')) {
                    for (var i = 0; i < this.model.get('childrenNodes').length; i++) {
                        var childView = new nsGmx.LayersTreeWidget.NodeView({
                            model: this.model.get('childrenNodes').at(i),
                            rootView: this.options.rootView,
                            parentView: this,
                            widgetOptions: this.options.widgetOptions
                        });
                        childView.appendTo(this.$childrenContainer);
                    }
                }
            } else {
                this.contentView = new nsGmx.LayersTreeWidget.LayerView({
                    model: this.model,
                    rootView: this.options.rootView,
                    parentView: this,
                    widgetOptions: this.options.widgetOptions
                });
            }
        }

        this.contentView.appendTo(this.$contentContainer);
        return this;
    },

    _onModelChangeExpanded: function () {
        this.options.rootView.reset();
        this.render();
        this.options.rootView.trigger('resize');
    }
});
;
nsGmx.LayersTreeWidget.ContentView = nsGmx.GmxWidget.extend({
    className: 'gmx-listNode layersTreeWidgetNode-contentView',

    render: function() {
        this.$el.html(nsGmx.Templates.LayersTreeWidget.contentView);
        this.$iconsContainer = this.$el.find('.gmx-table');
        this.$primaryIcon = this.$el.find('.layersTreeWidget-contentView-primaryIcon');
        this.$title = this.$el.find('.layersTreeWidget-contentView-title');
    },

    _addIcon: function(id, iconClass) {
        var $buttonCell = $('<div>')
            .addClass('gmx-table-cell')
            .addClass('layersTreeWidget-contentView-' + id + 'IconCell');
        var $buttonIcon = $('<i>')
            .addClass('layersTreeWidget-contentView-icon')
            .addClass('layersTreeWidget-contentView-secondaryIcon')
            .addClass('layersTreeWidget-contentView-activeArea')
            .addClass('layersTreeWidget-contentView-' + id + 'Icon')
            .addClass(iconClass)
            .appendTo($buttonCell);
        $buttonCell.appendTo(this.$iconsContainer);
        return $buttonIcon;
    },

    _showIcons: function() {
        this.$el.find('.layersTreeWidget-contentView-secondaryIcon')
            .removeClass('layersTreeWidget-contentView-icon_hidden');
    },

    _hideIcons: function() {
        this.$el.find('.layersTreeWidget-contentView-secondaryIcon')
            .addClass('layersTreeWidget-contentView-icon_hidden');
    }
});
;
nsGmx.LayersTreeWidget.LayerView = nsGmx.LayersTreeWidget.ContentView.extend({
    events: {
        'mouseenter': '_onMouseEnter',
        'mouseleave': '_onMouseLeave'
    },

    initialize: function(options) {
        this.options = _.extend(this.options || {}, options);
        this.render();
        this.model.on('change', this.render, this);
    },

    destroy: function () {
        this.model.off('change', this.render, this);
    },

    render: function() {
        nsGmx.LayersTreeWidget.ContentView.prototype.render.apply(this, arguments);

        var parentModel = this.model.get('parent'),
			isRadio = parentModel && parentModel.get('list');
        this.$primaryIcon.addClass(isRadio ? 'icon-radio' : 'icon-check')
            .toggleClass('layersTreeWidget-contentView-icon_hidden', !this.model.get('visible'))
            .on('click', function(je) {
                this.model.setNodeVisibility(!this.model.get('visible'));
            }.bind(this));

        this.$title.html(this._getMetaProperty('title'))
            .on('click', function(je) {
                this.model.setNodeVisibility(!this.model.get('visible'));
            }.bind(this));

        this.options.widgetOptions.showCenterIcon && this._addCenterIcon();
        this.options.widgetOptions.showInfoIcon && this._addInfoIcon();
        this.options.widgetOptions.showLegendIcon && this._addLegendIcon();

        if (this.options.widgetOptions.isMobile) {
            this._showIcons();
        } else {
            this._hideIcons();
        }

        return this;
    },

    reset: function() {
        this.$('.layersTreeWidget-popover').popover('hide');
        if (!this._mouseOver && !this.options.widgetOptions.isMobile) {
            this._hideIcons();
        }
    },

    _onMouseEnter: function() {
        this._mouseOver = true;
        if (!this.options.widgetOptions.isMobile) {
            this._showIcons();
        }
    },

    _onMouseLeave: function() {
        this._mouseOver = false;
        if (this.options.widgetOptions.isMobile) {
            return;
        }
        if (
            (!this.options.rootView.getActivePopoverView() ||
                (this.model.get('id') !== this.options.rootView.getActivePopoverView().model.get('id'))
            )
        ) {
            this._hideIcons();
        }
    },

    _getMetaProperty: function (propName) {
        var hProps = this.model.get('properties')
        var hMetaProps = metaPropertiesToHash(hProps.MetaProperties)

        var lang = (nsGmx.Translations && nsGmx.Translations.getLanguage()) || rus;

        var langPropName = propName + '_' + lang
        var propName = propName

        return hProps[propName] || hMetaProps[langPropName] || hMetaProps[propName]

        function metaPropertiesToHash(metaProps) {
            return Object.keys(metaProps || {}).reduce(function (prev, curr) {
                var h = {}
                h[curr] = metaProps[curr].Value
                return L.extend({}, prev, h)
            }, {})
        }
    },

    _addCenterIcon: function() {
        this._addIcon('center', 'icon-target').on('click', function() {
            this.options.rootView.trigger('centerLayer', this.model);
        }.bind(this));
    },

    _setStyleIcon: function(st, geometryType, contentLegend) {
		var iconClass = 'layersTreeWidget-contentView-icon layersTreeWidget-contentView-activeArea',
			styleNode;
		if (st.iconUrl) {
			styleNode = L.DomUtil.create('div', iconClass + ' layersTreeWidget-contentView-legendIconStyleImage',
				L.DomUtil.create('div', 'gmx-table-cell layersTreeWidget-contentView-legendIconCell', contentLegend));
			var img = new Image();
			img.crossorigin = '';
			img.src = st.iconUrl;
			styleNode.appendChild(img);
		} else {
			styleNode = L.DomUtil.create('div', iconClass + ' layersTreeWidget-contentView-legendIconStyle',
				L.DomUtil.create('div', 'gmx-table-cell layersTreeWidget-contentView-legendIconCell', contentLegend));
			L.DomUtil.addClass(styleNode, geometryType);
			if (st.fillColor) {
				styleNode.style.backgroundColor = L.gmxUtil.dec2rgba(st.fillColor, st.fillOpacity || 1);
			}
			if (st.color) {
				styleNode.style.borderColor = L.gmxUtil.dec2rgba(st.color, st.opacity || 1);
			}
		}
		return styleNode;
    },

    _setSVGIcon: function(node, id) {
		node.innerHTML = '<svg role="img" class="svgIcon"><use xlink:href="#' + id + '" href="#' + id + '"></use></svg>';
    },

    _addLegendIcon: function() {
		var model = this.model,
			changed = model.changed,
			props = model.get('properties'),
			type = props.type && props.type.toLowerCase(),
			isVisible = 'visible' in changed ? changed.visible : props.Visible,
			styles = props.gmxStyles ? props.gmxStyles.styles : [],
			len = styles.length;

		if (type !== 'vector') { return; }

		var iconClass = 'layersTreeWidget-contentView-icon layersTreeWidget-contentView-activeArea',
			parentNode = this.$iconsContainer[0];

		if (len > 1) {
			var styleCountNode = L.DomUtil.create('div', iconClass + ' layersTreeWidget-contentView-legendIconStyleCount');
			this._setSVGIcon(styleCountNode, 'overlays');
			parentNode.insertBefore(styleCountNode, parentNode.firstChild);
		}

		if (len === 1) {
			var buttonCell = this._setStyleIcon(styles[0].RenderStyle, props.GeometryType);
			if (buttonCell) { parentNode.insertBefore(buttonCell, this.$el.find('.layersTreeWidget-contentView-titleCell')[0]); }
		} else if (isVisible) {
			var geometryType = props.GeometryType,
				parentNode = this.$el[0];

			styles.forEach(function(it, i) {
				var st = it.RenderStyle;
				if (st) {
					var contentLegend = L.DomUtil.create('div', 'gmx-table', parentNode),
						eye = L.DomUtil.create('div', iconClass + ' layersTreeWidget-contentView-legendIconEye ' + (st.disabled ? 'disabled' : 'enabled'), contentLegend);
					this._setSVGIcon(eye, 'eye-' + (it.disabled ? 'off' : 'on'));
					L.DomEvent.on(eye, 'click', function (ev) {
						it.disabled = !it.disabled;
						this._setSVGIcon(eye, 'eye-' + (it.disabled ? 'off' : 'on'));
						this.options.rootView.trigger('eyeButtonClick', props.name, i, it.disabled);
					}.bind(this))

					this._setStyleIcon(st, geometryType, contentLegend);
					var title = L.DomUtil.create('div', iconClass + ' layersTreeWidget-contentView-legendIconStyleName',
						L.DomUtil.create('div', 'gmx-table-cell layersTreeWidget-contentView-legendIconCell', contentLegend));
					title.innerHTML = it.Name;
				}
			}.bind(this));
		}
        return true;
    },

    _addInfoIcon: function() {
		var model = this.model,
			props = model.get('properties');

		if (props.description) {
			var descriptionNode = L.DomUtil.create('div', 'layersTreeWidget-contentView-description', this.$title[0]),
				iconClass = 'layersTreeWidget-contentView-icon layersTreeWidget-contentView-activeArea',
				info = L.DomUtil.create('div', iconClass + ' layersTreeWidget-contentView-infoIcon', this.$iconsContainer[0]);
			L.DomEvent.on(info, 'click', function(ev) {
					var str = '',
						props = this.model.get('properties');
					props._isDescription = !props._isDescription;
					if (props._isDescription) {
						str = (props.description || '').trim();
					} else {
					}
					descriptionNode.innerHTML = str;
				}, this);
			this._setSVGIcon(info, 'tl-help');
		}
    }
});
;
nsGmx.LayersTreeWidget.GroupView = nsGmx.LayersTreeWidget.ContentView.extend({
    initialize: function(options) {
        this.options = _.extend(this.options || {}, options);
        this.render();
        this.model.on('change', this.render, this);
        if (!this.options.widgetOptions.isMobile) {
            this.$el.on('mouseenter', this._showIcons.bind(this));
            this.$el.on('mouseleave', this._hideIcons.bind(this));
        }
    },

    destroy: function () {
        this.model.off('change', this.render, this);
    },

    render: function() {
        nsGmx.LayersTreeWidget.ContentView.prototype.render.apply(this, arguments);

        this.$title.html(this.model.get('properties').title)
            .on('click', function(je) {
                this.model.set('expanded', !this.model.get('expanded'));
            }.bind(this));
        this.$primaryIcon
            .toggleClass('icon-right-dir', !this.model.get('expanded'))
            .toggleClass('icon-down-dir', this.model.get('expanded'))
            .on('click', function(je) {
                this.model.set('expanded', !this.model.get('expanded'));
            }.bind(this));

        this.options.widgetOptions.showCenterIcon && this._addCenterIcon();

        if (this.options.widgetOptions.isMobile) {
            this.model.get('expanded') ?
                this._showIcons() :
                this._hideIcons();
        } else {
            this._hideIcons();
        }

        return this;
    },

    _addCenterIcon: function() {
        this._addIcon('center', 'icon-target').on('click', function() {
            this.options.rootView.trigger('centerLayer', this.model);
        }.bind(this));
    }
});
;