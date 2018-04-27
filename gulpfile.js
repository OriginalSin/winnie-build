var gulp = require('gulp')
var path = require('path')

var coreComponents = [{
    bowerComponent: 'jquery',
    distFiles: ['dist/jquery.js']
}, {
    bowerComponent: 'jquery-ui',
    distFiles: ['jquery-ui.js']
}, {
    bowerComponent: 'handlebars',
    distFiles: ['handlebars.js']
}, {
    bowerComponent: 'underscore',
    distFiles: ['underscore.js']
}, {
    bowerComponent: 'backbone#1.1.2',
    distFiles: ['backbone.js']
// }, {
    // id: 'Leaflet-active-area',
    // bowerComponent: 'Mappy/Leaflet-active-area',
    // distFiles: ['./src/leaflet.activearea.js']
}, {
    id: 'Utils',
    srcDir: './external/GMXCommonComponents/Utils',
    build: false
}, {
    id: 'Popover',
    srcDir: './external/GMXCommonComponents/Popover',
    distDir: './build',
    build: true
}, {
    id: 'translations',
    url: 'http://maps.kosmosnimki.ru/api/translations.js'
}, {
    id: 'CommonStyles',
    srcDir: './external/GMXCommonComponents/CommonStyles',
    distDir: './build',
    build: true
}, {
    id: 'Leaflet-IconLayers',
    srcDir: './external/Leaflet-IconLayers',
    distDir: './src',
    build: false
}, {
    id: 'GmxIconLayers',
    srcDir: './external/GMXCommonComponents/GmxIconLayers',
    build: false
}, {
    id: 'GmxWidget',
    srcDir: './external/GMXCommonComponents/GmxWidget',
    build: false
}, {
    id: 'DropdownMenuWidget',
    srcDir: './external/GMXCommonComponents/DropdownMenuWidget',
    distDir: './build',
    build: true
}, {
    id: 'AuthManager',
    srcDir: './external/GMXCommonComponents/AuthManager',
    distDir: './build',
    build: true
}, {
    id: 'AuthWidget',
    srcDir: './external/GMXCommonComponents/AuthWidget',
    distDir: './build',
    build: true
}, {
    id: 'DateInterval',
    srcDir: './external/GMXCommonComponents/DateInterval',
    build: false
}, {
    id: 'LayersTree',
    srcDir: './external/GMXCommonComponents/LayersTree',
    distDir: './build',
    build: true
}, {
    id: 'animationHelpers',
    srcDir: './external/GMXCommonComponents/animationHelpers',
    build: false
}, {
    id: 'CompositeScrollView',
    srcDir: './external/GMXCommonComponents/CompositeScrollView',
    build: false
}, {
    id: 'SwitchingCollectionWidget',
    srcDir: './external/GMXCommonComponents/SwitchingCollectionWidget',
    build: false
}, {
    id: 'IconSidebarControl',
    srcDir: './external/GMXCommonComponents/IconSidebarControl'
}, {
    id: 'ScrollView',
    srcDir: 'external/GMXCommonComponents/ScrollView',
    distDir: 'build',
    build: true
}, {
    id: 'LayersTreeWidget',
    srcDir: './external/GMXCommonComponents/LayersTreeWidget',
    distDir: './build',
    build: true
}, {
    id: 'CalendarWidget',
    srcDir: './external/GMXCommonComponents/CalendarWidget',
    distDir: './build',
    build: true
}, {
    id: 'BookmarksWidget',
    srcDir: './external/GMXCommonComponents/BookmarksWidget',
    distDir: './build',
    build: true
}, {
    id: 'StorytellingControl',
    srcDir: './external/GMXCommonComponents/StorytellingControl',
    build: false
}, {
    id: 'storytellingAccordeonControl',
    srcDir: './external/GMXCommonComponents/StorytellingAccordeonControl',
    build: false
}, {
    id: 'StateManager',
    srcDir: './external/GMXCommonComponents/StateManager',
    build: false
}, {
    id: 'ComponentsManager',
    srcDir: './external/GMXCommonComponents/ComponentsManager',
    distDir: './build',
    build: true
}
,
// {
    // id: 'winnie-core',
    // srcDir: './external/winnie-core/dist',
    // build: false
// }
{
    id: 'winnie-core',
    srcDir: './external/winnie-core',
    distDir: './dist',
    build: true
}
]

require('./external/GMXBuilder')(gulp, {
    tempDir: './temp',
    distDir: './dist',
    watchExtensions: ['.js', '.css', '.html', '.less', '.svg'],
    distributionExtensions: ['.js', '.css', '.jpg', '.png', '.eot', '.ttf', '.woff', '.svg']
}, [{
    id: 'winnie',
    components: coreComponents
}])
