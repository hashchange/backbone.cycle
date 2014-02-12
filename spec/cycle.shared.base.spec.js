/*global describe, it */
(function () {
    "use strict";

    describe( 'Base mixin with model sharing: Backbone.Cycle.Model', function () {

        var Model, m1, m2, m3, mA, mB, mC, c1, c2, cA;

        beforeEach( function () {
            Model = Backbone.Model.extend( Backbone.Cycle.Model );

            m1 = new Model();
            m2 = new Model();
            m3 = new Model();
            mA = new Model();
            mB = new Model();
            mC = new Model();

            c1 = new Backbone.Collection( [m1, m2, m3] );
            cA = new Backbone.Collection( [mA, mB, mC] );
            c2 = new Backbone.Collection( [mA, m1, mB, m2, mC, m3] );
        } );

        describe( 'Calling next() on a model without a collection context', function () {

            it( 'returns the next model in the primary collection if there is a next model', function () {
                expect( m1.next() ).to.deep.equal( m2 );
            } );

            it( 'returns the first model in the primary collection if there is no next model', function () {
                expect( m3.next() ).to.deep.equal( m1 );
            } );

        } );

        describe( 'Calling next() on a model with a collection context', function () {

            it( 'returns the next model in the collection if there is a next model', function () {
                expect( m1.next( c2 ) ).to.deep.equal( mB );
            } );

            it( 'returns the first model in the collection if there is no next model', function () {
                expect( m3.next( c2 ) ).to.deep.equal( mA );
            } );

            it( 'throws an error if the model is not part of that collection', function () {
                expect( function () {  m1.next( cA ) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling prev() on a model without a collection context', function () {

            it( 'returns the previous model in the collection if there is a previous model', function () {
                expect( m3.prev() ).to.deep.equal( m2 );
            } );

            it( 'returns the last model in the collection if there is no previous model', function () {
                expect( m1.prev() ).to.deep.equal( m3 );
            } );

        } );

        describe( 'Calling prev() on a model with a collection context', function () {

            it( 'returns the prev model in the collection if there is one', function () {
                expect( m1.prev( c2 ) ).to.deep.equal( mA );
            } );

            it( 'returns the last model in the collection if there is no previous model', function () {
                expect( mA.prev( c2 ) ).to.deep.equal( m3 );
            } );

            it( 'throws an error if the model is not part of that collection', function () {
                expect( function () {  m1.next( cA ) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling ahead() on a model without a collection context', function () {

            it( 'returns the n-th next model in the primary collection if that model exists', function () {
                expect( m1.ahead(2) ).to.deep.equal( m3 );
            } );

            it( 'returns the looped n-th next model in the primary collection if the n-th next one does not exist', function () {
                expect( m1.ahead(4) ).to.deep.equal( m2 );
            } );

        } );

        describe( 'Calling ahead() on a model with a collection context', function () {

            it( 'returns the n-th next model in the collection if that model exists', function () {
                expect( m1.ahead(3, c2) ).to.deep.equal( mC );
            } );

            it( 'returns the looped n-th next model in the collection if the n-th next one does not exist', function () {
                expect( m1.ahead(7, c2) ).to.deep.equal( mB );
            } );

            it( 'throws an error if the model is not part of that collection', function () {
                expect( function () {  m1.ahead( 1, cA ) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling behind() on a model without a collection context', function () {

            it( 'returns the n-th previous model in the primary collection if there is one', function () {
                expect( m3.behind(2) ).to.deep.equal( m1 );
            } );

            it( 'returns the looped n-th previous model in the primary collection if the n-th previous one does not exist', function () {
                expect( m1.behind(2) ).to.deep.equal( m2 );
            } );

        } );

        describe( 'Calling behind() on a model with a collection context', function () {

            it( 'returns the n-th previous model in the collection if there is one', function () {
                expect( m2.behind(3, c2) ).to.deep.equal( mA );
            } );

            it( 'returns the looped n-th previous model in the collection if the n-th previous one does not exist', function () {
                expect( m1.behind(3, c2) ).to.deep.equal( mC );
            } );

            it( 'throws an error if the model is not part of that collection', function () {
                expect( function () {  m2.behind( 1, cA ) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling nextNoLoop() on a model without a collection context', function () {

            it( 'returns the next model in the primary collection if there is one', function () {
                expect( m1.nextNoLoop() ).to.deep.equal( m2 );
            } );

            it( 'returns undefined if there is no next model in the primary collection', function () {
                expect( m3.nextNoLoop() ).to.be.undefined;
            } );

        } );

        describe( 'Calling nextNoLoop() on a model with a collection context', function () {

            it( 'returns the next model in the collection if there is one', function () {
                expect( m1.nextNoLoop( c2 ) ).to.deep.equal( mB );
            } );

            it( 'returns undefined if there is no next model', function () {
                expect( m3.nextNoLoop( c2 ) ).to.be.undefined;
            } );

            it( 'throws an error if the model is not part of that collection', function () {
                expect( function () {  m1.nextNoLoop( cA ) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling prevNoLoop() on a model without a collection context', function () {

            it( 'returns the previous model in the primary collection if there is one', function () {
                expect( m3.prevNoLoop() ).to.deep.equal( m2 );
            } );

            it( 'returns undefined if there is no previous model in the primary collection', function () {
                expect( m1.prevNoLoop() ).to.be.undefined;
            } );

        } );

        describe( 'Calling prevNoLoop() on a model with a collection context', function () {

            it( 'returns the previous model in the collection if there is one', function () {
                expect( m3.prevNoLoop( c2 ) ).to.deep.equal( mC );
            } );

            it( 'returns undefined if there is no previous model', function () {
                expect( mA.prevNoLoop( c2 ) ).to.be.undefined;
            } );

            it( 'throws an error if the model is not part of that collection', function () {
                expect( function () {  m1.prevNoLoop( cA ) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling aheadNoLoop() on a model without a collection context', function () {

            it( 'returns the n-th next model in the primary collection if that model exists', function () {
                expect( m1.aheadNoLoop(2) ).to.deep.equal( m3 );
            } );

            it( 'returns undefined if the n-th next one does not exist', function () {
                expect( m1.aheadNoLoop(4) ).to.be.undefined;
            } );

        } );

        describe( 'Calling aheadNoLoop() on a model with a collection context', function () {

            it( 'returns the n-th next model in the collection if that model exists', function () {
                expect( m1.aheadNoLoop(3, c2) ).to.deep.equal( mC );
            } );

            it( 'returns undefined if the n-th next one does not exist', function () {
                expect( m1.aheadNoLoop(7, c2) ).to.be.undefined;
            } );

            it( 'throws an error if the model is not part of that collection', function () {
                expect( function () {  m1.aheadNoLoop( 1, cA ) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling behindNoLoop() on a model without a collection context', function () {

            it( 'returns the n-th previous model in the primary collection if there is one', function () {
                expect( m3.behindNoLoop(2) ).to.deep.equal( m1 );
            } );

            it( 'returns undefined if the n-th previous one does not exist', function () {
                expect( m1.behindNoLoop(2) ).to.be.undefined;
            } );

        } );

        describe( 'Calling behindNoLoop() on a model with a collection context', function () {

            it( 'returns the n-th previous model in the collection if there is one', function () {
                expect( m2.behindNoLoop(3, c2) ).to.deep.equal( mA );
            } );

            it( 'returns undefined if the n-th previous one does not exist', function () {
                expect( m1.behindNoLoop(3, c2) ).to.be.undefined;
            } );

            it( 'throws an error if the model is not part of that collection', function () {
                expect( function () {  m2.behindNoLoop( 1, cA ) ; } ).to.throw( Error );
            } );

        } );

    } );

})();