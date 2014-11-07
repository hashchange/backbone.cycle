/*global describe, it */
(function () {
    "use strict";

    describe( 'Options for SelectableCollection: autoSelect', function () {

        var Model, m1, m2, m3, models, Collection, collection;

        function bindOptions ( options ) {
            return Collection.extend( {
                initialize: function ( models ) {
                    Backbone.Cycle.SelectableCollection.applyTo( this, models, options );
                }
            } );
        }

        function getSelected ( modelArray ) {
            return _.filter( modelArray, function ( model ) { return model.selected; } );
        }

        beforeEach( function () {
            Model = Backbone.Model.extend( {
                initialize: function () {
                    Backbone.Cycle.SelectableModel.applyTo( this );
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

            it( 'has its autoSelect property set to "none"', function () {
                collection = new Collection( models );
                expect( collection.autoSelect ).to.equal( "none" );
            } );

        } );

        describe( 'Invalid option values', function () {

            it( 'the collection throws an error when an invalid option value is passed', function () {
                expect( function () { new Collection( models, { autoSelect: "foo" } ); } ).to.throw( Error );
            } );

            it( 'the collection ignores the option when explicitly set to undefined, and uses the default value "none"', function () {
                collection = new Collection( models, { autoSelect: undefined } );
                expect( collection.autoSelect ).to.equal( "none" );
            } );

        } );

        describe( 'Implicit switch to model-sharing mode', function () {

            it( 'the collection stays in standard mode when the autoSelect option is not passed in', function () {
                collection = new Collection( models );
                expect( collection._modelSharingEnabled ).not.to.be.true;
            } );

            it( 'the collection stays in standard mode when the autoSelect option set to "none"', function () {
                collection = new Collection( models, { autoSelect: "none" } );
                expect( collection._modelSharingEnabled ).not.to.be.true;
            } );

            it( 'the collection is switched over to model-sharing mode when the autoSelect option set to "first"', function () {
                collection = new Collection( models, { autoSelect: "first" } );
                expect( collection._modelSharingEnabled ).to.be.true;
            } );

            it( 'the collection is switched over to model-sharing mode when the autoSelect option set to "last"', function () {
                collection = new Collection( models, { autoSelect: "last" } );
                expect( collection._modelSharingEnabled ).to.be.true;
            } );

            it( 'the collection is switched over to model-sharing mode when the autoSelect option set to a number', function () {
                collection = new Collection( models, { autoSelect: 100 } );
                expect( collection._modelSharingEnabled ).to.be.true;
            } );

            it( 'the collection is switched over to model-sharing mode when the autoSelect option set to a number, passed in as a string', function () {
                collection = new Collection( models, { autoSelect: "100" } );
                expect( collection._modelSharingEnabled ).to.be.true;
            } );

        } );

        describe( 'autoSelect is set to "none"', function () {

            describe( 'all models are deselected initially', function () {

                beforeEach( function () {
                    Collection = bindOptions( { autoSelect: "none" } );
                } );

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

            describe( 'when model sharing is enabled, and one of the models is already selected initially', function () {

                // A model being selected before it is even part of a collection: that is a scenario which only ought to
                // happen with model sharing.

                // There are no tests here for adding and resetting with the silent option. As stated in the
                // Backbone.Select documentation, the silent option can't be used for these actions when model sharing
                // is enabled.

                beforeEach( function () {
                    Collection = bindOptions( { autoSelect: "none", enableModelSharing: true } );
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

                it( 'when they are passed in on reset, the selection remains unchanged', function () {
                    collection = new Collection();
                    collection.reset( models );

                    expect( collection.selected ).to.deep.equal( m2 );
                    expect( getSelected( models ) ).to.deep.equal( [m2] );
                } );

            } );

        } );

        describe( 'autoSelect is set to "first"', function () {

            describe( 'all models are deselected initially', function () {

                beforeEach( function () {
                    Collection = bindOptions( { autoSelect: "first", enableModelSharing: true } );
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
                        expect( m1.trigger ).to.have.been.calledWith( "selected" );
                    } );

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        sinon.spy( m1, "trigger" );
                        sinon.spy( m2, "trigger" );
                        sinon.spy( m3, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.add( models );
                    } );
                    it( 'the first model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m1 );
                        expect( getSelected( models ) ).to.deep.equal( [m1] );
                    } );

                    it( 'a selected event is triggered on the first model', function () {
                        expect( m1.trigger ).to.have.been.calledWith( "selected" );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( collection.trigger ).to.have.been.calledWith( "select:one", m1 );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the first model, without being
                        // preceded by a string of selections and deselections if other models are added before.
                        expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        sinon.spy( m1, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.reset( models );
                    } );

                    it( 'the first model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m1 );
                        expect( getSelected( models ) ).to.deep.equal( [m1] );
                    } );

                    it( 'a selected event is triggered on the first model', function () {
                        expect( m1.trigger ).to.have.been.calledWith( "selected" );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( collection.trigger ).to.have.been.calledWith( "select:one", m1 );
                    } );

                } );

                it( 'when they are batch-added as the initial models, with the silent option, no selection is made', function () {
                    // The automatic selection can't be triggered when adding models silently.

                    collection = new Collection();
                    collection.add( models, { silent: true } );

                    expect( collection.selected ).to.be.undefined;
                    expect( getSelected( models ) ).to.be.empty;
                } );

                it( 'when they are are passed in on reset, with the silent option, no selection is made', function () {
                    // See above. Also, resetting a collection silently is not allowed in model-sharing mode.

                    collection = new Collection();
                    collection.reset( models, { silent: true } );

                    expect( collection.selected ).to.be.undefined;
                    expect( getSelected( models ) ).to.be.empty;
                } );

            } );

            describe( 'one of the models - but not the first one - is already selected initially', function () {

                // A model being selected before it is even part of a collection: that is a scenario which only ought to
                // happen with model sharing.

                // There are no tests here for adding and resetting with the silent option. As stated in the
                // Backbone.Select documentation, the silent option can't be used for these actions when model sharing
                // is enabled.

                beforeEach( function () {
                    Collection = bindOptions( { autoSelect: "first", enableModelSharing: true } );
                    m2.select();
                } );

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        sinon.spy( m1, "trigger" );
                        collection = new Collection( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( m1.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    // A deselect:one event is not triggered on the collection, in any case. See above for the reasons
                    // (corresponding test with all models deselected).

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        sinon.spy( m1, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.add( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( m1.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        sinon.spy( m1, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.reset( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( m1.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                    } );

                } );

            } );

            describe( 'the collection is already populated, without a selection', function () {

                var newModels, allModels, mA, mB;

                beforeEach( function () {
                    Collection = bindOptions( { autoSelect: "first", enableModelSharing: true } );

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

                        sinon.spy( m1, "trigger" );
                        sinon.spy( m2, "trigger" );
                        sinon.spy( m3, "trigger" );
                        sinon.spy( mA, "trigger" );
                        sinon.spy( mB, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.add( newModels );
                    } );

                    it( 'the first model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m1 );
                        expect( getSelected( allModels ) ).to.deep.equal( [m1] );
                    } );

                    it( 'a selected event is triggered on the first model', function () {
                        expect( m1.trigger ).to.have.been.calledWith( "selected" );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( collection.trigger ).to.have.been.calledWith( "select:one", m1 );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the first model, without being
                        // preceded by a string of selections and deselections on other models beforehand.
                        expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( mA.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( mB.trigger ).not.to.have.been.calledWith( "deselected" );
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                    } );

                } );

                describe( 'when new models are batch-added to the end, and one of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        mA.select();

                        sinon.spy( m1, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.add( newModels );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( mA );
                        expect( getSelected( allModels ) ).to.deep.equal( [mA] );
                    } );

                    it( 'no deselected event is triggered on the first model', function () {
                        // ... meaning that the first model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( m1.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                    } );

                } );

                describe( 'when new models are batch-added at the front, and none of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        sinon.spy( m1, "trigger" );
                        sinon.spy( m2, "trigger" );
                        sinon.spy( m3, "trigger" );
                        sinon.spy( mA, "trigger" );
                        sinon.spy( mB, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.add( newModels, { at: 0 } );
                    } );

                    it( 'the first model is selected', function () {
                        expect( collection.selected ).to.deep.equal( mA );
                        expect( getSelected( allModels ) ).to.deep.equal( [mA] );
                    } );

                    it( 'a selected event is triggered on the first model', function () {
                        expect( mA.trigger ).to.have.been.calledWith( "selected" );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( collection.trigger ).to.have.been.calledWith( "select:one", mA );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the first model, without being
                        // preceded by a string of selections and deselections on other models beforehand.
                        expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( mA.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( mB.trigger ).not.to.have.been.calledWith( "deselected" );
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                    } );

                } );

                describe( 'when new models are batch-added at the front, and one of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        mB.select();

                        sinon.spy( m1, "trigger" );
                        sinon.spy( mA, "trigger" );
                        sinon.spy( collection, "trigger" );

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
                        expect( m1.trigger ).not.to.have.been.calledWith("deselected");
                        expect( mA.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                    } );

                } );

            } );

        } );

        describe( 'autoSelect is set to "last"', function () {

            describe( 'all models are deselected initially', function () {

                beforeEach( function () {
                    Collection = bindOptions( { autoSelect: "last", enableModelSharing: true } );
                } );

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        sinon.spy( m3, "trigger" );
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
                        expect( m3.trigger ).to.have.been.calledWith( "selected" );
                    } );

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        sinon.spy( m1, "trigger" );
                        sinon.spy( m2, "trigger" );
                        sinon.spy( m3, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.add( models );
                    } );
                    it( 'the last model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'a selected event is triggered on the last model', function () {
                        expect( m3.trigger ).to.have.been.calledWith( "selected" );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( collection.trigger ).to.have.been.calledWith( "select:one", m3 );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the last model, without being
                        // preceded by a string of selections and deselections while models are added successively.
                        expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        sinon.spy( m3, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.reset( models );
                    } );

                    it( 'the last model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'a selected event is triggered on the last model', function () {
                        expect( m3.trigger ).to.have.been.calledWith( "selected" );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( collection.trigger ).to.have.been.calledWith( "select:one", m3 );
                    } );

                } );

                it( 'when they are batch-added as the initial models, with the silent option, no selection is made', function () {
                    // The automatic selection can't be triggered when adding models silently.

                    collection = new Collection();
                    collection.add( models, { silent: true } );

                    expect( collection.selected ).to.be.undefined;
                    expect( getSelected( models ) ).to.be.empty;
                } );

                it( 'when they are are passed in on reset, with the silent option, no selection is made', function () {
                    // See above. Also, resetting a collection silently is not allowed in model-sharing mode.

                    collection = new Collection();
                    collection.reset( models, { silent: true } );

                    expect( collection.selected ).to.be.undefined;
                    expect( getSelected( models ) ).to.be.empty;
                } );

            } );

            describe( 'one of the models - but not the last one - is already selected initially', function () {

                // A model being selected before it is even part of a collection: that is a scenario which only ought to
                // happen with model sharing.

                // There are no tests here for adding and resetting with the silent option. As stated in the
                // Backbone.Select documentation, the silent option can't be used for these actions when model sharing
                // is enabled.

                beforeEach( function () {
                    Collection = bindOptions( { autoSelect: "last", enableModelSharing: true } );
                    m2.select();
                } );

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        sinon.spy( m3, "trigger" );
                        collection = new Collection( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( m3.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    // A deselect:one event is not triggered on the collection, in any case. See above for the reasons
                    // (corresponding test with all models deselected).

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        sinon.spy( m3, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.add( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        sinon.spy( m3, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.reset( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m2 );
                        expect( getSelected( models ) ).to.deep.equal( [m2] );
                    } );

                    it( 'no deselected event is triggered on the last model', function () {
                        // ... meaning that the last model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( m3.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                    } );

                } );

            } );

            describe( 'the collection is already populated, without a selection', function () {

                var newModels, allModels, mA, mB;

                beforeEach( function () {
                    Collection = bindOptions( { autoSelect: "last", enableModelSharing: true } );

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

                        sinon.spy( m1, "trigger" );
                        sinon.spy( m2, "trigger" );
                        sinon.spy( m3, "trigger" );
                        sinon.spy( mA, "trigger" );
                        sinon.spy( mB, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.add( newModels );
                    } );

                    it( 'the last model is selected', function () {
                        expect( collection.selected ).to.deep.equal( mB );
                        expect( getSelected( allModels ) ).to.deep.equal( [mB] );
                    } );

                    it( 'a selected event is triggered on the last model', function () {
                        expect( mB.trigger ).to.have.been.calledWith( "selected" );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( collection.trigger ).to.have.been.calledWith( "select:one", mB );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the last model, without being
                        // preceded by a string of selections and deselections on other models beforehand.
                        expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( mA.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( mB.trigger ).not.to.have.been.calledWith( "deselected" );
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                    } );

                } );

                describe( 'when new models are batch-added to the end, and one of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        mA.select();

                        sinon.spy( m3, "trigger" );
                        sinon.spy( mB, "trigger" );
                        sinon.spy( collection, "trigger" );

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
                        expect( m3.trigger ).not.to.have.been.calledWith("deselected");
                        expect( mB.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                    } );

                } );

                describe( 'when new models are batch-added at the front, and none of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        sinon.spy( m1, "trigger" );
                        sinon.spy( m2, "trigger" );
                        sinon.spy( m3, "trigger" );
                        sinon.spy( mA, "trigger" );
                        sinon.spy( mB, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.add( newModels, { at: 0 } );
                    } );

                    it( 'the last model is selected', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( allModels ) ).to.deep.equal( [m3] );
                    } );

                    it( 'a selected event is triggered on the last model', function () {
                        expect( m3.trigger ).to.have.been.calledWith( "selected" );
                    } );

                    it( 'a select:one event is triggered on the collection', function () {
                        expect( collection.trigger ).to.have.been.calledWith( "select:one", m3 );
                    } );

                    it( 'no deselected event is triggered on any model', function () {
                        // Meaning that the only selection taking place is that of the last model, without being
                        // preceded by a string of selections and deselections on other models beforehand.
                        expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( mA.trigger ).not.to.have.been.calledWith( "deselected" );
                        expect( mB.trigger ).not.to.have.been.calledWith( "deselected" );
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                    } );

                } );

                describe( 'when new models are batch-added at the front, and one of them is selected', function () {

                    beforeEach( function () {
                        collection = new Collection();
                        collection.add( models );
                        collection.deselect();

                        mA.select();

                        sinon.spy( m3, "trigger" );
                        sinon.spy( mB, "trigger" );
                        sinon.spy( collection, "trigger" );

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
                        expect( m3.trigger ).not.to.have.been.calledWith("deselected");
                        expect( mB.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                    } );

                } );

            } );

        } );

        describe( 'autoSelect is set to an index number', function () {

            describe( 'all models are deselected initially', function () {

                describe( 'the autoSelect index matches a model', function () {

                    beforeEach( function () {
                        Collection = bindOptions( { autoSelect: 1, enableModelSharing: true } );
                    } );

                    describe( 'when models are passed to the constructor', function () {

                        beforeEach( function () {
                            sinon.spy( m2, "trigger" );
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
                            expect( m2.trigger ).to.have.been.calledWith( "selected" );
                        } );

                    } );

                    describe( 'when models are batch-added as the initial models', function () {

                        beforeEach( function () {
                            collection = new Collection();

                            sinon.spy( m1, "trigger" );
                            sinon.spy( m2, "trigger" );
                            sinon.spy( m3, "trigger" );
                            sinon.spy( collection, "trigger" );

                            collection.add( models );
                        } );
                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( m2 );
                            expect( getSelected( models ) ).to.deep.equal( [m2] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( m2.trigger ).to.have.been.calledWith( "selected" );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( collection.trigger ).to.have.been.calledWith( "select:one", m2 );
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            // Meaning that the only selection taking place is that of the matching model, without being
                            // preceded by a string of selections and deselections while models are added successively.
                            expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                        } );

                    } );

                    describe( 'when models are passed in on reset', function () {

                        beforeEach( function () {
                            collection = new Collection();

                            sinon.spy( m2, "trigger" );
                            sinon.spy( collection, "trigger" );

                            collection.reset( models );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( m2 );
                            expect( getSelected( models ) ).to.deep.equal( [m2] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( m2.trigger ).to.have.been.calledWith( "selected" );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( collection.trigger ).to.have.been.calledWith( "select:one", m2 );
                        } );

                    } );

                } );

                describe( 'the index number does not match a model', function () {

                    beforeEach( function () {
                        Collection = bindOptions( { autoSelect: 100, enableModelSharing: true } );
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

                it( 'when they are batch-added as the initial models, with the silent option, no selection is made', function () {
                    // The automatic selection can't be triggered when adding models silently.

                    collection = new Collection();
                    collection.add( models, { silent: true } );

                    expect( collection.selected ).to.be.undefined;
                    expect( getSelected( models ) ).to.be.empty;
                } );

                it( 'when they are are passed in on reset, with the silent option, no selection is made', function () {
                    // See above. Also, resetting a collection silently is not allowed in model-sharing mode.

                    collection = new Collection();
                    collection.reset( models, { silent: true } );

                    expect( collection.selected ).to.be.undefined;
                    expect( getSelected( models ) ).to.be.empty;
                } );

                
            } );

            describe( 'one of the models - but not the last one - is already selected initially', function () {

                // A model being selected before it is even part of a collection: that is a scenario which only ought to
                // happen with model sharing.

                // There are no tests here for adding and resetting with the silent option. As stated in the
                // Backbone.Select documentation, the silent option can't be used for these actions when model sharing
                // is enabled.

                beforeEach( function () {
                    Collection = bindOptions( { autoSelect: 1, enableModelSharing: true } );
                    m3.select();
                } );

                describe( 'when they are passed to the constructor', function () {

                    beforeEach( function () {
                        sinon.spy( m2, "trigger" );
                        collection = new Collection( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no deselected event is triggered on the model matching the index', function () {
                        // ... meaning that the matching model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( m2.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    // A deselect:one event is not triggered on the collection, in any case. See above for the reasons
                    // (corresponding test with all models deselected).

                } );

                describe( 'when they are batch-added as the initial models', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        sinon.spy( m2, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.add( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no deselected event is triggered on the model matching the index', function () {
                        // ... meaning that the matching model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                    } );

                } );

                describe( 'when they are passed in on reset', function () {

                    beforeEach( function () {
                        collection = new Collection();

                        sinon.spy( m2, "trigger" );
                        sinon.spy( collection, "trigger" );

                        collection.reset( models );
                    } );

                    it( 'the selection remains unchanged', function () {
                        expect( collection.selected ).to.deep.equal( m3 );
                        expect( getSelected( models ) ).to.deep.equal( [m3] );
                    } );

                    it( 'no deselected event is triggered on the model matching the index', function () {
                        // ... meaning that the matching model hadn't been selected first, and then had the selection
                        // reversed. It should remain deselected the whole time.
                        expect( m2.trigger ).not.to.have.been.calledWith("deselected");
                    } );

                    it( 'no deselect:one event is triggered on the collection', function () {
                        expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
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
                        Collection = bindOptions( { autoSelect: 1, enableModelSharing: true } );
                    } );

                    describe( 'when new models are batch-added to the end, and none of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            sinon.spy( m1, "trigger" );
                            sinon.spy( m2, "trigger" );
                            sinon.spy( m3, "trigger" );
                            sinon.spy( mA, "trigger" );
                            sinon.spy( mB, "trigger" );
                            sinon.spy( collection, "trigger" );

                            collection.add( newModels );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( m2 );
                            expect( getSelected( allModels ) ).to.deep.equal( [m2] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( m2.trigger ).to.have.been.calledWith( "selected" );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( collection.trigger ).to.have.been.calledWith( "select:one", m2 );
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            // Meaning that the only selection taking place is that of the matching model, without being
                            // preceded by a string of selections and deselections on other models beforehand.
                            expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( mA.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( mB.trigger ).not.to.have.been.calledWith( "deselected" );
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                        } );

                    } );

                    describe( 'when new models are batch-added to the end, and one of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            mA.select();

                            sinon.spy( m2, "trigger" );
                            sinon.spy( mB, "trigger" );
                            sinon.spy( collection, "trigger" );

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
                            expect( m2.trigger ).not.to.have.been.calledWith("deselected");
                            expect( mB.trigger ).not.to.have.been.calledWith("deselected");
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                        } );

                    } );

                    describe( 'when new models are batch-added at the front, and none of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            sinon.spy( m1, "trigger" );
                            sinon.spy( m2, "trigger" );
                            sinon.spy( m3, "trigger" );
                            sinon.spy( mA, "trigger" );
                            sinon.spy( mB, "trigger" );
                            sinon.spy( collection, "trigger" );

                            collection.add( newModels, { at: 0 } );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( mB );
                            expect( getSelected( allModels ) ).to.deep.equal( [mB] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( mB.trigger ).to.have.been.calledWith( "selected" );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( collection.trigger ).to.have.been.calledWith( "select:one", mB );
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            // Meaning that the only selection taking place is that of the matching model, without being
                            // preceded by a string of selections and deselections on other models beforehand.
                            expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( mA.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( mB.trigger ).not.to.have.been.calledWith( "deselected" );
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                        } );

                    } );

                    describe( 'when new models are batch-added at the front, and one of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            mA.select();

                            sinon.spy( m2, "trigger" );
                            sinon.spy( mB, "trigger" );
                            sinon.spy( collection, "trigger" );

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
                            expect( m2.trigger ).not.to.have.been.calledWith("deselected");
                            expect( mB.trigger ).not.to.have.been.calledWith("deselected");
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                        } );

                    } );

                } );

                describe( 'the autoSelect index is outside of the original collection range, but within the range after adding more models', function () {

                    beforeEach( function () {
                        Collection = bindOptions( { autoSelect: 3, enableModelSharing: true } );
                    } );

                    describe( 'when new models are batch-added to the end, and none of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            sinon.spy( m1, "trigger" );
                            sinon.spy( m2, "trigger" );
                            sinon.spy( m3, "trigger" );
                            sinon.spy( mA, "trigger" );
                            sinon.spy( mB, "trigger" );
                            sinon.spy( collection, "trigger" );

                            collection.add( newModels );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( mA );
                            expect( getSelected( allModels ) ).to.deep.equal( [mA] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( mA.trigger ).to.have.been.calledWith( "selected" );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( collection.trigger ).to.have.been.calledWith( "select:one", mA );
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            // Meaning that the only selection taking place is that of the last model, without being
                            // preceded by a string of selections and deselections on other models beforehand.
                            expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( mA.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( mB.trigger ).not.to.have.been.calledWith( "deselected" );
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                        } );

                    } );

                    describe( 'when new models are batch-added to the end, and one of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            mB.select();

                            sinon.spy( mA, "trigger" );
                            sinon.spy( collection, "trigger" );

                            collection.add( newModels );
                        } );

                        it( 'the selection remains unchanged', function () {
                            expect( collection.selected ).to.deep.equal( mB );
                            expect( getSelected( allModels ) ).to.deep.equal( [mB] );
                        } );

                        it( 'no deselected event is triggered on the model matching the index', function () {
                            // ... meaning that the matching model hadn't been selected first, and then had the selection
                            // reversed. It should remain deselected the whole time.
                            expect( mA.trigger ).not.to.have.been.calledWith("deselected");
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                        } );

                    } );

                    describe( 'when new models are batch-added at the front, and none of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            sinon.spy( m1, "trigger" );
                            sinon.spy( m2, "trigger" );
                            sinon.spy( m3, "trigger" );
                            sinon.spy( mA, "trigger" );
                            sinon.spy( mB, "trigger" );
                            sinon.spy( collection, "trigger" );

                            collection.add( newModels, { at: 0 } );
                        } );

                        it( 'the model matching the index is selected', function () {
                            expect( collection.selected ).to.deep.equal( m2 );
                            expect( getSelected( allModels ) ).to.deep.equal( [m2] );
                        } );

                        it( 'a selected event is triggered on the matching model', function () {
                            expect( m2.trigger ).to.have.been.calledWith( "selected" );
                        } );

                        it( 'a select:one event is triggered on the collection', function () {
                            expect( collection.trigger ).to.have.been.calledWith( "select:one", m2 );
                        } );

                        it( 'no deselected event is triggered on any model', function () {
                            // Meaning that the only selection taking place is that of the matching model, without being
                            // preceded by a string of selections and deselections on other models beforehand.
                            expect( m1.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( m2.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( m3.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( mA.trigger ).not.to.have.been.calledWith( "deselected" );
                            expect( mB.trigger ).not.to.have.been.calledWith( "deselected" );
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( collection.trigger ).not.to.have.been.calledWith( "deselect:one" );
                        } );

                    } );

                    describe( 'when new models are batch-added at the front, and one of them is selected', function () {

                        beforeEach( function () {
                            collection = new Collection();
                            collection.add( models );
                            collection.deselect();

                            mB.select();

                            sinon.spy( mA, "trigger" );
                            sinon.spy( collection, "trigger" );

                            collection.add( newModels, { at: 0 } );
                        } );

                        it( 'the selection remains unchanged', function () {
                            expect( collection.selected ).to.deep.equal( mB );
                            expect( getSelected( allModels ) ).to.deep.equal( [mB] );
                        } );

                        it( 'no deselected event is triggered on the model matching the index', function () {
                            // ... meaning that the matching model hadn't been selected first, and then had the selection
                            // reversed. It should remain deselected the whole time.
                            expect( mA.trigger ).not.to.have.been.calledWith("deselected");
                        } );

                        it( 'no deselect:one event is triggered on the collection', function () {
                            // See above.
                            expect( collection.trigger ).not.to.have.been.calledWith("deselect:one");
                        } );

                    } );

                } );

            } );

            describe( 'the autoSelect index is a number passed in as a string', function () {

                describe( 'the index matches a model', function () {

                    beforeEach( function () {
                        Collection = bindOptions( { autoSelect: "1", enableModelSharing: true } );
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

        describe( 'initialSelection is used instead of autoSelect', function () {

            // initialSelection is deprecated, but still supposed to work as an alias of autoSelect

            describe( 'initialSelection is set to "first"', function () {

                beforeEach( function () {
                    Collection = bindOptions( { initialSelection: "first", enableModelSharing: true } );
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