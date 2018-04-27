var nsGmx = nsGmx || {};

nsGmx.AnimationSequence = L.Class.extend({
    includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,

    initialize: function(animations) {
        this._animations = animations;
        this._animationIsComplete = false;
        this._animationInProgress = false;
    },

    toggle: function() {
        // run animations in different order if rewinding
        var anims = this._animationIsComplete ? this._reverseArray(this._animations) : this._animations;
        return this._runSequentially(anims, 'toggle').then(function() {
            this._animationIsComplete = !this._animationIsComplete;
        }.bind(this));
    },

    forward: function() {
        if (this._animationIsComplete) {
            return Promise.reject('complete');
        } else {
            return this._runSequentially(this._animations, 'forward').then(function() {
                this._animationIsComplete = true;
            }.bind(this));
        }
    },

    rewind: function() {
        if (!this._animationIsComplete) {
            return Promise.reject('complete');
        } else {
            return this._runSequentially(this._reverseArray(this._animations), 'rewind').then(function() {
                this._animationIsComplete = false;
            }.bind(this));
        }
    },

    isComplete: function() {
        return this._animationIsComplete;
    },

    _runSequentially: function(anims, methodName) {
        if (this._animationInProgress) {
            return Promise.reject('inprogress');
        } else {
            this._animationInProgress = true;
            return anims.reduce(function(prev, anim) {
                return prev.then(function() {
                    return anim[methodName]();
                });
            }, Promise.resolve()).then(function() {
                this._animationInProgress = false;
            }.bind(this));
        }
    },

    _reverseArray: function(arr) {
        return [].concat(arr).reverse();
    }
});