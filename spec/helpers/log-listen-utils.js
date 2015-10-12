// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// No dependencies on other helpers
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// --- Recording event arguments for select/deselect events ---
//
// This is the Sinon/Chai version of getEventSpies in the Backbone.Select helpers (which is Jasmine-based).

/**
 * Creates and returns event spies for select(ed) and deselect(ed) events, including catch-all spies based on wildcards.
 *
 * Creating the spies:
 *
 * - The method takes an observed object, or an array of objects, as the first argument. These objects can be Select.Me
 *   models and Select.One/Select.Many collections.
 *
 * - Optionally, it takes a namespace or an array of namespaces as the second argument. If unspecified, the "selected"
 *   namespace is used.
 *
 * Generated spies:
 *
 * - The spy collection covers all base event types, like "selected", "deselected", "select:one" etc, and their
 *   namespaced variants. The whole set is created for each observed object, regardless of its type.
 *
 * - In addition, wildcard event spies capture all namespaces for a given event type, as well as the un-namespaced base
 *   event. E.g., when the namespaces "selected" and "starred" have been passed in, the "select:one:*" spy captures
 *   "select:one", "select:one:selected" and "select:one:starred" events.
 *
 * - There is also a top-level "*" spy, capturing all selection-related events. It does not capture other events, like
 *   "add", "remove" etc. Usage example: expect( events.get( model, "*" ).toHaveBeenCalledTwice();
 *
 * - Note that there isn't any wildcard for event subtypes like ":one", ":some", ":all" etc. These have to be spelled
 *   out when querying a spy.
 *
 * - The base event types are hard-coded. The list must be modified when new event types are created.
 *
 * Retrieving a spy:
 *
 * - When a single observed object is passed in during creation, and it is NOT wrapped in an array, the method returns a
 *   hash of spies. Event names serve as keys. Example:
 *
 *     var modelEvents = getEventSpies( model, ["selected", "starred"] );
 *     expect( modelEvents["selected:starred"] ).not.toHaveBeenCalled();
 *
 *  - When an array of observed objects is passed in during creation, the method returns a hash table object. Retrieve
 *    the event spy for an object and an event with the .get( object, eventName ) method. Example:
 *
 *      var events = getEventSpies( [ model, collection ], ["selected", "starred"] );
 *      expect( events.get( model, "selected:starred" ) ).not.toHaveBeenCalled();
 *
 *
 * @param   {Backbone.Model|Backbone.Collection|Array} observed  a Select.Me, Select.One or Select.Many entity, or an
 *                                                               array of them (may be mixed object types)
 * @param   {string|string[]}  [namespaces="selected"]
 * @returns {Array|Object}
 */
function getEventSpies ( observed, namespaces ) {
    var eventSpies,
        baseEventNames = _getBackboneSelectBaseEventNames();

    function _getTargetedEventSpies ( observed, eventNames ) {
        var eventSpies = _createSpyObj( eventNames );

        _.each( eventNames, function ( eventName ) {
            observed.listenTo( observed, eventName, eventSpies[eventName] );
        } );

        return eventSpies;
    }

    function _getWildcardEventSpies ( observed, baseEventNames, namespaces ) {
        var wildcardEventNames = _.map( baseEventNames, function ( baseEventName ) {
                return baseEventName + ":*";
            } ),
            eventSpies = _createSpyObj( wildcardEventNames );

        _.each( baseEventNames, function ( baseEventName ) {
            var eventNameVariations = [baseEventName].concat( _getNamespacedEventNames( baseEventName, namespaces ) );
            _.each( eventNameVariations, function ( eventName ) {
                observed.listenTo( observed, eventName, eventSpies[baseEventName + ":*"]);
            } );
        } );

        return eventSpies;
    }

    function _getStarEventSpy ( observed, eventNames ) {
        var eventSpy = sinon.spy();

        _.each( eventNames, function ( eventName ) {
            observed.listenTo( observed, eventName, eventSpy );
        } );

        return { "*": eventSpy };
    }

    function _getEventSpies( observed, baseEventNames, namespaces ) {
        var targetedEventSpies, wildcardEventSpies, starEventSpy,
            eventNames = _getAllEventNames( baseEventNames, namespaces );

        targetedEventSpies = _getTargetedEventSpies( observed, eventNames );
        wildcardEventSpies = _getWildcardEventSpies( observed, baseEventNames, namespaces );
        starEventSpy = _getStarEventSpy( observed, eventNames );

        return _.extend( targetedEventSpies, wildcardEventSpies, starEventSpy );
    }

    namespaces || ( namespaces = ["selected"] );
    if ( _.isString( namespaces ) ) namespaces = [ namespaces ];

    if ( _.isArray( observed ) ) {
        eventSpies = new HashTableForBackboneEntities();
        _.each( observed, function ( singleObserved ) {
            eventSpies._set( singleObserved, _getEventSpies( singleObserved, baseEventNames, namespaces ) );
        } );
    } else {
        eventSpies = _getEventSpies( observed, baseEventNames, namespaces );
    }

    return eventSpies;
}

// --- Helpers ---

function HashTableForBackboneEntities () {
    this._hashTable = {};
}

HashTableForBackboneEntities.prototype._set = function ( entity, entry ) {
    this._hashTable[_getEntityId( entity )] = entry;
};

HashTableForBackboneEntities.prototype.get = function ( entity, category ) {
    return category === undefined ? this._hashTable[_getEntityId( entity )] : this._hashTable[_getEntityId( entity )][category];
};

function _getNamespacedEventNames ( baseEventName, namespaces ) {
    return _.map( namespaces, function ( namespace ) {
        return baseEventName + ":" + namespace;
    } );
}

function _getBackboneSelectBaseEventNames () {
    return [
        "selected", "deselected", "reselected",
        "select:one", "deselect:one", "reselect:one",
        "select:none", "select:some", "select:all", "reselect:any"
    ];
}

function _getEntityId ( entity ) {
    return entity._pickyCid || "model " + entity.cid;
}

function _getAllEventNames ( baseEventNames, namespaces ) {
    var eventNames = baseEventNames;

    _.each( baseEventNames, function ( baseEventName ) {
        var namespacedEventNames = _getNamespacedEventNames( baseEventName, namespaces );
        eventNames = eventNames.concat( namespacedEventNames );
    } );

    return eventNames;
}

function _createSpyObj( methodNames ) {
    var obj = {};
    _.each( methodNames, function ( methodName ) {
        obj[methodName] = sinon.spy();
    } );

    return obj;
}


