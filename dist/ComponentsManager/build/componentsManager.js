(function(root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        // node.js
        module.exports = factory();
    } else {
        root.cm = factory();
    }
})(this, function() {

    function extend(a, b) {
        for (p in b) {
            if (b.hasOwnProperty(p)) {
                a[p] = b[p];
            }
        }
        return a;
    };

    function Promise() {
        // null = pending
        // true = fulfilled
        // false = rejected
        this.promise = this;
        this._state = null;
        this._onResolve = null;
        this._onReject = null;
        this._done = false;
    };

    Promise.prototype.then = function(onResolve, onReject) {
        this._onResolve = (typeof onResolve === 'function') ? onResolve : null;
        this._onReject = (typeof onReject === 'function') ? onReject : null;
        if (this._state === true && !this._done && this._onResolve) {
            this._onResolve.apply(null, this._onResolveArgs);
            this._done = true;
        }
        if (this._state === false && !this._done && this._onReject) {
            this._onReject.apply(null, this._onRejectArgs);
            this._done = true;
        }
        return this;
    };

    Promise.prototype.resolve = function(value) {
        if (this._state === null) {
            this._state = true;
            if (this._onResolve) {
                this._onResolve(value);
                this._done = true;
            } else {
                // call onResolve in then
                this._onResolveArgs = arguments;
            }
        }
    };

    Promise.prototype.reject = function(reason) {
        if (this._state === null) {
            this._state = false;
            if (this._onReject) {
                this._onReject(reason);
                this._done = true;
            } else {
                // call onReject in then
                this._onRejectArgs = arguments;
            }
        }
    };

    // returns true if secondary array is subset of primary
    var isSubset = function(primary, secondary) {
        for (var i = 0; i < secondary.length; i++) {
            if (primary.indexOf(secondary[i]) === -1) {
                return false;
            }
        }
        return true;
    };

    var ComponentsManager = function() {
        this._options = {
            displayDebugInfo: true
        };
        this._components = {};
        this._createdComponentsIds = [];
        this._pendingComponentsIds = [];
    };

    // fill dependents array in each component
    ComponentsManager.prototype._computeDependents = function() {
        for (id in this._components) {
            if (this._components.hasOwnProperty(id)) {
                var dependencies = this._components[id].dependencies;
                for (var i = 0; i < dependencies.length; i++) {
                    var parentComponent = this._components[dependencies[i]];
                    if (parentComponent) {
                        parentComponent.dependents.push(id);
                    } else {
                        throw 'invalid dependency \'' + dependencies[i] + '\' in \'' + id + '\' component';
                    }
                }
            }
        }
    };

    // get components with no dependencies or with dependencies, 
    // that have allready been created
    ComponentsManager.prototype._getIndependentComponentsIds = function() {
        var independentComponentsIds = [];
        for (id in this._components) {
            if (this._components.hasOwnProperty(id)) {
                if (
                    (
                        (!this._components[id].dependencies.length) ||
                        isSubset(this._createdComponentsIds, this._components[id].dependencies)
                    ) &&
                    (this._createdComponentsIds.indexOf(id) === -1)
                ) {
                    independentComponentsIds.push(id);
                }
            }
        }
        return independentComponentsIds;
    };

    ComponentsManager.prototype._done = function(id, instance) {
        if (instance === false) {
            console.warn('failed to initialize ' + id);
        }
        this._components[id].instance = instance;
        // add current component id to createdComponents list and remove from pendingComponents
        this._createdComponentsIds = this._createdComponentsIds.concat(
            this._pendingComponentsIds.splice(this._pendingComponentsIds.indexOf(id), 1)
        );
        if (!this._pendingComponentsIds.length) {
            var independentComponentsIds = this._getIndependentComponentsIds();
            if (independentComponentsIds.length) {
                // next iteration
                return this._next(independentComponentsIds);
            } else {
                // all components have been initialized
                return true;
            }
        }
    };

    ComponentsManager.prototype._next = function(ids) {
        var self = this;
        var promise = new Promise();

        function parseDone(result) {
            if (result) {
                if (result === true) {
                    promise.resolve();
                } else {
                    result.then(function() {
                        promise.resolve();
                    });
                }
            }
        };

        function hasBrokenDependencies(component, components) {
            var deps = component.dependencies.map(function(id) {
                return components[id].instance;
            });
            for (var i = 0; i < deps.length; i++) {
                if (deps[i] === false) {
                    return true;
                }
            }
            return false;
        }

        this._computeDependents();
        var independentComponentsIds = this._getIndependentComponentsIds();
        for (var i = 0; i < independentComponentsIds.length; i++) {
            // assuming every constructor to be asynchronous
            (function(id) {
                var undef;
                self._pendingComponentsIds.push(id);
                setTimeout(function() {
                    var done = function(instance) {
                        parseDone(self._done(id, instance))
                    };
                    var component = self._components[id];
                    var r = hasBrokenDependencies(component, self._components) ? false : self._components[id].constructor(self, done);
                    if (r !== undef) {
                        parseDone(self._done(id, r));
                    }
                }, 0);
            })(independentComponentsIds[i]);
        }

        return promise;
    };

    /**
     * define a component
     * @param  {String} id
     * @param  {Array} dependencies
     * @param  {Function} constructor
     */
    ComponentsManager.prototype.define = function(id, dependencies, constructor) {
        if (!this._components[id]) {
            this._components[id] = {
                id: id,
                dependencies: dependencies,
                dependents: [],
                constructor: constructor,
                instance: null
            };
        } else {
            throw 'duplicate id \'' + id + '\'';
        }
    };

    /**
     * get component instance by id
     * @param  {String} id
     * @return {Mixed} component instance
     */
    ComponentsManager.prototype.get = function(id) {
        return this._components[id].instance;
    }

    /**
     * create components
     * @param  {components} [components] ids of components to create
     *                                   create all unless specified
     * @return {Promise}
     */
    ComponentsManager.prototype.create = function(components) {
        return this._next(this._getIndependentComponentsIds());
    };

    ComponentsManager.prototype.setOptions = function(opts) {
        extend(this._options, opts);
    };

    var instance = new ComponentsManager();

    instance.ComponentsManager = ComponentsManager;

    instance.deferred = function() {
        return new Promise();
    };

    return instance;
})