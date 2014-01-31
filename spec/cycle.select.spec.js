/*global describe, it */
(function () {
    "use strict";

    describe( 'Select mixins: Backbone.Cycle.SelectableModel, Backbone.Cycle.SelectableCollection', function () {

        var Model, Collection, m1, m2, m3, collection;

        beforeEach( function () {
            Model = Backbone.Model.extend( {
                initialize: function () {
                    Backbone.Cycle.SelectableModel.applyTo( this );
                }
            } );

            Collection = Backbone.Collection.extend( {
                initialize: function ( models ) {
                    Backbone.Cycle.SelectableCollection.applyTo( this, models );
                }
            } );

            m1 = new Model();
            m2 = new Model();
            m3 = new Model();
            collection = new Collection( [m1, m2, m3] );
        } );

        describe( 'Calling next() on a collection', function () {

            it( 'returns the next model in the collection, based on the selected model, if that next model exists', function () {
                m1.select();
                expect( collection.next() ).to.deep.equal( m2 );
            } );

            it( 'returns the first model in the collection if there is no next model', function () {
                m3.select();
                expect( collection.next() ).to.deep.equal( m1 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.next() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling prev() on a collection', function () {

            it( 'returns the previous model in the collection, based on the selected model, if that previous model exists', function () {
                m3.select();
                expect( collection.prev() ).to.deep.equal( m2 );
            } );

            it( 'returns the last model in the collection if there is no previous model', function () {
                m1.select();
                expect( collection.prev() ).to.deep.equal( m3 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.prev() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling ahead() on a collection', function () {

            it( 'returns the n-th next model in the collection, based on the selected model, if that n-th next model exists', function () {
                m1.select();
                expect( collection.ahead(2) ).to.deep.equal( m3 );
            } );

            it( 'returns the looped n-th next model in the collection if the n-th next one does not exist', function () {
                m1.select();
                expect( collection.ahead(4) ).to.deep.equal( m2 );
            } );

            it( 'returns the looped n-th next model in the collection even when looping multiple times', function () {
                m1.select();
                expect( collection.ahead(7) ).to.deep.equal( m2 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.ahead(2) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling behind() on a collection', function () {

            it( 'returns the n-th previous model in the collection, based on the selected model, if that n-th previous model exists', function () {
                m3.select();
                expect( collection.behind(2) ).to.deep.equal( m1 );
            } );

            it( 'returns the looped n-th previous model in the collection if the n-th previous one does not exist', function () {
                m1.select();
                expect( collection.behind(2) ).to.deep.equal( m2 );
            } );

            it( 'returns the looped n-th previous model in the collection even when looping multiple times', function () {
                m1.select();
                expect( collection.behind(5) ).to.deep.equal( m2 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.behind(2) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling nextNoLoop() on a collection', function () {

            it( 'returns the next model in the collection, based on the selected model, if that next model exists', function () {
                m1.select();
                expect( collection.nextNoLoop() ).to.deep.equal( m2 );
            } );

            it( 'returns undefined if there is no next model', function () {
                m3.select();
                expect( collection.nextNoLoop() ).to.be.undefined;
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.nextNoLoop() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling prevNoLoop() on a collection', function () {

            it( 'returns the previous model in the collection, based on the selected model, if that previous model exists', function () {
                m3.select();
                expect( collection.prevNoLoop() ).to.deep.equal( m2 );
            } );

            it( 'returns undefined if there is no previous model', function () {
                m1.select();
                expect( collection.prevNoLoop() ).to.be.undefined;
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.prevNoLoop() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling aheadNoLoop() on a collection', function () {

            it( 'returns the n-th next model in the collection, based on the selected model, if that n-th next model exists', function () {
                m1.select();
                expect( collection.aheadNoLoop(2) ).to.deep.equal( m3 );
            } );

            it( 'returns undefined if the n-th next model does not exist', function () {
                m1.select();
                expect( collection.aheadNoLoop(4) ).to.be.undefined;
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.aheadNoLoop(2) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling behindNoLoop() on a collection', function () {

            it( 'returns the n-th previous model in the collection, based on the selected model, if that n-th previous model exists', function () {
                m3.select();
                expect( collection.behindNoLoop(2) ).to.deep.equal( m1 );
            } );

            it( 'returns undefined if the n-th previous model does not exist', function () {
                m1.select();
                expect( collection.behindNoLoop(2) ).to.be.undefined;
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.behindNoLoop(2) ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling selectNext() on a collection', function () {

            it( 'selects the next model in the collection if that next model exists', function () {
                m1.select();
                collection.selectNext();
                expect( collection.selected ).to.deep.equal( m2 );
            } );

            it( 'selects the first model in the collection if there is no next model', function () {
                m3.select();
                collection.selectNext();
                expect( collection.selected ).to.deep.equal( m1 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.selectNext() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling selectPrev() on a collection', function () {

            it( 'selects the previous model in the collection if that previous model exists', function () {
                m3.select();
                collection.selectPrev();
                expect( collection.selected ).to.deep.equal( m2 );
            } );

            it( 'selects the last model in the collection if there is no previous model', function () {
                m1.select();
                collection.selectPrev();
                expect( collection.selected ).to.deep.equal( m3 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.selectPrev() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling selectNextNoLoop() on a collection', function () {

            it( 'selects the next model in the collection if that next model exists', function () {
                m1.select();
                collection.selectNextNoLoop();
                expect( collection.selected ).to.deep.equal( m2 );
            } );

            it( 'keeps the current model selected if there is no next model', function () {
                m3.select();
                collection.selectNextNoLoop();
                expect( collection.selected ).to.deep.equal( m3 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.selectNextNoLoop() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling selectPrevNoLoop() on a collection', function () {

            it( 'selects the previous model in the collection if that previous model exists', function () {
                m3.select();
                collection.selectPrevNoLoop();
                expect( collection.selected ).to.deep.equal( m2 );
            } );

            it( 'keeps the current model selected if there is no previous model', function () {
                m1.select();
                collection.selectPrevNoLoop();
                expect( collection.selected ).to.deep.equal( m1 );
            } );

            it( 'throws an error if no model is selected', function () {
                expect( function () {  collection.prevNoLoop() ; } ).to.throw( Error );
            } );

        } );

        describe( 'Calling selectAt() on a collection', function () {

            it( 'selects the model if the index exists', function () {
                collection.selectAt(1);
                expect( collection.selected ).to.deep.equal( m2 );
            } );

            it( 'throws an error if the index is beyond the end of the collection', function () {
                expect( function () {  collection.selectAt(3) ; } ).to.throw( Error );
            } );

            it( 'throws an error if the index is negative', function () {
                expect( function () {  collection.selectAt(-1) ; } ).to.throw( Error );
            } );

        } );

    } );

})();