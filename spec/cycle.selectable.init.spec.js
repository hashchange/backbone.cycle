/*global describe, it */
(function () {
    "use strict";

    describe( 'Options for SelectableCollection: autoSelect', function () {

        var Model, m1, m2, m3, models, Collection, collection, events;

        function bindOptions ( options ) {
            return Collection.extend( {
                initialize: function ( models ) {
                    Backbone.Cycle.SelectableCollection.applyTo( this, models, options );
                }
            } );
        }

        function getSelected ( modelArray, label ) {
            label || ( label = "selected" );
            return _.filter( modelArray, function ( model ) { return model[label]; } );
        }

        beforeEach( function () {
            Model = Backbone.Model.extend( {
                initialize: function ( attributes, options ) {
                    Backbone.Cycle.SelectableModel.applyTo( this, options );
                }
            } );

            Collection = Backbone.Collection.extend( {
                initialize: function ( models, options ) {
                    Backbone.Cycle.SelectableCollection.applyTo( this, models, options );
                }
            } );

            m1 = new Model();
            m2 = new Model();
            m3 = new Model();

            models = [m1, m2, m3];
        } );

        describe( 'By default, when creating a collection', function () {

            it( 'has its autoSelect option set to "none"', function () {
                // Internally, "none" is represented by the absence of an entry in _cycleOpts.autoSelect
                collection = new Collection( models );
                expect( collection._cycleOpts.autoSelect ).to.deep.equal( {} );
            } );

        } );

        describe( 'Invalid option values', function () {

            it( 'the collection throws an error when an invalid option value is passed', function () {
                expect( function () { new Collection( models, { autoSelect: "foo" } ); } ).to.throw( 'autoSelect option: Invalid value "foo"' );
            } );

            it( 'the collection throws an error when an invalid option value is passed as part of a hash', function () {
                expect( function () { new Collection( models, { autoSelect: { starred: "foo" } } ); } ).to.throw( 'autoSelect option: Invalid value "foo" inside hash' );
            } );

            it( 'the collection ignores the option when explicitly set to undefined, and uses the default value "none"', function () {
                // Internally, "none" is represented by the absence of an entry in _cycleOpts.autoSelect
                collection = new Collection( models, { autoSelect: undefined } );
                expect( collection._cycleOpts.autoSelect ).to.deep.equal( {} );
            } );

        } );

        describe( 'autoSelect is set to "none"', function () {

            beforeEach( function () {
                Collection = bindOptions( { autoSelect: "none" } );
            } );

            describe( 'all models are deselected initially', function () {

                it( 'when they are passed to the constructor, they remain unselected', function () {
                    collection = new Collection( models );

                    expect( collection.selected ).to.be.undefined;
                    expect( getSelected( models ) ).to.be.empty;
                } );

                it( 'when they are batch-added as the initial models, the remain unselected', function () {
                    collection = new Collection();
                    collection.add( models );

                    expect( collection.selected ).to.be.undefined;
                    expect( getSelected( models ) ).to.be.empty;
                } );

                it( 'when they are passed in on reset, they remain unselected', function () {
                    collection = new Collection();
                    collection.add( models );

                    expect( collection.selected ).to.be.undefined;
                    expect( getSelected( models ) ).to.be.empty;
                } );

            } );

            describe( 'when one of the models is already selected initially', function () {

                beforeEach( function () {
                    m2.select();
                } );

                it( 'when they are passed to the constructor, the selection remains unchanged', function () {
                    collection = new Collection( models );

                    expect( collection.selected ).to.deep.equal( m2 );
                    expect( getSelected( models ) ).to.deep.equal( [m2] );
                } );

                it( 'when they are batch-added as the initial models, the selection remains unchanged', function () {
                    collection = new Collection();
                    collection.add( models );

                    expect( collection.selected ).to.deep.equal( m2 );
                    expect( getSelected( models ) ).to.deep.equal( [m2] );
                } );

                it( 'when they are batch-added as the initial models, with options.silent enabled, the selection remains unchanged', function () {
                    collection = new Collection();
                    collection.add( models, { silent: true } );

                    expect( collection.selected ).to.deep.equal( m2 );
                    expect( getSelected( models ) ).to.deep.equal( [m2] );
                } );

                it( 'when they are passed in on reset, the selection remains unchanged', function () {
                    collection = new Collection();
                    collection.reset( models );

                    expect( collection.selected ).to.deep.equal( m2 );
                    expect( getSelected( models ) ).to.deep.equal( [m2] );
                } );

                it( 'when they are passed in on reset, with options.silent enabled, the selection remains unchanged', function () {
                    collection = new Collection();
                    collection.reset( models, { silent: true } );

                    expect( collection.selected ).to.deep.equal( m2 );
                    expect( getSelected( models ) ).to.deep.equal( [m2] );
                } );

            } );

        } );

        describe( 'autoSelect is set to "first"', function () {

            beforeEach( function () {
                Collection = bindOptions( { autoSelect: "first" } );
            } );

            describe( 'all models are deselected initially', function () {

                beforeEach( function () {
                    events = getEventSpies( models );
                } );

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        sinon.spy( m1, "trigger" );
                        collection = new Collection( models );
                    } );

                    it( 'the first model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m1 );
                        expect( getSelected( models ) ).to.deep.equal( [m1] );
                    } );

                    // NB Events:
                    //
                    // A select:one event is not triggered on the collection. For one, it can't be done because
                    // initialize is run before the models are added to the collection. Also, it is pointless.
                    // External listeners can't be attached while the collection is being created.

                    it( 'a selected event is triggered on the first model', function () {
                        expect( events.get( m1, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( m1, "selected" ) ).to.have.been.calledWith( m1, { label: "selected" } );
                    } );

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( models.concat( collection ) );

                        collection.add( models );
                    } );

                    it( 'the first model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m1 );
                        expect( getSelected( models ) ).to.deep.equal( [m1] );
                    } );

                    it( 'a selected event is triggered on the first model', function () {
                        expect( events.get( m1, "selected" ) ).to.have.been.calledWith( m1, { label: "selected" } );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m1, collection, { label: "selected" } );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the first model, without being
                        // preceded by a string of selections and deselections if other models are added before.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are batch-added as the initial models, with options.silent enabled', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( models.concat( collection ) );

                        collection.add( models, { silent: true } );
                    } );

                    it( 'the first model is not selected', function () {
                        expect( collection.selected ).not.to.deep.equal( m1 );
                        expect( getSelected( models ) ).not.to.deep.equal( [m1] );

                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.be.empty;
                    } );

                    it( 'no selected event is triggered on the first model', function () {
                        expect( events.get( m1, "selected" ) ).not.to.have.been.called;
                    } );

                    it( 'no select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m1, collection] );

                        collection.reset( models );
                    } );

                    it( 'the first model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m1 );
                        expect( getSelected( models ) ).to.deep.equal( [m1] );
                    } );

                    it( 'a selected event is triggered on the first model', function () {
                        expect( events.get( m1, "selected" ) ).to.have.been.calledWith( m1, { label: "selected" } );
                    } );

                    it( 'no select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset, with options.silent enabled', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m1, collection] );

                        collection.reset( models, { silent: true } );
                    } );

                    it( 'the first model is not selected', function () {
                        expect( collection.selected ).not.to.deep.equal( m1 );
                        expect( getSelected( models ) ).not.to.deep.equal( [m1] );

                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.be.empty;
                    } );

                    it( 'no selected event is triggered on the first model', function () {
                        expect( events.get( m1, "selected" ) ).not.to.have.been.called;
                    } );

                    it( 'no select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                } );

            } );

            describe( 'one of the models - but not the first one - is already selected initially', function () {

                beforeEach( function () {
                    m2.select();
                } );

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m1] );
                        collection = new Collection( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                    } );

                    // A deselect:one event is not triggered on the collection, in any case. See above for the reasons
                    // (corresponding test with all models deselected).

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m1, collection] );

                        collection.add( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are batch-added as the initial models, with options.silent enabled', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m1, collection] );

                        collection.add( models, { silent: true } );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m1, collection] );

                        collection.reset( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset, with options.silent enabled', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m1, collection] );

                        collection.reset( models, { silent: true } );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

            } );

            describe( 'the collection is already populated, without a selection', function () {

                var newModels, allModels, mA, mB;

                beforeEach( function () {
                    mA = new Model();
                    mB = new Model();

                    newModels = [mA, mB];
                    allModels = models.concat( newModels );
                } );

                describe( 'when new models are batch-added to the end, and none of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        events = getEventSpies( allModels.concat( collection ) );

                        collection.add( newModels );
                    } );

                    it( 'the first model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m1 );
                        expect( getSelected( allModels ) ).to.deep.equal( [m1] );
                    } );

                    it( 'a selected event is triggered on the first model', function () {
                        expect( events.get( m1, "selected" ) ).to.have.been.calledWith( m1, { label: "selected" } );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m1, collection, { label: "selected" } );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the first model, without being
                        // preceded by a string of selections and deselections on other models beforehand.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added to the end, with options.silent enabled, and none of the models is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        events = getEventSpies( allModels.concat( collection ) );

                        collection.add( newModels, { silent: true } );
                    } );

                    it( 'the first model is not selected', function () {
                        expect( collection.selected ).not.to.deep.equal( m1 );
                        expect( getSelected( allModels ) ).not.to.deep.equal( [m1] );

                        expect( collection.selected ).to.be.undefined ;
                        expect( getSelected( allModels ) ).to.deep.equal( [] );
                    } );

                    it( 'no selected event is triggered on the first model', function () {
                        expect( events.get( m1, "selected" ) ).not.to.have.been.called;
                    } );

                    it( 'no select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added to the end, and one of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        mA.select();

                        events = getEventSpies( [m1, collection] );

                        collection.add( newModels );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( mA );
                        expect( getSelected( allModels ) ).to.deep.equal( [mA] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added at the front, and none of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        events = getEventSpies( allModels.concat( collection ) );

                        collection.add( newModels, { at: 0 } );
                    } );

                    it( 'the first model is selected', function () {
                        expect( collection.selected ).to.deep.equal( mA );
                        expect( getSelected( allModels ) ).to.deep.equal( [mA] );
                    } );

                    it( 'a selected event is triggered on the first model', function () {
                        expect( events.get( mA, "selected" ) ).to.have.been.calledWith( mA, { label: "selected" } );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( mA, collection, { label: "selected" } );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the first model, without being
                        // preceded by a string of selections and deselections on other models beforehand.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added at the front, with options.silent enabled, and none of the models is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        events = getEventSpies( allModels.concat( collection ) );

                        collection.add( newModels, { at: 0, silent: true } );
                    } );

                    it( 'the first model is not selected', function () {
                        expect( collection.selected ).not.to.deep.equal( mA );
                        expect( getSelected( allModels ) ).not.to.deep.equal( [mA] );

                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( allModels ) ).to.deep.equal( [] );
                    } );

                    it( 'no selected event is triggered on the first model', function () {
                        expect( events.get( mA, "selected" ) ).not.to.have.been.called;
                    } );

                    it( 'no select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the first model, without being
                        // preceded by a string of selections and deselections on other models beforehand.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added at the front, and one of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        mB.select();

                        events = getEventSpies( [m1, mA, collection] );

                        collection.add( newModels, { at: 0 } );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( mB );
                        expect( getSelected( allModels ) ).to.deep.equal( [mB] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.

                        // Looking at the former first model, m1, as well as the new first model, mA.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

            } );

        } );

        describe( 'autoSelect is set to "last"', function () {

            beforeEach( function () {
                Collection = bindOptions( { autoSelect: "last" } );
            } );

            describe( 'all models are deselected initially', function () {

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m3] );
                        collection = new Collection( models );
                    } );

                    it( 'the last model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    // NB Events:
                    //
                    // A select:one event is not triggered on the collection. For one, it can't be done because
                    // initialize is run before the models are added to the collection. Also, it is pointless.
                    // External listeners can't be attached while the collection is being created.

                    it( 'a selected event is triggered on the last model', function () {
                        expect( events.get( m3, "selected" ) ).to.have.been.calledWith( m3, { label: "selected" } );
                    } );

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( models.concat( collection ) );

                        collection.add( models );
                    } );

                    it( 'the last model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'a selected event is triggered on the last model', function () {
                        expect( events.get( m3, "selected" ) ).to.have.been.calledWith( m3, { label: "selected" } );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m3, collection, { label: "selected" } );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the last model, without being
                        // preceded by a string of selections and deselections while models are added successively.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are batch-added as the initial models, with options.silent enabled', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( models.concat( collection ) );

                        collection.add( models, { silent: true } );
                    } );

                    it( 'the last model is not selected', function () {
                        expect( collection.selected ).not.to.deep.equal( m3 );
                        expect( getSelected( models ) ).not.to.deep.equal( [m3] );

                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.be.empty;
                    } );

                    it( 'no selected event is triggered on the last model', function () {
                        expect( events.get( m3, "selected" ) ).not.to.have.been.called;
                    } );

                    it( 'no select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m3, collection] );

                        collection.reset( models );
                    } );

                    it( 'the last model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'a selected event is triggered on the last model', function () {
                        expect( events.get( m3, "selected" ) ).to.have.been.calledWith( m3, { label: "selected" } );
                    } );

                    it( 'no select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset, with options.silent enabled', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m3, collection] );

                        collection.reset( models, { silent: true } );
                    } );

                    it( 'the last model is not selected', function () {
                        expect( collection.selected ).not.to.deep.equal( m3 );
                        expect( getSelected( models ) ).not.to.deep.equal( [m3] );

                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.be.empty;
                    } );

                    it( 'no selected event is triggered on the last model', function () {
                        expect( events.get( m3, "selected" ) ).not.to.have.been.called;
                    } );

                    it( 'no select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                } );

            } );

            describe( 'one of the models - but not the last one - is already selected initially', function () {

                beforeEach( function () {
                    m2.select();
                } );

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m3] );
                        collection = new Collection( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    // A deselect:one event is not triggered on the collection, in any case. See above for the reasons
                    // (corresponding test with all models deselected).

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m3, collection] );

                        collection.add( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are batch-added as the initial models, with options.silent enabled', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m3, collection] );

                        collection.add( models, { silent: true } );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m3, collection] );

                        collection.reset( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset, with options.silent enabled', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m3, collection] );

                        collection.reset( models, { silent: true } );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

            } );

            describe( 'the collection is already populated, without a selection', function () {

                var newModels, allModels, mA, mB;

                beforeEach( function () {
                    mA = new Model();
                    mB = new Model();

                    newModels = [mA, mB];
                    allModels = models.concat( newModels );
                } );

                describe( 'when new models are batch-added to the end, and none of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        events = getEventSpies( allModels.concat( collection ) );

                        collection.add( newModels );
                    } );

                    it( 'the last model is selected', function () {
                        expect( collection.selected ).to.deep.equal( mB );
                        expect( getSelected( allModels ) ).to.deep.equal( [mB] );
                    } );

                    it( 'a selected event is triggered on the last model', function () {
                        expect( events.get( mB, "selected" ) ).to.have.been.calledWith( mB, { label: "selected" } );
                    } );

                    it( 'no selected event is triggered on the first model of the new batch', function () {
                        expect( events.get( mA, "selected" ) ).not.to.have.been.called;
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( mB, collection, { label: "selected" } );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the last model, without being
                        // preceded by a string of selections and deselections on other models beforehand.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added to the end, with options.silent enabled, and none of the models is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        events = getEventSpies( allModels.concat( collection ) );

                        collection.add( newModels, { silent: true } );
                    } );

                    it( 'the last model is not selected', function () {
                        expect( collection.selected ).not.to.deep.equal( mB );
                        expect( getSelected( allModels ) ).not.to.deep.equal( [mB] );
                    } );

                    it( 'no selected event is triggered on the last model', function () {
                        expect( events.get( mB, "selected" ) ).not.to.have.been.called;
                    } );

                    it( 'no selected event is triggered on the first model of the new batch', function () {
                        expect( events.get( mA, "selected" ) ).not.to.have.been.called;
                    } );

                    it( 'no select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added to the end, and one of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        mA.select();

                        events = getEventSpies( [m3, mB, collection] );

                        collection.add( newModels );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( mA );
                        expect( getSelected( allModels ) ).to.deep.equal( [mA] );
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.

                        // Looking at the former last model, m3, as well as the new last model, mB.
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added at the front, and none of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        events = getEventSpies( allModels.concat( collection ) );

                        collection.add( newModels, { at: 0 } );
                    } );

                    it( 'the last model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( allModels ) ).to.deep.equal( [m3] );
                    } );

                    it( 'a selected event is triggered on the last model', function () {
                        expect( events.get( m3, "selected" ) ).to.have.been.calledWith( m3, { label: "selected" } );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m3, collection, { label: "selected" } );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the last model, without being
                        // preceded by a string of selections and deselections on other models beforehand.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added at the front, with options.silent enabled, and none of the models is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        events = getEventSpies( allModels.concat( collection ) );

                        collection.add( newModels, { at: 0, silent: true } );
                    } );

                    it( 'the last model is not selected', function () {
                        expect( collection.selected ).not.to.deep.equal( m3 );
                        expect( getSelected( allModels ) ).not.to.deep.equal( [m3] );
                    } );

                    it( 'no selected event is triggered on the last model', function () {
                        expect( events.get( m3, "selected" ) ).not.to.have.been.called;
                    } );

                    it( 'no select:one event is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added at the front, and one of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        mA.select();

                        events = getEventSpies( [m3, mB, collection] );

                        collection.add( newModels, { at: 0 } );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( mA );
                        expect( getSelected( allModels ) ).to.deep.equal( [mA] );
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.

                        // Looking at the last model in the collection, m3, as well as the new last model in the new
                        // batch, mB.
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

            } );

        } );

        describe( 'autoSelect is set to an index number', function () {

            describe( 'all models are deselected initially', function () {

                describe( 'the autoSelect index matches a model', function () {

                    beforeEach( function () {
                        Collection = bindOptions( { autoSelect: 1 } );
                    } );

                    describe( 'when models are passed to the constructor', function () {

                        beforeEach( function () {
                            events = getEventSpies( [m2] );
                            collection = new Collection( models );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( m2 );
                            expect( getSelected( models ) ).to.deep.equal( [m2] );
                        } );

                        // NB Events:
                        //
                        // A select:one event is not triggered on the collection. For one, it can't be done because
                        // initialize is run before the models are added to the collection. Also, it is pointless.
                        // External listeners can't be attached while the collection is being created.

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( events.get( m2, "selected" ) ).to.have.been.calledWith( m2, { label: "selected" } );
                        } );

                    } );

                    describe( 'when models are batch-added as the initial models', function () {

                        beforeEach( function () {
                            collection = new Collection();

                            events = getEventSpies( models.concat( collection ) );

                            collection.add( models );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( m2 );
                            expect( getSelected( models ) ).to.deep.equal( [m2] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( events.get( m2, "selected" ) ).to.have.been.calledWith( m2, { label: "selected" } );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m2, collection, { label: "selected" } );
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            // Meaning that the only selection taking place is that of the matching model, without being
                            // preceded by a string of selections and deselections while models are added successively.
                            expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when models are batch-added as the initial models, with options.silent enabled', function () {

                        beforeEach( function () {
                            collection = new Collection();

                            events = getEventSpies( models.concat( collection ) );

                            collection.add( models, { silent: true } );
                        } );

                        it( 'the model matching the index is not selected', function () {
                            expect( collection.selected ).not.to.deep.equal( m2 );
                            expect( getSelected( models ) ).not.to.deep.equal( [m2] );
                        } );

                        it( 'no selected event is triggered on the matching model', function () {
                            expect( events.get( m2, "selected" ) ).not.to.have.been.called;
                        } );

                        it( 'no select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when models are passed in on reset', function () {

                        beforeEach( function () {
                            collection = new Collection();

                            events = getEventSpies( [m2, collection] );

                            collection.reset( models );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( m2 );
                            expect( getSelected( models ) ).to.deep.equal( [m2] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( events.get( m2, "selected" ) ).to.have.been.calledWith( m2, { label: "selected" } );
                        } );

                        it( 'no select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when models are passed in on reset, with options.silent enabled', function () {

                        beforeEach( function () {
                            collection = new Collection();

                            events = getEventSpies( [m2, collection] );

                            collection.reset( models, { silent: true } );
                        } );

                        it( 'the model matching the index is not selected', function () {
                            expect( collection.selected ).not.to.deep.equal( m2 );
                            expect( getSelected( models ) ).not.to.deep.equal( [m2] );
                        } );

                        it( 'no selected event is triggered on the matching model', function () {
                            expect( events.get( m2, "selected" ) ).not.to.have.been.called;
                        } );

                        it( 'no select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                        } );

                    } );

                } );

                describe( 'the index number does not match a model', function () {

                    beforeEach( function () {
                        Collection = bindOptions( { autoSelect: 100 } );
                    } );

                    it( 'when the models are passed to the constructor, no selection is made', function () {
                        collection = new Collection( models );

                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.be.empty;
                    } );

                    it( 'when the models are batch-added as the initial models, no selection is made', function () {
                        collection = new Collection();
                        collection.add( models );

                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.be.empty;
                    } );

                    it( 'when the models are are passed in on reset, no selection is made', function () {
                        collection = new Collection();
                        collection.reset( models );

                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.be.empty;
                    } );

                } );

            } );

            describe( 'one of the models - but not the last one - is already selected initially', function () {

                beforeEach( function () {
                    Collection = bindOptions( { autoSelect: 1 } );
                    m3.select();
                } );

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m2] );
                        collection = new Collection( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no deselected event is triggered on the model matching the index', function () {
                        // ... meaning that the matching model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                    } );

                    // A deselect:one event is not triggered on the collection, in any case. See above for the reasons
                    // (corresponding test with all models deselected).

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m2, collection] );

                        collection.add( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no deselected event is triggered on the model matching the index', function () {
                        // ... meaning that the matching model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are batch-added as the initial models, with options.silent enabled', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m2, collection] );

                        collection.add( models, { silent: true } );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no deselected event is triggered on the model matching the index', function () {
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m2, collection] );

                        collection.reset( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no deselected event is triggered on the model matching the index', function () {
                        // ... meaning that the matching model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset, with options.silent enabled', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m2, collection] );

                        collection.reset( models, { silent: true } );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no deselected event is triggered on the model matching the index', function () {
                        expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

            } );

            describe( 'the collection is already populated, without a selection', function () {

                var newModels, allModels, mA, mB;

                beforeEach( function () {
                    mA = new Model();
                    mB = new Model();

                    newModels = [mA, mB];
                    allModels = models.concat( newModels );
                } );

                describe( 'the autoSelect index is within the original collection range', function () {

                    beforeEach( function () {
                        Collection = bindOptions( { autoSelect: 1 } );
                    } );

                    describe( 'when new models are batch-added to the end, and none of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            events = getEventSpies( allModels.concat( collection ) );

                            collection.add( newModels );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( m2 );
                            expect( getSelected( allModels ) ).to.deep.equal( [m2] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( events.get( m2, "selected" ) ).to.have.been.calledWith( m2, { label: "selected" } );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m2, collection, { label: "selected" } );
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            // Meaning that the only selection taking place is that of the matching model, without being
                            // preceded by a string of selections and deselections on other models beforehand.
                            expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when new models are batch-added to the end, with options.silent enabled, and none of the models is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            events = getEventSpies( allModels.concat( collection ) );

                            collection.add( newModels, { silent: true } );
                        } );

                        it( 'the model matching the index is not selected', function () {
                            expect( collection.selected ).not.to.deep.equal( m2 );
                            expect( getSelected( allModels ) ).not.to.deep.equal( [m2] );
                        } );

                        it( 'no selected event is triggered on the matching model', function () {
                            expect( events.get( m2, "selected" ) ).not.to.have.been.called;
                        } );

                        it( 'no select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when new models are batch-added to the end, and one of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            mA.select();

                            events = getEventSpies( [m2, mB, collection] );

                            collection.add( newModels );
                        } );

                        it( 'the selection remains unchanged', function () {
                            expect( collection.selected ).to.deep.equal( mA );
                            expect( getSelected( allModels ) ).to.deep.equal( [mA] );
                        } );

                        it( 'no deselected event is triggered on the model matching the index', function () {
                            // ... meaning that the matching model hadn't been selected first, and then had the selection
                            // reversed. It should remain deselected the whole time.

                            // Looking at the matching model, m2, as well as the model at the same position in the new
                            // batch, mB.
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when new models are batch-added at the front, and none of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            events = getEventSpies( allModels.concat( collection ) );

                            collection.add( newModels, { at: 0 } );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( mB );
                            expect( getSelected( allModels ) ).to.deep.equal( [mB] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( events.get( mB, "selected" ) ).to.have.been.calledWith( mB, { label: "selected" } );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( mB, collection, { label: "selected" } );
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            // Meaning that the only selection taking place is that of the matching model, without being
                            // preceded by a string of selections and deselections on other models beforehand.
                            expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when new models are batch-added at the front, with options.silent enabled, and none of the models is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            events = getEventSpies( allModels.concat( collection ) );

                            collection.add( newModels, { at: 0, silent: true } );
                        } );

                        it( 'the model matching the index is not selected', function () {
                            expect( collection.selected ).not.to.deep.equal( mB );
                            expect( getSelected( allModels ) ).not.to.deep.equal( [mB] );
                        } );

                        it( 'no selected event is triggered on the matching model', function () {
                            expect( events.get( mB, "selected" ) ).not.to.have.been.called;
                        } );

                        it( 'no select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when new models are batch-added at the front, and one of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            mA.select();

                            events = getEventSpies( [m2, mB, collection] );

                            collection.add( newModels, { at: 0 } );
                        } );

                        it( 'the selection remains unchanged', function () {
                            expect( collection.selected ).to.deep.equal( mA );
                            expect( getSelected( allModels ) ).to.deep.equal( [mA] );
                        } );

                        it( 'no deselected event is triggered on the matching model', function () {
                            // ... meaning that the last model hadn't been selected first, and then had the selection
                            // reversed. It should remain deselected the whole time.

                            // Looking at the matching model before the add, m2, as well as the new matching model after
                            // the add, mB.
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                } );

                describe( 'the autoSelect index is outside of the original collection range, but within the range after adding more models', function () {

                    beforeEach( function () {
                        Collection = bindOptions( { autoSelect: 3 } );
                    } );

                    describe( 'when new models are batch-added to the end, and none of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            events = getEventSpies( allModels.concat( collection ) );

                            collection.add( newModels );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( mA );
                            expect( getSelected( allModels ) ).to.deep.equal( [mA] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( events.get( mA, "selected" ) ).to.have.been.calledWith( mA, { label: "selected" } );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( mA, collection, { label: "selected" } );
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            // Meaning that the only selection taking place is that of the last model, without being
                            // preceded by a string of selections and deselections on other models beforehand.
                            expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when new models are batch-added to the end, with options.silent enabled, and none of the models is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            events = getEventSpies( allModels.concat( collection ) );

                            collection.add( newModels, { silent: true } );
                        } );

                        it( 'the model matching the index is not selected', function () {
                            expect( collection.selected ).not.to.deep.equal( mA );
                            expect( getSelected( allModels ) ).not.to.deep.equal( [mA] );
                        } );

                        it( 'no selected event is triggered on the matching model', function () {
                            expect( events.get( mA, "selected" ) ).not.to.have.been.called;
                        } );

                        it( 'no select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when new models are batch-added to the end, and one of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            mB.select();

                            events = getEventSpies( [mA, collection] );

                            collection.add( newModels );
                        } );

                        it( 'the selection remains unchanged', function () {
                            expect( collection.selected ).to.deep.equal( mB );
                            expect( getSelected( allModels ) ).to.deep.equal( [mB] );
                        } );

                        it( 'no deselected event is triggered on the model matching the index', function () {
                            // ... meaning that the matching model hadn't been selected first, and then had the selection
                            // reversed. It should remain deselected the whole time.
                            expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when new models are batch-added at the front, and none of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            events = getEventSpies( allModels.concat( collection ) );

                            collection.add( newModels, { at: 0 } );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( m2 );
                            expect( getSelected( allModels ) ).to.deep.equal( [m2] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( events.get( m2, "selected" ) ).to.have.been.calledWith( m2, { label: "selected" } );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m2, collection, { label: "selected" } );
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            // Meaning that the only selection taking place is that of the matching model, without being
                            // preceded by a string of selections and deselections on other models beforehand.
                            expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when new models are batch-added at the front, with options.silent enabled, and none of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            events = getEventSpies( allModels.concat( collection ) );

                            collection.add( newModels, { at: 0, silent: true } );
                        } );

                        it( 'the model matching the index is not selected', function () {
                            expect( collection.selected ).not.to.deep.equal( m2 );
                            expect( getSelected( allModels ) ).not.to.deep.equal( [m2] );
                        } );

                        it( 'no selected event is triggered on the matching model', function () {
                            expect( events.get( m2, "selected" ) ).not.to.have.been.called;
                        } );

                        it( 'no select:one event is triggered on the collection', function () {
                            expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m2, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                            expect( events.get( mB, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                    describe( 'when new models are batch-added at the front, and one of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            mB.select();

                            events = getEventSpies( [mA, collection] );

                            collection.add( newModels, { at: 0 } );
                        } );

                        it( 'the selection remains unchanged', function () {
                            expect( collection.selected ).to.deep.equal( mB );
                            expect( getSelected( allModels ) ).to.deep.equal( [mB] );
                        } );

                        it( 'no deselected event is triggered on the model matching the index', function () {
                            // ... meaning that the matching model hadn't been selected first, and then had the selection
                            // reversed. It should remain deselected the whole time.
                            expect( events.get( mA, "deselected" ) ).not.to.have.been.called;
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                        } );

                    } );

                } );

            } );

            describe( 'the autoSelect index is a number passed in as a string', function () {

                describe( 'the index matches a model', function () {

                    beforeEach( function () {
                        Collection = bindOptions( { autoSelect: "1" } );
                    } );

                    it( 'the model matching the index is selected when models are passed to the constructor', function () {
                        collection = new Collection( models );

                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'the model matching the index is selected when models are batch-added as the initial models', function () {
                        collection = new Collection();
                        collection.add( models );

                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                     it( 'the model matching the index is selected when models are passed in on reset', function () {
                        collection = new Collection();
                        collection.reset( models );

                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                } );

            } );

        } );

        describe( 'autoSelect is set to a hash (label "starred" set to "first", label "picked" set to "last")', function () {

            beforeEach( function () {
                Collection = bindOptions( { autoSelect: { starred: "first", picked: "last" } } );
            } );

            describe( 'all models are deselected initially', function () {

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        events = getEventSpies( models, ["selected", "starred", "picked"] );
                        collection = new Collection( models );
                    } );

                    it( 'the first model is starred', function () {
                        expect( collection.starred ).to.deep.equal( m1 );
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [m1] );
                    } );

                    it( 'the last model is picked', function () {
                        expect( collection.picked ).to.deep.equal( m3 );
                        expect( getSelected( models, "picked" ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.deep.equal( [] );
                    } );

                    // NB Events:
                    //
                    // A select:one event is not triggered on the collection. For one, it can't be done because
                    // initialize is run before the models are added to the collection. Also, it is pointless.
                    // External listeners can't be attached while the collection is being created.

                    it( 'a selected event with label "starred" is triggered on the first model (and not on any other)', function () {
                        expect( events.get( m1, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( m1, "selected" ) ).to.have.been.calledWith( m1, { label: "starred" } );
                        expect( events.get( m2, "selected:starred" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:starred" ) ).not.to.have.been.called;
                    } );

                    it( 'a selected event with label "picked" is triggered on the last model (and not on any other)', function () {
                        expect( events.get( m3, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( m3, "selected" ) ).to.have.been.calledWith( m3, { label: "picked" } );
                        expect( events.get( m1, "selected:picked" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:picked" ) ).not.to.have.been.called;
                    } );

                    it( 'no selected event with the label "selected" is triggered, on any model', function () {
                        expect( events.get( m1, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:selected" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( models.concat( collection ), ["selected", "starred", "picked"] );

                        collection.add( models );
                    } );

                    it( 'the first model is starred', function () {
                        expect( collection.starred ).to.deep.equal( m1 );
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [m1] );
                    } );

                    it( 'the last model is picked', function () {
                        expect( collection.picked ).to.deep.equal( m3 );
                        expect( getSelected( models, "picked" ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.deep.equal( [] );
                    } );

                    it( 'a selected event with label "starred" is triggered on the first model (and not on any other)', function () {
                        expect( events.get( m1, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( m1, "selected" ) ).to.have.been.calledWith( m1, { label: "starred" } );
                        expect( events.get( m2, "selected:starred" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:starred" ) ).not.to.have.been.called;
                    } );

                    it( 'a selected event with label "picked" is triggered on the last model (and not on any other)', function () {
                        expect( events.get( m3, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( m3, "selected" ) ).to.have.been.calledWith( m3, { label: "picked" } );
                        expect( events.get( m1, "selected:picked" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:picked" ) ).not.to.have.been.called;
                    } );

                    it( 'no selected event with the label "selected" is triggered, on any model', function () {
                        expect( events.get( m1, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:selected" ) ).not.to.have.been.called;
                    } );

                    it( 'a select:one event with label "starred" is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m1, collection, { label: "starred" } );
                    } );

                    it( 'a select:one event with label "picked" is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m3, collection, { label: "picked" } );
                    } );

                    it( 'no other select:one events than these two are triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledTwice;
                    } );

                    it( 'no deselected event is triggered on any model, for any namespace', function () {
                        // Meaning that the only selection taking place, for any given namespace, is that of the
                        // auto-selected model, without being preceded by a string of selections and deselections if
                        // other models are added before.
                        expect( events.get( m1, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected:*" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection, for any namespace', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one:*" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( models.concat( collection ), ["selected", "starred", "picked"] );

                        collection.reset( models );
                    } );

                    it( 'the first model is starred', function () {
                        expect( collection.starred ).to.deep.equal( m1 );
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [m1] );
                    } );

                    it( 'the last model is picked', function () {
                        expect( collection.picked ).to.deep.equal( m3 );
                        expect( getSelected( models, "picked" ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.deep.equal( [] );
                    } );

                    it( 'a selected event with label "starred" is triggered on the first model (and not on any other)', function () {
                        expect( events.get( m1, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( m1, "selected" ) ).to.have.been.calledWith( m1, { label: "starred" } );
                        expect( events.get( m2, "selected:starred" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:starred" ) ).not.to.have.been.called;
                    } );

                    it( 'a selected event with label "picked" is triggered on the last model (and not on any other)', function () {
                        expect( events.get( m3, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( m3, "selected" ) ).to.have.been.calledWith( m3, { label: "picked" } );
                        expect( events.get( m1, "selected:picked" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:picked" ) ).not.to.have.been.called;
                    } );

                    it( 'no selected event with the label "selected" is triggered, on any model', function () {
                        expect( events.get( m1, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:selected" ) ).not.to.have.been.called;
                    } );

                    it( 'no select:one event with label "starred" is triggered on the collection', function () {
                        expect( events.get( collection, "select:one:starred" ) ).not.to.have.been.called;
                    } );

                    it( 'no select:one event with label "picked" is triggered on the collection', function () {
                        expect( events.get( collection, "select:one:picked" ) ).not.to.have.been.called;
                    } );

                    it( 'no other select:one events than these two are triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).not.to.have.been.called;
                    } );

                } );

                it( 'when they are batch-added as the initial models, with the silent option, no selection is made for any namespace', function () {
                    // The automatic selection can't be triggered when adding models silently.

                    collection = new Collection();
                    collection.add( models, { silent: true } );

                    expect( collection.starred ).to.be.undefined;
                    expect( collection.picked ).to.be.undefined;
                    expect( collection.selected ).to.be.undefined;

                    expect( getSelected( models, "starred" ) ).to.be.empty;
                    expect( getSelected( models, "picked" ) ).to.be.empty;
                    expect( getSelected( models ) ).to.be.empty;
                } );

                it( 'when they are are passed in on reset, with the silent option, no selection is made for any namespace', function () {
                    // See above. Also, resetting a collection silently is not allowed in model-sharing mode.

                    collection = new Collection();
                    collection.reset( models, { silent: true } );

                    expect( collection.starred ).to.be.undefined;
                    expect( collection.picked ).to.be.undefined;
                    expect( collection.selected ).to.be.undefined;

                    expect( getSelected( models, "starred" ) ).to.be.empty;
                    expect( getSelected( models, "picked" ) ).to.be.empty;
                    expect( getSelected( models ) ).to.be.empty;
                } );

            } );

            describe( 'one of the models - but not the first one - is already starred initially, likewise for "picked" (not the last one)', function () {

                beforeEach( function () {
                    m2.select( { label: "starred" } );
                    m2.select( { label: "picked" } );
                } );

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        events = getEventSpies( [m1, m3], ["selected", "starred", "picked"] );
                        collection = new Collection( models );
                    } );

                    it( 'the selection for the "starred" label remains unchanged', function () {
                        expect( collection.starred ).to.deep.equal( m2 );
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [m2] );
                    } );

                    it( 'the selection for the "picked" label remains unchanged', function () {
                        expect( collection.picked ).to.deep.equal( m2 );
                        expect( getSelected( models, "picked" ) ).to.deep.equal( [m2] );
                    } );

                    it( 'the selection for the "selected" label remains unchanged, ie undefined', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.be.empty;
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first (with the "starred" label), and
                        // then had the selection reversed. It should remain deselected the whole time.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first (with the "picked" label), and
                        // then had the selection reversed. It should remain deselected the whole time.
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    // A deselect:one event is not triggered on the collection, in any case. See above for the reasons
                    // (corresponding test with all models deselected).

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m1, m3, collection], ["selected", "starred", "picked"] );

                        collection.add( models );
                    } );

                    it( 'the selection for the "starred" label remains unchanged', function () {
                        expect( collection.starred ).to.deep.equal( m2 );
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [m2] );
                    } );

                    it( 'the selection for the "picked" label remains unchanged', function () {
                        expect( collection.picked ).to.deep.equal( m2 );
                        expect( getSelected( models, "picked" ) ).to.deep.equal( [m2] );
                    } );

                    it( 'the selection for the "selected" label remains unchanged, ie undefined', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.be.empty;
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first (with the "starred" label), and
                        // then had the selection reversed. It should remain deselected the whole time.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first (with the "picked" label), and
                        // then had the selection reversed. It should remain deselected the whole time.
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        events = getEventSpies( [m1, m3, collection], ["selected", "starred", "picked"] );

                        collection.reset( models );
                    } );

                    it( 'the selection for the "starred" label remains unchanged', function () {
                        expect( collection.starred ).to.deep.equal( m2 );
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [m2] );
                    } );

                    it( 'the selection for the "picked" label remains unchanged', function () {
                        expect( collection.picked ).to.deep.equal( m2 );
                        expect( getSelected( models, "picked" ) ).to.deep.equal( [m2] );
                    } );

                    it( 'the selection for the "selected" label remains unchanged, ie undefined', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.be.empty;
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first (with the "starred" label), and
                        // then had the selection reversed. It should remain deselected the whole time.
                        expect( events.get( m1, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first (with the "picked" label), and
                        // then had the selection reversed. It should remain deselected the whole time.
                        expect( events.get( m3, "deselected" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( events.get( collection, "deselect:one" ) ).not.to.have.been.called;
                    } );

                } );

            } );

            describe( 'the collection is already populated, without a model being starred or picked', function () {

                var newModels, allModels, mA, mB;

                beforeEach( function () {
                    mA = new Model();
                    mB = new Model();

                    newModels = [mA, mB];
                    allModels = models.concat( newModels );
                } );

                describe( 'when new models are batch-added to the end, and none of them is selected with any label', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();
                        collection.deselect( undefined,  { label: "starred" } );
                        collection.deselect( undefined,  { label: "picked" } );

                        events = getEventSpies( allModels.concat( collection ), ["selected", "starred", "picked"] );

                        collection.add( newModels );
                    } );

                    it( 'the first model is starred', function () {
                        expect( collection.starred ).to.deep.equal( m1 );
                        expect( getSelected( allModels, "starred" ) ).to.deep.equal( [m1] );
                    } );

                    it( 'the last model is picked', function () {
                        expect( collection.picked ).to.deep.equal( mB );
                        expect( getSelected( allModels, "picked" ) ).to.deep.equal( [mB] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( allModels ) ).to.deep.equal( [] );
                    } );

                    it( 'a selected event with label "starred" is triggered on the first model (and not on any other)', function () {
                        expect( events.get( m1, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( m1, "selected" ) ).to.have.been.calledWith( m1, { label: "starred" } );
                        expect( events.get( m2, "selected:starred" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:starred" ) ).not.to.have.been.called;
                        expect( events.get( mA, "selected:starred" ) ).not.to.have.been.called;
                        expect( events.get( mB, "selected:starred" ) ).not.to.have.been.called;
                    } );

                    it( 'a selected event with label "picked" is triggered on the last model (and not on any other)', function () {
                        expect( events.get( mB, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( mB, "selected" ) ).to.have.been.calledWith( mB, { label: "picked" } );
                        expect( events.get( m1, "selected:picked" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:picked" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:picked" ) ).not.to.have.been.called;
                        expect( events.get( mA, "selected:picked" ) ).not.to.have.been.called;
                    } );

                    it( 'no selected event is triggered, on any model', function () {
                        expect( events.get( m1, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "selected:selected" ) ).not.to.have.been.called;
                    } );

                    it( 'a select:one event with label "starred" is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m1, collection, { label: "starred" } );
                    } );

                    it( 'a select:one event with label "picked" is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( mB, collection, { label: "picked" } );
                    } );

                    it( 'no other select:one events than these two are triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledTwice;
                    } );

                    it( 'no deselected event is triggered on any model, for any namespace', function () {
                        // Meaning that the only selection taking place, for any given namespace, is that of the
                        // auto-selected model, without being preceded by a string of selections and deselections if
                        // other models are added before.
                        expect( events.get( m1, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected:*" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection, for any namespace', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one:*" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added to the end, and one of them is starred and picked', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();
                        collection.deselect( undefined,  { label: "starred" } );
                        collection.deselect( undefined,  { label: "picked" } );

                        mA.select( { label: "starred" } );
                        mA.select( { label: "picked" } );

                        events = getEventSpies( allModels.concat( collection ), ["selected", "starred", "picked"] );

                        collection.add( newModels );
                    } );

                    it( 'the selection for the "starred" label remains unchanged', function () {
                        expect( collection.starred ).to.deep.equal( mA );
                        expect( getSelected( allModels, "starred" ) ).to.deep.equal( [mA] );
                    } );

                    it( 'the selection for the "picked" label remains unchanged', function () {
                        expect( collection.picked ).to.deep.equal( mA );
                        expect( getSelected( allModels, "picked" ) ).to.deep.equal( [mA] );
                    } );

                    it( 'the selection for the "selected" label remains unchanged, ie undefined', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( allModels ) ).to.be.empty;
                    } );

                    it( 'no deselected event is triggered on any model, for any namespace', function () {
                        // Meaning that the only selection taking place, for any given namespace, is that of the
                        // auto-selected model, without being preceded by a string of selections and deselections if
                        // other models are added before.
                        expect( events.get( m1, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected:*" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection, for any namespace', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one:*" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added at the front, and none of them is selected with any label', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();
                        collection.deselect( undefined,  { label: "starred" } );
                        collection.deselect( undefined,  { label: "picked" } );

                        events = getEventSpies( allModels.concat( collection ), ["selected", "starred", "picked"] );

                        collection.add( newModels, { at: 0 } );
                    } );

                    it( 'the first model is starred', function () {
                        expect( collection.starred ).to.deep.equal( mA );
                        expect( getSelected( allModels, "starred" ) ).to.deep.equal( [mA] );
                    } );

                    it( 'the last model is picked', function () {
                        expect( collection.picked ).to.deep.equal( m3 );
                        expect( getSelected( allModels, "picked" ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( allModels ) ).to.deep.equal( [] );
                    } );

                    it( 'a selected event with label "starred" is triggered on the first model (and not on any other)', function () {
                        expect( events.get( mA, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( mA, "selected" ) ).to.have.been.calledWith( mA, { label: "starred" } );
                        expect( events.get( mB, "selected:starred" ) ).not.to.have.been.called;
                        expect( events.get( m1, "selected:starred" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:starred" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:starred" ) ).not.to.have.been.called;
                    } );

                    it( 'a selected event with label "picked" is triggered on the last model (and not on any other)', function () {
                        expect( events.get( m3, "selected" ) ).to.have.been.calledOnce;
                        expect( events.get( m3, "selected" ) ).to.have.been.calledWith( m3, { label: "picked" } );
                        expect( events.get( mA, "selected:picked" ) ).not.to.have.been.called;
                        expect( events.get( mB, "selected:picked" ) ).not.to.have.been.called;
                        expect( events.get( m1, "selected:picked" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:picked" ) ).not.to.have.been.called;
                    } );

                    it( 'no selected event is triggered, on any model', function () {
                        expect( events.get( m1, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( m2, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( m3, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( mA, "selected:selected" ) ).not.to.have.been.called;
                        expect( events.get( mB, "selected:selected" ) ).not.to.have.been.called;
                    } );

                    it( 'a select:one event with label "starred" is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( mA, collection, { label: "starred" } );
                    } );

                    it( 'a select:one event with label "picked" is triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledWith( m3, collection, { label: "picked" } );
                    } );

                    it( 'no other select:one events than these two are triggered on the collection', function () {
                        expect( events.get( collection, "select:one" ) ).to.have.been.calledTwice;
                    } );

                    it( 'no deselected event is triggered on any model, for any namespace', function () {
                        // Meaning that the only selection taking place, for any given namespace, is that of the
                        // auto-selected model, without being preceded by a string of selections and deselections if
                        // other models are added before.
                        expect( events.get( m1, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected:*" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection, for any namespace', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one:*" ) ).not.to.have.been.called;
                    } );

                } );

                describe( 'when new models are batch-added at the front, and one of them is starred and picked', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();
                        collection.deselect( undefined,  { label: "starred" } );
                        collection.deselect( undefined,  { label: "picked" } );

                        mB.select( { label: "starred" } );
                        mB.select( { label: "picked" } );

                        events = getEventSpies( allModels.concat( collection ), ["selected", "starred", "picked"] );

                        collection.add( newModels, { at: 0 } );
                    } );

                    it( 'the selection for the "starred" label remains unchanged', function () {
                        expect( collection.starred ).to.deep.equal( mB );
                        expect( getSelected( allModels, "starred" ) ).to.deep.equal( [mB] );
                    } );

                    it( 'the selection for the "picked" label remains unchanged', function () {
                        expect( collection.picked ).to.deep.equal( mB );
                        expect( getSelected( allModels, "picked" ) ).to.deep.equal( [mB] );
                    } );

                    it( 'the selection for the "selected" label remains unchanged, ie undefined', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( allModels ) ).to.be.empty;
                    } );

                    it( 'no deselected event is triggered on any model, for any namespace', function () {
                        // Meaning that the only selection taking place, for any given namespace, is that of the
                        // auto-selected model, without being preceded by a string of selections and deselections if
                        // other models are added before.
                        expect( events.get( m1, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( m2, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( m3, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( mA, "deselected:*" ) ).not.to.have.been.called;
                        expect( events.get( mB, "deselected:*" ) ).not.to.have.been.called;
                    } );

                    it( 'no deselect:one event is triggered on the collection, for any namespace', function () {
                        // See above.
                        expect( events.get( collection, "deselect:one:*" ) ).not.to.have.been.called;
                    } );

                } );

            } );

        } );

        describe( 'autoSelect with custom default label ("starred")', function () {

            describe( 'autoSelect is set to "first"', function () {

                beforeEach( function () {
                    Collection = bindOptions( { defaultLabel: "starred", autoSelect: "first" } );
                } );

                describe( 'When all models are deselected initially, and passed to the constructor', function () {

                    beforeEach( function () {
                        collection = new Collection( models );
                    } );

                    it( 'the first model is starred', function () {
                        expect( collection.starred ).to.deep.equal( m1 );
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [m1] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.deep.equal( [] );
                    } );

                } );

                describe( 'When all models are deselected initially, and batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                    } );

                    it( 'the first model is starred', function () {
                        expect( collection.starred ).to.deep.equal( m1 );
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [m1] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.deep.equal( [] );
                    } );

                } );

                describe( 'When all models are deselected initially, and passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.reset( models );
                    } );

                    it( 'the first model is starred', function () {
                        expect( collection.starred ).to.deep.equal( m1 );
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [m1] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.deep.equal( [] );
                    } );

                } );

            } );

            describe( 'autoSelect is set to a hash which only defines a auto select behaviour for the "picked" label', function () {

                beforeEach( function () {
                    Collection = bindOptions( { defaultLabel: "starred", autoSelect: { picked: "first" } } );
                } );

                describe( 'When all models are deselected initially, and passed to the constructor', function () {

                    beforeEach( function () {
                        collection = new Collection( models );
                    } );

                    it( 'the first model is picked', function () {
                        expect( collection.picked ).to.deep.equal( m1 );
                        expect( getSelected( models, "picked" ) ).to.deep.equal( [m1] );
                    } );

                    it( 'no model is starred', function () {
                        expect( collection.starred ).to.be.undefined;
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.deep.equal( [] );
                    } );

                } );

                describe( 'When all models are deselected initially, and batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                    } );

                    it( 'the first model is picked', function () {
                        expect( collection.picked ).to.deep.equal( m1 );
                        expect( getSelected( models, "picked" ) ).to.deep.equal( [m1] );
                    } );

                    it( 'no model is starred', function () {
                        expect( collection.starred ).to.be.undefined;
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.deep.equal( [] );
                    } );

                } );

                describe( 'When all models are deselected initially, and passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.reset( models );
                    } );

                    it( 'the first model is picked', function () {
                        expect( collection.picked ).to.deep.equal( m1 );
                        expect( getSelected( models, "picked" ) ).to.deep.equal( [m1] );
                    } );

                    it( 'no model is starred', function () {
                        expect( collection.starred ).to.be.undefined;
                        expect( getSelected( models, "starred" ) ).to.deep.equal( [] );
                    } );

                    it( 'no model is selected', function () {
                        expect( collection.selected ).to.be.undefined;
                        expect( getSelected( models ) ).to.deep.equal( [] );
                    } );

                } );

            } );

        } );

        describe( 'autoSelect in conjunction with an ignored label', function () {

            // We only test autoSelect with a hash here. When autoSelect is set to a string, it is applied to the
            // default label, and the default label can never be ignored.

            describe( 'When autoSelect is set to "none" for an ignored label', function () {

                beforeEach( function () {
                    Collection = bindOptions( { ignoreLabel: "starred", autoSelect: { starred: "none" } } );
                } );

                it( 'the collection is created without an error', function () {
                    expect( function () { new Collection( models ); } ).not.to.throw( Error );
                } );

                it( 'selecting a model with an ignored label works as usual', function () {
                    collection = new Collection( models );
                    m1.select( { label: "starred" } );

                    expect( m1.starred ).to.equal( true );
                    expect( collection.starred ).to.be.undefined;
                } );

                it( 'selecting a model with the default label works as usual', function () {
                    collection = new Collection( models );
                    m1.select();

                    expect( m1.selected ).to.equal( true );
                    expect( collection.selected ).to.deep.equal( m1 );
                } );

            } );

            describe( 'When autoSelect is set to a value other than "none" for an ignored label', function () {

                beforeEach( function () {
                    Collection = bindOptions( { ignoreLabel: "starred", autoSelect: { starred: "first" } } );
                } );

                it( 'an error is thrown when the collection is created', function () {
                    expect( function () { new Collection( models ); } ).to.throw( "Conflicting options: Can't define autoSelect behaviour for label \"starred\" because it is ignored in the collection." );
                } );

            } );

        } );

        describe( 'initialSelection is used instead of autoSelect', function () {

            // initialSelection is deprecated, but still supposed to work as an alias of autoSelect

            describe( 'initialSelection is set to "first"', function () {

                beforeEach( function () {
                    Collection = bindOptions( { initialSelection: "first" } );
                } );

                it( 'the first model is selected when models are passed to the constructor', function () {
                    collection = new Collection( models );

                    expect( collection.selected ).to.deep.equal( m1 );
                    expect( getSelected( models ) ).to.deep.equal( [m1] );
                } );

                it( 'the first model is selected when models are batch-added as the initial models', function () {
                    collection = new Collection();
                    collection.add( models );

                    expect( collection.selected ).to.deep.equal( m1 );
                    expect( getSelected( models ) ).to.deep.equal( [m1] );
                } );

                it( 'the first model is selected when models are passed in on reset', function () {
                    collection = new Collection();
                    collection.reset( models );

                    expect( collection.selected ).to.deep.equal( m1 );
                    expect( getSelected( models ) ).to.deep.equal( [m1] );
                } );

            } );
        } );

    } );

})();