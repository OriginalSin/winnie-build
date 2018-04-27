var nsGmx = nsGmx || {};

nsGmx.CssAnimation = L.Class.extend({
    includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,

    options: {
        useAnimation: false
    },

    // <DOMNode> options.el * 
    // <String> optione.prefix *
    // <String> options.property
    // <Boolean> options.useAnimation
    initialize: function(options) {
        L.setOptions(this, L.extend({}, options));
        this.options.useAnimation = this.options.useAnimation && this._featureIsSupported('transition');

        this._animationIsComplete = false;
        this._animationInProgress = false;
        this._updateClasses(this._animationIsComplete);

        if (this.options.useAnimation) {
            L.DomUtil.addClass(this.options.el, this.options.prefix + '-animated')
        }
    },

    toggle: function() {
        if (this._animationInProgress) {
            return new Promise(function(resolve, reject) {
                reject('inprogress');
            });
        }

        return new Promise(function(resolve, reject) {
            if (!this.options.useAnimation) {
                this._updateClasses(!this._animationIsComplete);
                this._animationIsComplete = !this._animationIsComplete;
                resolve();
            } else {
                L.DomEvent.addListener(this.options.el, L.DomUtil.TRANSITION_END, onTransitionEnd, this);
                this._animationInProgress = true;
                this._updateClasses(!this._animationIsComplete); // run animation
            }

            function onTransitionEnd(e) {
                if (e.propertyName === this.options.property) {
                    L.DomEvent.removeListener(this.options.el, L.DomUtil.TRANSITION_END, onTransitionEnd);
                    this._animationIsComplete = !this._animationIsComplete;
                    this._animationInProgress = false;
                    resolve();
                }
            }
        }.bind(this));
    },

    run: function() {
        this.toggle.apply(this, arguments);
    },

    forward: function() {
        if (this._animationIsComplete) {
            return new Promise(function(resolve, reject) {
                reject('complete');
            });
        } else {
            return this.toggle();
        }
    },

    rewind: function() {
        if (!this._animationIsComplete) {
            return new Promise(function(resolve, reject) {
                reject('complete');
            });
        } else {
            return this.toggle();
        }
    },

    isComplete: function() {
        return this._animationIsComplete;
    },

    _updateClasses: function(animationIsComplete) {
        L.DomUtil.addClass(this.options.el, this._getAnimationClass(animationIsComplete));
        L.DomUtil.removeClass(this.options.el, this._getAnimationClass(!animationIsComplete));
    },

    _getAnimationClass: function(animationIsComplete) {
        return this.options.prefix +
            (animationIsComplete ? '-afterAnimation' : '-beforeAnimation') +
            (this.options.property && '-' + this.options.property);
    },

    _featureIsSupported: function(featurename) {
        var feature = false,
            domPrefixes = 'Webkit Moz ms O'.split(' '),
            elm = document.createElement('div'),
            featurenameCapital = null;

        featurename = featurename.toLowerCase();

        if (elm.style[featurename] !== undefined) {
            feature = true;
        }

        if (feature === false) {
            featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
            for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[domPrefixes[i] + featurenameCapital] !== undefined) {
                    feature = true;
                    break;
                }
            }
        }
        return feature;
    }
});