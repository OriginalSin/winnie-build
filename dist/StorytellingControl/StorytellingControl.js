window.nsGmx = window.nsGmx || {};

window.nsGmx.StorytellingControl = L.Control.extend({
    includes: [Backbone.Events],
    options: {
        openBookmark: 0
    },
    initialize: function(options) {
        L.setOptions(this, L.extend({
            language: nsGmx.Translations.getLanguage()
        }, options));

        this._stories = options.bookmarks || [];
        this._currentStoryIndex = this.options.openBookmark || 0;

        //ignore position option
        this.options.position = 'storytellingcenter';
    },
    onAdd: function(map) {
        this._createControlCorner(map);
        this._createContainer();
        if (typeof this.options.openBookmark === 'number') {
            this._updateStory();
        }
        return this._container;
    },
    onRemove: function(map) {
        this._removeControlCorner(map);
    },
    _createControlCorner: function(map) {
        this._controlCornerEl = L.DomUtil.create(
            'div',
            'leaflet-top leaflet-bottom leaflet-left leaflet-right storytellingControl-controlCorner',
            map._controlContainer
        );
        L.DomEvent.disableClickPropagation(this._controlCornerEl);
        this._controlCornerEl.addEventListener('mousewheel', L.DomEvent.stopPropagation);
        this._controlCornerEl.addEventListener('mousemove', L.DomEvent.stopPropagation);
        map._controlCorners['storytellingcenter'] = this._controlCornerEl;
    },
    _removeControlCorner: function(map) {
        map._controlContainer.removeChild(map._controlCorners['storytellingcenter']);
        map._controlCorners['sidebarcenter'] = null;
        this._controlCornerEl = null;
    },
    _renderStory: function () {
        var lang = this.options.language;
        var b = this._stories[this._currentStoryIndex]
        this._storyTitleEl.innerHTML = (lang === 'eng' ? b.name_eng : (b.name_rus || b.name));
        this._storyDescriptionEl.innerHTML = (lang === 'eng' ? b.description_eng : (b.description_rus || b.name));
    },
    _createContainer: function() {
        var container = this._container = L.DomUtil.create('div', 'storytellingControl ui-widget');
        var btnPrevEl = L.DomUtil.create('div', 'storytellingControl-navBtn storytellingControl-btnPrev icon-angle-left', container);
        var btnNextEl = L.DomUtil.create('div', 'storytellingControl-navBtn storytellingControl-btnNext icon-angle-right', container);
        var storyTitleEl = L.DomUtil.create('div', 'storytellingControl-storyTitle', container);
        var storyDecsriptionEl = L.DomUtil.create('div', 'storytellingControl-storyDescription', container);

        L.DomEvent.addListener(btnPrevEl, 'click', this._onPrevButtonClick, this);
        L.DomEvent.addListener(btnNextEl, 'click', this._onNextButtonClick, this);

        this._storyTitleEl = storyTitleEl;
        this._storyDescriptionEl = storyDecsriptionEl;

        this._renderStory();

        return container;
    },
    _updateStory: function() {
        this._renderStory();
        this.trigger('storyChanged', this._stories[this._currentStoryIndex], this._currentStoryIndex);
    },
    _onPrevButtonClick: function() {
        if (--this._currentStoryIndex < 0) {
            this._currentStoryIndex = this._stories.length - 1;
        }
        this._updateStory();
    },
    _onNextButtonClick: function() {
        if (++this._currentStoryIndex >= this._stories.length) {
            this._currentStoryIndex = 0;
        }
        this._updateStory();
    }
})
