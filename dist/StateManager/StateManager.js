var nsGmx = nsGmx || {};

nsGmx.StateManager = (function() {
    function StateManager(options) {
        this._components = {}; // {component_id: instance} компоненты, к которым применяются данные из пермалинка
        this._data = {}; // хеш {component_id: component_data}, полученый из пермалинка
        this._priorities = {
            10: 'map',
            20: 'balloons'
        };
    }

    // для версий пермалинка 1 и 2
    StateManager.prototype._convertDrawingManagerData = function(drawingObjects, merc) {
        if (!drawingObjects) {
            return null;
        }
        var features = drawingObjects.map(function(e) {
            var f = {};
            f.type = 'Feature';
            f.geometry = L.gmxUtil.geometryToGeoJSON(e.geometry, merc);
            f.properties = {
                lineStyle: {},
                pointStyle: {}
            };
            if (e.text) {
                f.properties.title = e.text;
            }
            if (e.geometry.type.toLowerCase() === 'point') {
                f.properties.type = 'Point';
                f.properties.options = {
                    draggable: true,
                    editable: e.properties.editable || false
                };
            } else {
                if (e.color) {
                    f.properties.lineStyle.color = e.color;
                    f.properties.pointStyle.color = e.color;
                }
                if (e.thickness) {
                    f.properties.lineStyle.weight = e.thickness;
                    f.properties.pointStyle.weight = e.thickness;
                }
                if (e.opacity) {
                    f.properties.lineStyle.opacity = e.opacity / 100;
                    f.properties.pointStyle.opacity = e.opacity / 100;
                }
            }
            return f;
        });
        return {
            version: '1.0.0',
            featureCollection: {
                type: 'FeatureCollection',
                features: features
            }
        };
    };

    StateManager.prototype._v1Deserializer = function(data) {
        return {
            map: {
                position: {
                    x: L.Projection.Mercator.unproject(new L.Point(data.position.x, data.position.y)).lng,
                    y: L.Projection.Mercator.unproject(new L.Point(data.position.x, data.position.y)).lat,
                    z: 17 - data.position.z
                }
            },
            calendar: (function() {
                var commonCalendarData = data.customParamsCollection && data.customParamsCollection.commonCalendar;
                if (!commonCalendarData) {
                    return null;
                }
                if (!commonCalendarData.version) {
                    return commonCalendarData;
                } else if (commonCalendarData.version === '1.0.0') {
                    return commonCalendarData.dateInterval;
                } else {
                    throw new Error('unknown commonCalendar permalink format');
                }
            })(),
            layersTree: data.condition,
            drawingManager: this._convertDrawingManagerData(data.drawnObjects, true),
            baseLayersManager: {
                version: '1.0.0',
                currentID: data.mode
            },
            balloons: data.openPopups
        }
    };

    StateManager.prototype._v2Deserializer = function(data) {
        return {
            map: {
                version: '1.0.0',
                position: data.MapController.position
            },
            calendar: data.FireCalendar,
            layersTree: data.LayersController,
            drawingManager: this._convertDrawingManagerData(data.MapController.drawingObjects, false),
            baseLayersManager: {
                version: '1.0.0',
                currentID: data.MapController.baseLayer,
                activeIDs: [data.MapController.baseLayer]
            }
        }
    }

    StateManager.prototype._v3Deserializer = function(data) {
        return {
            map: data.components.map,
            calendar: data.components.calendar,
            layersTree: data.components.layersTree,
            drawingManager: data.components.drawingManager,
            baseLayersManager: data.components.baseLayersManager,
            balloons: data.components.balloons
        }
    };

    StateManager.prototype._v3Serializer = function(components) {
        return {
            date: (new Date()).toString(),
            timestamp: (new Date()).getTime(),
            version: '3.0.0',
            components: {
                map: components.map,
                calendar: components.calendar,
                layersTree: components.layersTree,
                drawingManager: components.drawingManager,
                baseLayersManager: components.baseLayersManager,
                balloons: components.balloons
            }
        }
    };

    StateManager.prototype.deserializers = {
        '1.0.0': StateManager.prototype._v1Deserializer,
        '2.0.0': StateManager.prototype._v2Deserializer,
        '3.0.0': StateManager.prototype._v3Deserializer
    };

    StateManager.prototype.getPermalinkVersion = function(data) {
        if (data.version) {
            return data.version;
        } else if (data.position && data.mode && data.mapName) {
            return '1.0.0';
        } else if (!!(data.MapController || data.LayersController || data.FireCalendar)) {
            return '2.0.0';
        } else {
            throw 'unknown permalink format';
        }
    };

    StateManager.prototype.setIdentity = function(componentId, instance) {
        this._components[componentId] = instance;
        if (this._componentsData && this._componentsData[componentId]) {
            instance.loadState && instance.loadState(this._componentsData[componentId]);
        }
    };

    StateManager.prototype.loadFromData = function(data) {
        var deserializer = this.deserializers[this.getPermalinkVersion(data)];
        var components = this._componentsData = deserializer && deserializer.call(this, data);
        if (components) {
            // load priveleged objects first
            var privelegedObjectsIds = Object.keys(this._priorities).sort(function(a, b) {
                if (b < a) return 1;
                if (a < b) return -1;
                return 0;
            }).map(function(priority) {
                var componentId = this._priorities[priority];
                var instance = this._components[componentId];
                ensureLoadInstance(instance, componentId);
                return componentId;
            }.bind(this));

            // load other objects
            _(this._components).forEach(function(instance, componentId) {
                if (privelegedObjectsIds.indexOf(componentId) === -1) {
                    ensureLoadInstance(instance, componentId);
                }
            });
        }

        function ensureLoadInstance(instance, componentId) {
            instance && instance.loadState && components[componentId] && instance.loadState(components[componentId]);
        }

        return components;
    };

    // returns components hash
    StateManager.prototype.serialize = function() {
        var componentsData = {};
        _(this._components).forEach(function(instance, componentId) {
            if (instance.saveState) {
                componentsData[componentId] = instance.saveState();
            }
        });
        return this._v3Serializer(componentsData);
    };

    return StateManager;
})();
