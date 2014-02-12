/*global describe, it */
(function () {
    "use strict";

    describe( 'Base mixin: Backbone.Cycle.Model', function () {

        var Model, m1, m2, m3, collection;

        beforeEach( function () {
            Model = Backbone.Model.extend( Backbone.Cycle.Model );

            m1 = new Model();
            m2 = new Model();
            m3 = new Model();
            collection = new Backbone.Collection( [m1, m2, m3] );
        } );

        describe( 'Calling next() on a model', function () {

            it( 'returns the next model in the collection if there is one', function () {
                expect( m1.next() ).to.deep.equal( m2 );
            } );

            it( 'returns the first model in the collection if there is no next model', function () {
                expect( m3.next() ).to.deep.equal( m1 );
            } );

        } );

        describe( 'Calling prev() on a model', function () {

            it( 'returns the previous model in the collection if there is one', function () {
                expect( m3.prev() ).to.deep.equal( m2 );
            } );

            it( 'returns the last model in the collection if there is no previous model', function () {
                expect( m1.prev() ).to.deep.equal( m3 );
            } );

        } );

        describe( 'Calling ahead() on a model', function () {

            it( 'returns the n-th next model in the collection if there is one', function () {
                expect( m1.ahead(2) ).to.deep.equal( m3 );
            } );

            it( 'returns the looped n-th next model in the collection if the n-th next one does not exist', function () {
                expect( m1.ahead(4) ).to.deep.equal( m2 );
            } );

            it( 'returns the looped n-th next model in the collection even when looping multiple times', function () {
                expect( m1.ahead(7) ).to.deep.equal( m2 );
            } );

        } );

        describe( 'Calling behind() on a model', function () {

            it( 'returns the n-th previous model in the collection if there is one', function () {
                expect( m3.behind(2) ).to.deep.equal( m1 );
            } );

            it( 'returns the looped n-th previous model in the collection if the n-th previous one does not exist', function () {
                expect( m1.behind(2) ).to.deep.equal( m2 );
            } );

            it( 'returns the looped n-th previous model in the collection even when looping multiple times', function () {
                expect( m1.behind(5) ).to.deep.equal( m2 );
            } );

        } );

        describe( 'Calling nextNoLoop() on a model', function () {

            it( 'returns the next model in the collection if there is one', function () {
                expect( m1.nextNoLoop() ).to.deep.equal( m2 );
            } );

            it( 'returns undefined if there is no next model', function () {
                expect( m3.nextNoLoop() ).to.be.undefined;
            } );

        } );

        describe( 'Calling prevNoLoop() on a model', function () {

            it( 'returns the previous model in the collection if there is one', function () {
                expect( m3.prevNoLoop() ).to.deep.equal( m2 );
            } );

            it( 'returns undefined if there is no previous model', function () {
                expect( m1.prevNoLoop() ).to.be.undefined;
            } );

        } );

        describe( 'Calling aheadNoLoop() on a model', function () {

            it( 'returns the n-th next model in the collection if there is one', function () {
                expect( m1.aheadNoLoop(2) ).to.deep.equal( m3 );
            } );

            it( 'returns undefined if the n-th next one does not exist', function () {
                expect( m1.aheadNoLoop(4) ).to.be.undefined;
            } );

        } );

        describe( 'Calling behindNoLoop() on a model', function () {

            it( 'returns the n-th previous model in the collection if there is one', function () {
                expect( m3.behindNoLoop(2) ).to.deep.equal( m1 );
            } );

            it( 'returns undefined if the n-th previous one does not exist', function () {
                expect( m1.behindNoLoop(2) ).to.be.undefined;
            } );

        } );

    } );

})();