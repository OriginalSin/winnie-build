window.nsGmx = window.nsGmx || {};
window.nsGmx.StorytellingAccordeonControl = L.Control.extend({
    includes: [Backbone.Events],
    options: {
        position: 'topright',
        openBookmark: 0
    },
    initialize: function(options) {
        L.setOptions(this, L.extend({
            language: nsGmx.Translations.getLanguage()
        }, options));
    },
    onAdd: function(map) {
        this._render();
        if (typeof this.options.openBookmark === 'number') {
            this._switchStory(this.options.openBookmark);
        }
        return this._container;
    },
    onRemove: function(map) {

    },
    _switchStory: function(index) {
        var $container = $(this._container);

        if (index === this._currentStoryIndex) {
            return;
        }

        if (typeof this._currentStoryIndex === 'number') {
            findNode(this._currentStoryIndex).find('.storytellingAccordeonControl-nodeContent').slideUp();
        }

        findNode(index).find('.storytellingAccordeonControl-nodeContent').slideDown();
        this._currentStoryIndex = index;

        this.trigger('storyChanged', this.options.bookmarks[index]);

        function findNode(i) {
            return $container.find('.storytellingAccordeonControl-node[data-story-index=' + i + ']')
        }
    },
    _render: function() {
        var $container = $('<div>')
            .addClass('storytellingAccordeonControl')
            .addClass('leaflet-bar');
        this.options.bookmarks.map(function(bookmark, i) {
            var $node = this._createNode(bookmark, i);
            $node.find('.storytellingAccordeonControl-nodeTitle').on('click', function(je) {
                this._switchStory(i);
            }.bind(this));
            $container.append($node);
        }.bind(this));
        L.DomEvent.disableClickPropagation($container[0]);
        $container[0].addEventListener('mousewheel', L.DomEvent.stopPropagation);
        $container[0].addEventListener('mousemove', L.DomEvent.stopPropagation);
        this._container = $container[0];
        return $container[0];
    },
    _createNode: function(bookmark, i) {
        var lang = this.options.language;
        var $container = $('<div>')
            .addClass('storytellingAccordeonControl-node')
            .attr('data-story-index', i);
        var $title = $('<div>')
            .addClass('storytellingAccordeonControl-nodeTitle')
            .html(lang === 'eng' ? bookmark.name_eng : (bookmark.name_rus || bookmark.name))
            .appendTo($container);
        var $content = $('<div>')
            .addClass('storytellingAccordeonControl-nodeContent')
            .html(lang === 'eng' ? bookmark.description_eng : (bookmark.description_rus || bookmark.name))
            .appendTo($container)
            .hide();
        return $container;
    }
});
