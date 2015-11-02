;( function( Backbone, _ ) {
    "use strict";

    var CycleMixins = {

        /**
         * Base component: Backbone.Cycle.Model.
         */
        Model: {

            ahead: function ( n, collectionContext ) {
                var collection = collectionContext || this.collection,
                    index = collection.indexOf( this );

                if ( index === -1 ) throw new Error( "Model " + this.cid + "doesn't exist in the collection." );
                return at_looped( index + n, collection );
            },
            behind: function ( n, collectionContext ) {
                return this.ahead( -n, collectionContext );
            },
            next: function ( collectionContext ) {
                return this.ahead( 1, collectionContext );
            },
            prev: function ( collectionContext ) {
                return this.behind( 1, collectionContext );
            },
            aheadNoLoop: function ( n, collectionContext ) {
                var collection = collectionContext || this.collection,
                    index = collection.indexOf( this );

                if ( index === -1 ) throw new Error( "Model " + this.cid + "doesn't exist in the collection." );
                return at_noLoop( index + n, collection );
            },
            behindNoLoop: function ( n, collectionContext ) {
                return this.aheadNoLoop( -n, collectionContext );
            },
            nextNoLoop: function ( collectionContext ) {
                return this.aheadNoLoop( 1, collectionContext );
            },
            prevNoLoop: function ( collectionContext ) {
                return this.behindNoLoop( 1, collectionContext );
            },

            _cycleType: "Backbone.Cycle.Model"

        },

        /**
         * Backbone.Cycle.SelectableCollection
         *
         * Also includes Backbone.Select.One, no need to apply it separately.
         */
        SelectableCollection: {

            selectAt: function ( index, options ) {
                // Convenience method, unrelated to the cycle functionality
                var model = at_noLoop( index, this );
                if ( model ) {
                    this.select( model, options );
                } else {
                    throw new Error( "Model with index " + index + " doesn't exist in the collection and can't be selected." );
                }
                return this;
            },

            selectNext: function ( options ) {
                this.select( this.next( options ), options );
                return this;
            },
            selectPrev: function ( options ) {
                this.select( this.prev( options ), options );
                return this;
            },
            selectNextNoLoop: function ( options ) {
                var next = this.nextNoLoop( options );
                if ( next ) this.select( next, options );
                return this;
            },
            selectPrevNoLoop: function ( options ) {
                var prev = this.prevNoLoop( options );
                if ( prev ) this.select( prev, options );
                return this;
            },
            ahead: function ( n, options ) {
                var label = options && options.label || this._pickyDefaultLabel;
                if ( !this[label] ) throw new Error( 'Illegal call of SelectableCollection navigation method. No model had been selected to begin with (using label "' + label + '").' );
                return at_looped( this.indexOf( this[label] ) + n, this );
            },
            behind: function ( n, options ) {
                return this.ahead( -n, options );
            },
            next: function ( options ) {
                return this.ahead( 1, options );
            },
            prev: function ( options ) {
                return this.behind( 1, options );
            },
            aheadNoLoop: function ( n, options ) {
                var label = options && options.label || this._pickyDefaultLabel;
                if ( !this[label] ) throw new Error( 'Illegal call of SelectableCollection navigation method. No model had been selected to begin with (using label "' + label + '").' );
                return at_noLoop( this.indexOf( this[label] ) + n, this );
            },
            behindNoLoop: function ( n, options ) {
                return this.aheadNoLoop( -n, options );
            },
            nextNoLoop: function ( options ) {
                return this.aheadNoLoop( 1, options );
            },
            prevNoLoop: function ( options ) {
                return this.behindNoLoop( 1, options );
            },

            selectInitial: function () {
                // A model gets passed in as first argument during an add event, but not during a reset, thus distinguishing
                // the two.
                var autoSelectAt,
                    isReset = arguments.length && !( arguments[0] instanceof Backbone.Model ),
                    skipFlagPrefix = "_cycle_skipSelectInitial_";

                _.each( this._cycleOpts.autoSelect, function ( autoSelectValue, label ) {
                    var skipFlag = skipFlagPrefix + label;

                    if ( this.length && !this[label] && !this[skipFlag] ) {
                        autoSelectAt = getAutoSelectIndex( autoSelectValue, this.models );

                        if ( !isReset ) {

                            // Check if there is a selected model elsewhere in the collection - meaning that a batch of
                            // models has been added and one of them had already been selected beforehand.
                            //
                            // (All models passed to .add() are added to the collection before the first `add` event is
                            // fired. Ie, when the code here is running, this.models is already up to date.)
                            //
                            // The add events are now fired one by one, and the Backbone.Select mixin will update the
                            // collection when the turn of the selected model has come. Don't do an auto selection here,
                            // then.
                            //
                            // (And set a flag for the remaining add events, so the expensive search for the selected
                            // model does not get repeated.)

                            if ( this.find( function ( model ) { return model[label]; } ) ) this[skipFlag] = true;
                        }

                        if ( !this[skipFlag] && at_noLoop( autoSelectAt, this ) ) this.selectAt( autoSelectAt, { label: label } );
                    }

                    // Delete the skip flag if necessary, once Backbone.Select has updated the selection
                    if ( this[label] && this[skipFlag] ) delete this[skipFlag];

                }, this );
            },

            selectOnRemove: function ( model, collection, options ) {
                var selectIndex, modelIndex,
                    label = options && options.label || collection._pickyDefaultLabel,
                    optionValue = this._cycleOpts.selectIfRemoved && this._cycleOpts.selectIfRemoved[label];

                options || ( options = {} );
                if ( options._externalEvent !== "remove" ) return;
                if ( !optionValue || !this.length ) return;

                modelIndex = options.index;

                // NB The model is already deselected and removed from the collection (and collection.length is already
                // adjusted).
                selectIndex = optionValue.indexOf( "next" ) !== -1 ? modelIndex : modelIndex - 1;
                if ( optionValue.indexOf( "NoLoop" ) !== -1 ) {
                    // Limit to available index range, without looping
                    selectIndex = Math.max( Math.min( selectIndex, this.length - 1 ), 0 );
                }

                this.select( at_looped( selectIndex, this ), options );
            },

            _cycleType: "Backbone.Cycle.SelectableCollection"

        }

    };

    /**
     * Public setup methods for the mixins
     */
    Backbone.Cycle = {

        Model: {

            /**
             * Model mixin
             * -----------
             *
             * @param {Object} hostObject
             */
            applyTo: function ( hostObject ) {
                _.extend( hostObject, CycleMixins.Model );
            }

        },

        SelectableModel: {

            /**
             * SelectableModel mixin
             * ---------------------
             *
             * The SelectableModel mixin provides the same methods as the Model mixin. (It isn't even represented by an
             * object of its own in CycleMixins.)
             *
             * In addition to the Model mixin methods, it includes Backbone.Select.Me, making the host object selectable
             * (as the mixin name suggests). There is no need to apply Backbone.Select.Me separately.
             *
             * @param {Object} hostObject
             * @param {Object} [options]   Backbone.Select.Me setup options
             */
            applyTo: function ( hostObject, options ) {
                // Apply the Backbone.Select.Me mixin
                Backbone.Select.Me.applyTo( hostObject, options );

                // Apply the Cycle.Model mixin and an identifier for Cycle.SelectableModel
                _.extend( hostObject, CycleMixins.Model, { _cycleType: "Backbone.Cycle.SelectableModel" } );
            }

        },

        SelectableCollection: {

            /**
             * SelectableCollection mixin
             * --------------------------
             *
             * Backbone.Cycle.SelectableCollection requires Backbone.Select. Therefore, the setup extends the host object with
             * Backbone.Select.One in the process (no need to apply Select.One separately).
             *
             * Backbone.Select.Many is not supported yet.
             *
             * @param {Object}        hostObject
             * @param {Backbone.Cycle.SelectableModel[]} models           models passed to the collection constructor
             * @param {Object}        [options]                           Backbone.Select.One options, and those listed below
             * @param {string|number} [options.autoSelect="none"]         which item to select when the collection is reset:
             *                                                            "first", "last", "none", item index
             * @param {string}        [options.selectIfRemoved="none"]    which item to select when the currently selected item
             *                                                            is removed: "prev", "next", "prevNoLoop", "nextNoLoop",
             *                                                            "none"
             */
            applyTo: function ( hostObject, models, options ) {

                var enableInitialSelection, enableSelectIfRemoved, enableModelSharing, autoSelectIndex;

                // Enforcing the presence of the models argument. (The rest of the arg validation is handled by
                // Backbone.Select.One.)
                if ( arguments.length < 2 ) throw new Error( "The `models` parameter has not been passed to Backbone.Cycle.SelectableCollection.applyTo. Its value can be undefined if no models are passed in during instantiation, but even so, it must be provided." );

                options || ( options = {} );

                // Transfer the options to the host object
                // (NB initialSelection is an alias of autoSelect, but deprecated.)
                hostObject._cycleOpts = {};
                hostObject._cycleOpts.autoSelect = options.autoSelect || options.initialSelection || "none";
                hostObject._cycleOpts.selectIfRemoved  = options.selectIfRemoved || "none";

                // Validate the option values
                validateOptionValue( hostObject, "autoSelect", function ( value ) {
                    return _.contains( [ "first", "last", "none" ], value ) || is_integer( value );
                } );

                validateOptionValue( hostObject, "selectIfRemoved", [ "prev", "next", "prevNoLoop", "nextNoLoop", "none" ] );

                enableInitialSelection = isActiveOption( hostObject._cycleOpts.autoSelect );
                enableSelectIfRemoved = isActiveOption( hostObject._cycleOpts.selectIfRemoved );
                enableModelSharing = options.enableModelSharing || enableInitialSelection || enableSelectIfRemoved;

                // Apply the Backbone.Select.One mixin
                Backbone.Select.One.applyTo( hostObject, models, _.extend( {}, options, { enableModelSharing: enableModelSharing } ) );

                // Apply the Cycle.SelectableCollection mixin
                _.extend( hostObject, CycleMixins.SelectableCollection );

                // Convert string options into hash format (using the default label as key)
                normalizeOption( hostObject, "autoSelect" );
                normalizeOption( hostObject, "selectIfRemoved" );

                // Check for conflicts with ignoreLabel
                validateOptionLabelsNotIgnored( hostObject, "autoSelect" );
                validateOptionLabelsNotIgnored( hostObject, "selectIfRemoved" );

                // Make the options effective by setting up the corresponding event handlers, and the initial selection state
                if ( enableSelectIfRemoved ) hostObject.listenTo( hostObject, "deselect:one", hostObject.selectOnRemove );

                if ( enableInitialSelection ) {

                    if ( models && models.length ) {

                        _.each( hostObject._cycleOpts.autoSelect, function ( autoSelectValue, label ) {

                            if ( !hostObject[label] ) {

                                autoSelectIndex = getAutoSelectIndex( autoSelectValue, models );
                                if ( models[autoSelectIndex] ) {
                                    hostObject[label] = models[autoSelectIndex];
                                    models[autoSelectIndex].select( { label: label } );
                                }

                            }

                        } );

                    }

                    hostObject.listenTo( hostObject, "add", hostObject.selectInitial );
                    hostObject.listenTo( hostObject, "reset", hostObject.selectInitial );
                }

            }

        }

    };


    // Helper function
    function at_looped ( index, collection ) {
        var inRange = index % collection.length;
        if ( inRange < 0 ) inRange = collection.length + inRange;  // in fact subtracting from length because inRange < 0
        return collection.at( inRange );
    }

    function at_noLoop ( index, collection ) {
        var isInRange = index >= 0 && index < collection.length;
        return isInRange ? collection.at( index ) : undefined;
    }

    // Also accepts integers as a string, e.g. "42". Rejects empty strings etc. See http://stackoverflow.com/a/14794066/508355
    // and related fiddle.
    function is_integer ( value ) {
        return !isNaN( value ) && parseInt( Number( value ), 10 ) == value && !isNaN( parseInt( value, 10 ) ); // jshint ignore:line
    }

    function getAutoSelectIndex ( autoSelectValue, models ) {
        return autoSelectValue === "first" ? 0 : ( autoSelectValue === "last" ? models.length - 1 : parseInt( autoSelectValue, 10 ) );
    }

    function validateOptionValue ( entity, optionName, test ) {
        var option = entity._cycleOpts[optionName],
            values = _.isObject( option ) ? _.values( option ) : [option],
            isTestFunc = _.isFunction( test );

        _.each( values, function ( value ) {
            var errMsg,
                passed = isTestFunc ? test( value ) : _.contains( test, value );

            if ( !passed ) {
                errMsg = optionName + ' option: Invalid value "' + value + '"';
                if ( _.isObject( option ) ) errMsg += " inside hash";
                throw new Error( errMsg );
            }

        } );
    }

    function validateOptionLabelsNotIgnored ( entity, optionName ) {
        var option = entity._cycleOpts[optionName],
            labels = _.keys( option ),
            conflicts = _.intersection( entity._pickyIgnoredLabels, labels );

        if ( conflicts.length ) {
            conflicts = _.map( conflicts, function ( label ) { return '"' + label + '"'; } );
            throw new Error( "Conflicting options: Can't define " + optionName + ' behaviour for label ' + conflicts.join( ", " ) + ' because it is ignored in the collection.' );
        }
    }

    function isActiveOption ( option ) {
        var cbIsActive = function ( value ) {
            return value !== "none";
        };

        return ( _.isObject( option ) ) ? _.some( option, cbIsActive ) : cbIsActive( option );
    }

    /**
     * Normalizes the option:
     *
     * - Makes sure plain string values are turned into a hash (using the default label of the entity as key)
     * - Creates an independent copy of hash inputs (so that changes don't appear in the input hash
     * - Makes sure "none" values (redundant) are removed
     *
     * @param {Object} entity      the host object
     * @param {string} optionName  "autoSelect" or "selectIfRemoved"
     */
    function normalizeOption ( entity, optionName ) {
        var hash = {},
            value = entity._cycleOpts[optionName];

        if ( !_.isObject( value )  ) {
            if ( value && value !== "none" ) hash[entity._pickyDefaultLabel] = value;
        } else {
            _.each( value, function ( value, key ) {
                if ( value && value !== "none" ) hash[key] = value;
            } );
        }

        entity._cycleOpts[optionName] = hash;
    }

}( Backbone, _ ));