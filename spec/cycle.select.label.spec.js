/*global describe, it */
(function () {
    "use strict";

    describe( 'Labels in Select mixins: Backbone.Cycle.SelectableModel, Backbone.Cycle.SelectableCollection', function () {

        var Model, Collection, m1, m2, m3, collection, collectionErrorMessage;

        beforeEach( function () {
            collectionErrorMessage = 'Illegal call of SelectableCollection navigation method. No model had been selected to begin with (using label "starred").';

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
        } );

        describe( 'Custom label option.', function () {

            beforeEach( function () {
                collection = new Collection( [m1, m2, m3] );
            } );

            describe( 'Calling next() on a collection, with a "starred" label,', function () {

                it( 'returns the next model in the collection, based on the starred model, if that next model exists', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.next( { label: "starred" } ) ).to.deep.equal( m2 );
                } );

                it( 'returns the first model in the collection if there is no next model', function () {
                    m3.select( { label: "starred" } );
                    expect( collection.next( { label: "starred" } ) ).to.deep.equal( m1 );
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.next( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling prev() on a collection, with a "starred" label,', function () {

                it( 'returns the previous model in the collection, based on the starred model, if that previous model exists', function () {
                    m3.select( { label: "starred" } );
                    expect( collection.prev( { label: "starred" } ) ).to.deep.equal( m2 );
                } );

                it( 'returns the last model in the collection if there is no previous model', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.prev( { label: "starred" } ) ).to.deep.equal( m3 );
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.prev( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling ahead() on a collection, with a "starred" label,', function () {

                it( 'returns the n-th next model in the collection, based on the starred model, if that n-th next model exists', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.ahead( 2, { label: "starred" } ) ).to.deep.equal( m3 );
                } );

                it( 'returns the looped n-th next model in the collection if the n-th next one does not exist', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.ahead( 4, { label: "starred" } ) ).to.deep.equal( m2 );
                } );

                it( 'returns the looped n-th next model in the collection even when looping multiple times', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.ahead( 7, { label: "starred" } ) ).to.deep.equal( m2 );
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.ahead( 2, { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling behind() on a collection, with a "starred" label,', function () {

                it( 'returns the n-th previous model in the collection, based on the starred model, if that n-th previous model exists', function () {
                    m3.select( { label: "starred" } );
                    expect( collection.behind( 2, { label: "starred" } ) ).to.deep.equal( m1 );
                } );

                it( 'returns the looped n-th previous model in the collection if the n-th previous one does not exist', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.behind( 2, { label: "starred" } ) ).to.deep.equal( m2 );
                } );

                it( 'returns the looped n-th previous model in the collection even when looping multiple times', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.behind( 5, { label: "starred" } ) ).to.deep.equal( m2 );
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.behind( 2, { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling nextNoLoop() on a collection, with a "starred" label,', function () {

                it( 'returns the next model in the collection, based on the starred model, if that next model exists', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.nextNoLoop( { label: "starred" } ) ).to.deep.equal( m2 );
                } );

                it( 'returns undefined if there is no next model', function () {
                    m3.select( { label: "starred" } );
                    expect( collection.nextNoLoop( { label: "starred" } ) ).to.be.undefined;
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.nextNoLoop( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling prevNoLoop() on a collection, with a "starred" label,', function () {

                it( 'returns the previous model in the collection, based on the starred model, if that previous model exists', function () {
                    m3.select( { label: "starred" } );
                    expect( collection.prevNoLoop( { label: "starred" } ) ).to.deep.equal( m2 );
                } );

                it( 'returns undefined if there is no previous model', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.prevNoLoop( { label: "starred" } ) ).to.be.undefined;
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.prevNoLoop( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling aheadNoLoop() on a collection, with a "starred" label,', function () {

                it( 'returns the n-th next model in the collection, based on the starred model, if that n-th next model exists', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.aheadNoLoop( 2, { label: "starred" } ) ).to.deep.equal( m3 );
                } );

                it( 'returns undefined if the n-th next model does not exist', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.aheadNoLoop( 4, { label: "starred" } ) ).to.be.undefined;
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.aheadNoLoop( 2, { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling behindNoLoop() on a collection, with a "starred" label,', function () {

                it( 'returns the n-th previous model in the collection, based on the starred model, if that n-th previous model exists', function () {
                    m3.select( { label: "starred" } );
                    expect( collection.behindNoLoop( 2, { label: "starred" } ) ).to.deep.equal( m1 );
                } );

                it( 'returns undefined if the n-th previous model does not exist', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.behindNoLoop( 2, { label: "starred" } ) ).to.be.undefined;
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.behindNoLoop( 2, { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling selectNext() on a collection, with a "starred" label,', function () {

                it( 'stars the next model in the collection if that next model exists', function () {
                    m1.select( { label: "starred" } );
                    collection.selectNext( { label: "starred" } );
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

                it( 'stars the first model in the collection if there is no next model', function () {
                    m3.select( { label: "starred" } );
                    collection.selectNext( { label: "starred" } );
                    expect( collection.starred ).to.deep.equal( m1 );
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.selectNext( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

                it( 'does not change the selected model', function () {
                    m1.select( { label: "starred" } );
                    m3.select();
                    collection.selectNext( { label: "starred" } );
                    expect( collection.selected ).to.deep.equal( m3 );
                } );

                it( 'does not select a model if none had been selected', function () {
                    m1.select( { label: "starred" } );
                    collection.selectNext( { label: "starred" } );
                    expect( collection.selected ).to.be.undefined;
                } );

            } );

            describe( 'Calling selectPrev() on a collection, with a "starred" label,', function () {

                it( 'stars the previous model in the collection if that previous model exists', function () {
                    m3.select( { label: "starred" } );
                    collection.selectPrev( { label: "starred" } );
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

                it( 'stars the last model in the collection if there is no previous model', function () {
                    m1.select( { label: "starred" } );
                    collection.selectPrev( { label: "starred" } );
                    expect( collection.starred ).to.deep.equal( m3 );
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.selectPrev( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

                it( 'does not change the selected model', function () {
                    m3.select( { label: "starred" } );
                    m1.select();
                    collection.selectPrev( { label: "starred" } );
                    expect( collection.selected ).to.deep.equal( m1 );
                } );

                it( 'does not select a model if none had been selected', function () {
                    m3.select( { label: "starred" } );
                    collection.selectPrev( { label: "starred" } );
                    expect( collection.selected ).to.be.undefined;
                } );

            } );

            describe( 'Calling selectNextNoLoop() on a collection, with a "starred" label,', function () {

                it( 'stars the next model in the collection if that next model exists', function () {
                    m1.select( { label: "starred" } );
                    collection.selectNextNoLoop( { label: "starred" } );
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

                it( 'keeps the current model selected if there is no next model', function () {
                    m3.select( { label: "starred" } );
                    collection.selectNextNoLoop( { label: "starred" } );
                    expect( collection.starred ).to.deep.equal( m3 );
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.selectNextNoLoop( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

                it( 'does not change the selected model', function () {
                    m1.select( { label: "starred" } );
                    m3.select();
                    collection.selectNextNoLoop( { label: "starred" } );
                    expect( collection.selected ).to.deep.equal( m3 );
                } );

                it( 'does not select a model if none had been selected', function () {
                    m1.select( { label: "starred" } );
                    collection.selectNextNoLoop( { label: "starred" } );
                    expect( collection.selected ).to.be.undefined;
                } );

            } );

            describe( 'Calling selectPrevNoLoop() on a collection, with a "starred" label,', function () {

                it( 'stars the previous model in the collection if that previous model exists', function () {
                    m3.select( { label: "starred" } );
                    collection.selectPrevNoLoop( { label: "starred" } );
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

                it( 'keeps the current model selected if there is no previous model', function () {
                    m1.select( { label: "starred" } );
                    collection.selectPrevNoLoop( { label: "starred" } );
                    expect( collection.starred ).to.deep.equal( m1 );
                } );

                it( 'throws an error if no model is starred', function () {
                    expect( function () { collection.prevNoLoop( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

                it( 'does not change the selected model', function () {
                    m3.select( { label: "starred" } );
                    m1.select();
                    collection.selectPrevNoLoop( { label: "starred" } );
                    expect( collection.selected ).to.deep.equal( m1 );
                } );

                it( 'does not select a model if none had been selected', function () {
                    m3.select( { label: "starred" } );
                    collection.selectPrevNoLoop( { label: "starred" } );
                    expect( collection.selected ).to.be.undefined;
                } );

            } );

            describe( 'Calling selectAt() on a collection, with a "starred" label,', function () {

                it( 'stars the model if the index exists', function () {
                    collection.selectAt( 1, { label: "starred" } );
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

                it( 'throws an error if the index is beyond the end of the collection', function () {
                    expect( function () { collection.selectAt( 3, { label: "starred" } ) ; } ).to.throw( "Model with index 3 doesn't exist in the collection and can't be selected." );
                } );

                it( 'throws an error if the index is negative', function () {
                    expect( function () { collection.selectAt( -1, { label: "starred" } ) ; } ).to.throw( "Model with index -1 doesn't exist in the collection and can't be selected." );
                } );

            } );

        } );

        describe( 'Custom default label', function () {

            beforeEach( function () {
                collection = new Collection( [m1, m2, m3], { defaultLabel: "starred" } );
            } );

            describe( 'Calling next() on a collection which uses "starred" as the default label', function () {

                it( 'returns the next model in the collection, based on the starred model, if that next model exists', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.next() ).to.deep.equal( m2 );
                } );

            } );

            describe( 'Calling prev() on a collection which uses "starred" as the default label', function () {

                it( 'returns the previous model in the collection, based on the starred model, if that previous model exists', function () {
                    m3.select( { label: "starred" } );
                    expect( collection.prev() ).to.deep.equal( m2 );
                } );

            } );

            describe( 'Calling ahead() on a collection which uses "starred" as the default label', function () {

                it( 'returns the n-th next model in the collection, based on the starred model, if that n-th next model exists', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.ahead( 2 ) ).to.deep.equal( m3 );
                } );

            } );

            describe( 'Calling behind() on a collection which uses "starred" as the default label', function () {

                it( 'returns the n-th previous model in the collection, based on the starred model, if that n-th previous model exists', function () {
                    m3.select( { label: "starred" } );
                    expect( collection.behind( 2 ) ).to.deep.equal( m1 );
                } );

            } );

            describe( 'Calling nextNoLoop() on a collection which uses "starred" as the default label', function () {

                it( 'returns the next model in the collection, based on the starred model, if that next model exists', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.nextNoLoop() ).to.deep.equal( m2 );
                } );

            } );

            describe( 'Calling prevNoLoop() on a collection which uses "starred" as the default label', function () {

                it( 'returns the previous model in the collection, based on the starred model, if that previous model exists', function () {
                    m3.select( { label: "starred" } );
                    expect( collection.prevNoLoop() ).to.deep.equal( m2 );
                } );

            } );

            describe( 'Calling aheadNoLoop() on a collection which uses "starred" as the default label', function () {

                it( 'returns the n-th next model in the collection, based on the starred model, if that n-th next model exists', function () {
                    m1.select( { label: "starred" } );
                    expect( collection.aheadNoLoop( 2 ) ).to.deep.equal( m3 );
                } );

            } );

            describe( 'Calling behindNoLoop() on a collection which uses "starred" as the default label', function () {

                it( 'returns the n-th previous model in the collection, based on the starred model, if that n-th previous model exists', function () {
                    m3.select( { label: "starred" } );
                    expect( collection.behindNoLoop( 2 ) ).to.deep.equal( m1 );
                } );

            } );

            describe( 'Calling selectNext() on a collection which uses "starred" as the default label', function () {

                it( 'stars the next model in the collection if that next model exists', function () {
                    m1.select( { label: "starred" } );
                    collection.selectNext();
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

            } );

            describe( 'Calling selectPrev() on a collection which uses "starred" as the default label', function () {

                it( 'stars the previous model in the collection if that previous model exists', function () {
                    m3.select( { label: "starred" } );
                    collection.selectPrev();
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

            } );

            describe( 'Calling selectNextNoLoop() on a collection which uses "starred" as the default label', function () {

                it( 'stars the next model in the collection if that next model exists', function () {
                    m1.select( { label: "starred" } );
                    collection.selectNextNoLoop();
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

            } );

            describe( 'Calling selectPrevNoLoop() on a collection which uses "starred" as the default label', function () {

                it( 'stars the previous model in the collection if that previous model exists', function () {
                    m3.select( { label: "starred" } );
                    collection.selectPrevNoLoop();
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

            } );

            describe( 'Calling selectAt() on a collection which uses "starred" as the default label', function () {

                it( 'stars the model if the index exists', function () {
                    collection.selectAt( 1 );
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

            } );

        } );

        describe( 'Ignored label', function () {

            beforeEach( function () {
                collection = new Collection( [m1, m2, m3], { ignoreLabel: "starred" } );

                // Making sure that the model is selected with the label, even though the collection itself ignores it.
                m1.select( { label: "starred" } );
            } );

            describe( 'Calling next() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.next( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling prev() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.prev( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling ahead() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.ahead( 2, { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling behind() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.behind( 2, { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling nextNoLoop() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.nextNoLoop( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling prevNoLoop() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.prevNoLoop( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling aheadNoLoop() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.aheadNoLoop( 2, { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling behindNoLoop() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.behindNoLoop( 2, { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling selectNext() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.selectNext( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling selectPrev() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.selectPrev( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling selectNextNoLoop() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.selectNextNoLoop( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

            describe( 'Calling selectPrevNoLoop() on a collection, with a label that is ignored,', function () {

                it( 'throws an error (because in the collection, no model is selected with that label)', function () {
                    expect( function () { collection.prevNoLoop( { label: "starred" } ) ; } ).to.throw( collectionErrorMessage );
                } );

            } );

        } );

    } );

})();