/*global describe, it */
(function () {
    "use strict";

    describe( 'Options for SelectableCollection: initialSelection', function () {

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

            it( 'has its initialSelection property set to "none"', function () {
                collection = new Collection( models );
                expect( collection.initialSelection ).to.equal( "none" );
            } );

        } );

        describe( 'Invalid option values', function () {

            it( 'the collection throws an error when an invalid option value is passed', function () {
                expect( function () { new Collection( models, { initialSelection: "foo" } ); } ).to.throw( Error );
            } );

            it( 'the collection ignores the option when explicitly set to undefined, and uses the default value "none"', function () {
                collection = new Collection( models, { initialSelection: undefined } );
                expect( collection.initialSelection ).to.equal( "none" );
            } );

        } );

        describe( 'Implicit switch to model-sharing mode', function () {

            it( 'the collection stays in standard mode when the initialSelection option is not passed in', function () {
                collection = new Collection( models );
                expect( collection._modelSharingEnabled ).not.to.be.true;
            } );

            it( 'the collection stays in standard mode when the initialSelection option set to "none"', function () {
                collection = new Collection( models, { initialSelection: "none" } );
                expect( collection._modelSharingEnabled ).not.to.be.true;
            } );

            it( 'the collection is switched over to model-sharing mode when the initialSelection option set to "first"', function () {
                collection = new Collection( models, { initialSelection: "first" } );
                expect( collection._modelSharingEnabled ).to.be.true;
            } );

        } );

        describe( 'initialSelection is set to "none"', function () {

            describe( 'all models are deselected initially', function () {

                beforeEach( function () {
                    Collection = bindOptions( { initialSelection: "none" } );
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
                    Collection = bindOptions( { initialSelection: "none", enableModelSharing: true } );
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

        describe( 'initialSelection is set to "first"', function () {

            describe( 'all models are deselected initially', function () {

                beforeEach( function () {
                    Collection = bindOptions( { initialSelection: "first", enableModelSharing: true } );
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
                    // The initial selection can't be triggered when adding models silently.

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
                    Collection = bindOptions( { initialSelection: "first", enableModelSharing: true } );
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

                    it( 'a deselected event is triggered on the first model', function () {
                        // Passing an array of models to `add` is just a shorthand for a sequence of individual `add`
                        // calls. As a result, m1 is made the initial selection when it is handled, and later on
                        // deselected again aa another selected model comes along.
                        expect( m1.trigger ).to.have.been.calledWith("deselected");
                    } );

                    it( 'a deselect:one event is triggered on the collection', function () {
                        // See above.
                        expect( collection.trigger ).to.have.been.calledWith("deselect:one");
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

        } );

    } );

})();