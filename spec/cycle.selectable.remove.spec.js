/*global describe, it */
(function () {
    "use strict";

    describe( 'Options for SelectableCollection: selectIfRemoved', function () {

        var Model, m1, m2, m3, models, Collection, collection;

        function bindOptions ( options ) {
            return Collection.extend( {
                initialize: function ( models ) {
                    Backbone.Cycle.SelectableCollection.applyTo( this, models, options );
                }
            } );
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

            it( 'has its selectIfRemoved property set to "none"', function () {
                collection = new Collection( models );
                expect( collection.selectIfRemoved ).to.equal( "none" );
            } );

        } );

        describe( 'Invalid option values', function () {

            it( 'the collection throws an error when an invalid option value is passed', function () {
                expect(function () { new Collection( models, { selectIfRemoved: "foo" } ); } ).to.throw( Error );
            } );

            it( 'the collection ignores the option when explicitly set to undefined, and uses the default value "none"', function () {
                collection = new Collection( models, { selectIfRemoved: undefined } );
                expect( collection.selectIfRemoved ).to.equal( "none" );
            } );

        } );

        describe( 'Implicit switch to model-sharing mode', function () {

            it( 'the collection stays in standard mode when the selectIfRemoved option is not passed in', function () {
                collection = new Collection( models );
                expect( collection._modelSharingEnabled ).not.to.be.true;
            } );

            it( 'the collection stays in standard mode when the selectIfRemoved option set to "none"', function () {
                collection = new Collection( models, { selectIfRemoved: "none" } );
                expect( collection._modelSharingEnabled ).not.to.be.true;
            } );

            it( 'the collection is switched over to model-sharing mode when the selectIfRemoved option set to "prev"', function () {
                collection = new Collection( models, { selectIfRemoved: "prev" } );
                expect( collection._modelSharingEnabled ).to.be.true;
            } );

            it( 'the collection is switched over to model-sharing mode when the selectIfRemoved option set to "next"', function () {
                collection = new Collection( models, { selectIfRemoved: "next" } );
                expect( collection._modelSharingEnabled ).to.be.true;
            } );

            it( 'the collection is switched over to model-sharing mode when the selectIfRemoved option set to "prevNoLoop"', function () {
                collection = new Collection( models, { selectIfRemoved: "prevNoLoop" } );
                expect( collection._modelSharingEnabled ).to.be.true;
            } );

            it( 'the collection is switched over to model-sharing mode when the selectIfRemoved option set to "nextNoLoop"', function () {
                collection = new Collection( models, { selectIfRemoved: "nextNoLoop" } );
                expect( collection._modelSharingEnabled ).to.be.true;
            } );

        } );

        describe( 'selectIfRemoved is set to "none"', function () {

            beforeEach( function () {
                Collection = bindOptions( { selectIfRemoved: "none" } );
                collection = new Collection( models );
            } );

            describe( 'the removed model has not been selected', function () {

                beforeEach( function () {
                    collection.select( m3 );
                    collection.remove( m2 );
                } );

                it( 'the removed model remains deselected', function () {
                    expect( m2.selected ).to.not.be.true;
                } );

                it( 'the selected model in the collection remains unchanged', function () {
                    expect( collection.selected ).to.deep.equal( m3 );
                } );

            } );

            describe( 'the removed model has been selected (model-sharing mode is off)', function () {

                beforeEach( function () {
                    collection.select( m2 );
                    collection.remove( m2 );
                } );

                // With model-sharing mode off, and nothing listening to remove events (selectIfRemoved is "none"),
                // the removal won't be detected. The onus is on the calling code to handle it correctly.

                // NB No need to test this with model-sharing mode enabled. That case is handled by Backbone.Select
                // anyway, and tested there.

                it( 'the removed model is NOT deselected', function () {
                    expect( m2.selected ).to.be.true;
                } );

                it( 'the selection in the collection is still referencing the removed model (!)', function () {
                    expect( collection.selected ).to.deep.equal( m2 );
                } );

            } );

        } );

        describe( 'selectIfRemoved is set to "prev"', function () {

            beforeEach( function () {
                Collection = bindOptions( { selectIfRemoved: "prev" } );
                collection = new Collection( models );
            } );

            it( 'when an unselected model is removed, the selection in the collection remains unchanged', function () {
                collection.select( m3 );
                collection.remove( m2 );
                expect( collection.selected ).to.deep.equal( m3 );
            } );

            it( 'when the first model of the collection is selected and removed, the last model gets selected', function () {
                collection.select( m1 );
                collection.remove( m1 );
                expect( collection.selected ).to.deep.equal( m3 );
            } );

            it( 'when the middle model of the collection is selected and removed, the first model gets selected', function () {
                collection.select( m2 );
                collection.remove( m2 );
                expect( collection.selected ).to.deep.equal( m1 );
            } );

            it( 'when the last model of the collection is selected and removed, the middle model gets selected', function () {
                collection.select( m3 );
                collection.remove( m3 );
                expect( collection.selected ).to.deep.equal( m2 );
            } );

        } );

        describe( 'selectIfRemoved is set to "prevNoLoop"', function () {

            beforeEach( function () {
                Collection = bindOptions( { selectIfRemoved: "prevNoLoop" } );
                collection = new Collection( models );
            } );

            it( 'when an unselected model is removed, the selection in the collection remains unchanged', function () {
                collection.select( m3 );
                collection.remove( m2 );
                expect( collection.selected ).to.deep.equal( m3 );
            } );

            it( 'when the first model of the collection is selected and removed, the middle model (new first model) gets selected', function () {
                collection.select( m1 );
                collection.remove( m1 );
                expect( collection.selected ).to.deep.equal( m2 );
            } );

            it( 'when the middle model of the collection is selected and removed, the first model gets selected', function () {
                collection.select( m2 );
                collection.remove( m2 );
                expect( collection.selected ).to.deep.equal( m1 );
            } );

            it( 'when the last model of the collection is selected and removed, the middle model gets selected', function () {
                collection.select( m3 );
                collection.remove( m3 );
                expect( collection.selected ).to.deep.equal( m2 );
            } );

        } );

        describe( 'selectIfRemoved is set to "next"', function () {

            beforeEach( function () {
                Collection = bindOptions( { selectIfRemoved: "next" } );
                collection = new Collection( models );
            } );

            it( 'when an unselected model is removed, the selection in the collection remains unchanged', function () {
                collection.select( m3 );
                collection.remove( m2 );
                expect( collection.selected ).to.deep.equal( m3 );
            } );

            it( 'when the first model of the collection is selected and removed, the middle model gets selected', function () {
                collection.select( m1 );
                collection.remove( m1 );
                expect( collection.selected ).to.deep.equal( m2 );
            } );

            it( 'when the middle model of the collection is selected and removed, the last model gets selected', function () {
                collection.select( m2 );
                collection.remove( m2 );
                expect( collection.selected ).to.deep.equal( m3 );
            } );

            it( 'when the last model of the collection is selected and removed, the first model gets selected', function () {
                collection.select( m3 );
                collection.remove( m3 );
                expect( collection.selected ).to.deep.equal( m1 );
            } );

        } );

        describe( 'selectIfRemoved is set to "nextNoLoop"', function () {

            beforeEach( function () {
                Collection = bindOptions( { selectIfRemoved: "nextNoLoop" } );
                collection = new Collection( models );
            } );

            it( 'when an unselected model is removed, the selection in the collection remains unchanged', function () {
                collection.select( m3 );
                collection.remove( m2 );
                expect( collection.selected ).to.deep.equal( m3 );
            } );

            it( 'when the first model of the collection is selected and removed, the middle model gets selected', function () {
                collection.select( m1 );
                collection.remove( m1 );
                expect( collection.selected ).to.deep.equal( m2 );
            } );

            it( 'when the middle model of the collection is selected and removed, the last model gets selected', function () {
                collection.select( m2 );
                collection.remove( m2 );
                expect( collection.selected ).to.deep.equal( m3 );
            } );

            it( 'when the last model of the collection is selected and removed, the middle model (new last model) gets selected', function () {
                collection.select( m3 );
                collection.remove( m3 );
                expect( collection.selected ).to.deep.equal( m2 );
            } );

        } );

    } );

})();