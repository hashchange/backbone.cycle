/*global describe, it */
(function () {
    "use strict";

    describe( 'Select mixins with model sharing: Backbone.Cycle.SelectableModel, Backbone.Cycle.SelectableCollection', function () {

        var Model, Collection, m1, m2, m3, mA, mB, mC, c1, c2, cA;

        beforeEach( function () {
            Model = Backbone.Model.extend( {
                initialize: function () {
                    Backbone.Cycle.SelectableModel.applyTo( this );
                }
            } );

            Collection = Backbone.Collection.extend( {
                initialize: function ( models ) {
                    Backbone.Cycle.SelectableCollection.applyTo( this, models, { enableModelSharing: true } );
                }
            } );

            m1 = new Model();
            m2 = new Model();
            m3 = new Model();
            mA = new Model();
            mB = new Model();
            mC = new Model();

            c1 = new Collection( [m1, m2, m3] );
            cA = new Collection( [mA, mB, mC] );
            c2 = new Collection( [mA, m1, mB, m2, mC, m3] );
        } );

        describe( 'Calling next() on a collection which isn\'t the primary collection', function () {

            it( 'returns the next model in the collection, based on the selected model, if that next model exists', function () {
                m1.select();
                expect( c2.next() ).to.deep.equal( mB );
            } );

            it( 'returns the first model in the collection if there is no next model', function () {
                m3.select();
                expect( c2.next() ).to.deep.equal( mA );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.next() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling prev() on a collection which isn\'t the primary collection', function () {

            it( 'returns the previous model in the collection, based on the selected model, if that previous model exists', function () {
                m3.select();
                expect( c2.prev() ).to.deep.equal( mC );
            } );

            it( 'returns the last model in the collection if there is no previous model', function () {
                mA.select();
                expect( c2.prev() ).to.deep.equal( m3 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.prev() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling ahead() on a collection which isn\'t the primary collection', function () {

            it( 'returns the n-th next model in the collection, based on the selected model, if that n-th next model exists', function () {
                m1.select();
                expect( c2.ahead(3) ).to.deep.equal( mC );
            } );

            it( 'returns the looped n-th next model in the collection if the n-th next one does not exist', function () {
                m1.select();
                expect( c2.ahead(7) ).to.deep.equal( mB );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.ahead(2) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling behind() on a collection which isn\'t the primary collection', function () {

            it( 'returns the n-th previous model in the collection, based on the selected model, if that n-th previous model exists', function () {
                m2.select();
                expect( c2.behind(3) ).to.deep.equal( mA );
            } );

            it( 'returns the looped n-th previous model in the collection if the n-th previous one does not exist', function () {
                m1.select();
                expect( c2.behind(3) ).to.deep.equal( mC );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.behind(2) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling nextNoLoop() on a collection which isn\'t the primary collection', function () {

            it( 'returns the next model in the collection, based on the selected model, if that next model exists', function () {
                m1.select();
                expect( c2.nextNoLoop() ).to.deep.equal( mB );
            } );

            it( 'returns undefined if there is no next model', function () {
                m3.select();
                expect( c2.nextNoLoop() ).to.be.undefined;
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.nextNoLoop() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling prevNoLoop() on a collection which isn\'t the primary collection', function () {

            it( 'returns the previous model in the collection, based on the selected model, if that previous model exists', function () {
                m3.select();
                expect( c2.prevNoLoop() ).to.deep.equal( mC );
            } );

            it( 'returns undefined if there is no previous model', function () {
                mA.select();
                expect( c2.prevNoLoop() ).to.be.undefined;
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.prevNoLoop() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling aheadNoLoop() on a collection which isn\'t the primary collection', function () {

            it( 'returns the n-th next model in the collection, based on the selected model, if that n-th next model exists', function () {
                m1.select();
                expect( c2.aheadNoLoop(3) ).to.deep.equal( mC );
            } );

            it( 'returns undefined if the n-th next model does not exist', function () {
                m1.select();
                expect( c2.aheadNoLoop(7) ).to.be.undefined;
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.aheadNoLoop(2) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling behindNoLoop() on a collection which isn\'t the primary collection', function () {

            it( 'returns the n-th previous model in the collection, based on the selected model, if that n-th previous model exists', function () {
                m2.select();
                expect( c2.behindNoLoop(3) ).to.deep.equal( mA );
            } );

            it( 'returns undefined if the n-th previous model does not exist', function () {
                m1.select();
                expect( c2.behindNoLoop(3) ).to.be.undefined;
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.behindNoLoop(2) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling selectNext() on a collection which isn\'t the primary collection', function () {

            it( 'selects the next model in the collection if that next model exists', function () {
                m1.select();
                c2.selectNext();
                expect( c2.selected ).to.deep.equal( mB );
            } );

            it( 'selects the first model in the collection if there is no next model', function () {
                m3.select();
                c2.selectNext();
                expect( c2.selected ).to.deep.equal( mA );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.selectNext() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling selectPrev() on a collection which isn\'t the primary collection', function () {

            it( 'selects the previous model in the collection if that previous model exists', function () {
                m3.select();
                c2.selectPrev();
                expect( c2.selected ).to.deep.equal( mC );
            } );

            it( 'selects the last model in the collection if there is no previous model', function () {
                mA.select();
                c2.selectPrev();
                expect( c2.selected ).to.deep.equal( m3 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.selectPrev() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling selectNextNoLoop() on a collection which isn\'t the primary collection', function () {

            it( 'selects the next model in the collection if that next model exists', function () {
                m1.select();
                c2.selectNextNoLoop();
                expect( c2.selected ).to.deep.equal( mB );
            } );

            it( 'keeps the current model selected if there is no next model', function () {
                m3.select();
                c2.selectNextNoLoop();
                expect( c2.selected ).to.deep.equal( m3 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.selectNextNoLoop() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling selectPrevNoLoop() on a collection which isn\'t the primary collection', function () {

            it( 'selects the previous model in the collection if that previous model exists', function () {
                m3.select();
                c2.selectPrevNoLoop();
                expect( c2.selected ).to.deep.equal( mC );
            } );

            it( 'keeps the current model selected if there is no previous model', function () {
                mA.select();
                c2.selectPrevNoLoop();
                expect( c2.selected ).to.deep.equal( mA );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  c2.prevNoLoop() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling selectAt() on a collection which isn\'t the primary collection', function () {

            it( 'selects the model if the index exists', function () {
                c2.selectAt(1);
                expect( c2.selected ).to.deep.equal( m1 );
            } );

            it( 'throws an error if the index is beyond the end of the collection', function () {
                expect( function () {  c2.selectAt(6) ; } ).to.throw( Error );
            } );

            it( 'throws an error if the index is negative', function () {
                expect( function () {  c2.selectAt(-1) ; } ).to.throw( Error );
            } );

        } );

    } );

})();