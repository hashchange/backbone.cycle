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

            it( 'has its selectIfRemoved option set to "none"', function () {
                // Internally, "none" is represented by the absence of an entry in _cycleOpts.selectIfRemoved
                collection = new Collection( models );
                expect( collection._cycleOpts.selectIfRemoved ).to.deep.equal( {} );
            } );

        } );

        describe( 'Invalid option values', function () {

            it( 'the collection throws an error when an invalid option value is passed', function () {
                expect( function () { new Collection( models, { selectIfRemoved: "foo" } ); } ).to.throw( 'selectIfRemoved option: Invalid value "foo"' );
            } );

            it( 'the collection throws an error when an invalid option value is passed as part of a hash', function () {
                expect( function () { new Collection( models, { selectIfRemoved: { starred: "foo" } } ); } ).to.throw( 'selectIfRemoved option: Invalid value "foo" inside hash' );
            } );

            it( 'the collection ignores the option when explicitly set to undefined, and uses the default value "none"', function () {
                // Internally, "none" is represented by the absence of an entry in _cycleOpts.selectIfRemoved
                collection = new Collection( models, { selectIfRemoved: undefined } );
                expect( collection._cycleOpts.selectIfRemoved ).to.deep.equal( {} );
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

            describe( 'the removed model has been selected', function () {

                beforeEach( function () {
                    collection.select( m2 );
                    collection.remove( m2 );
                } );

                // NB The test is only here for consistency, there is no real need to test it here. The case is handled
                // by Backbone.Select anyway, and tested there.

                it( 'the removed model is deselected', function () {
                    expect( m2.selected ).to.be.false;
                } );

                it( 'the selection in the collection is no longer referencing the removed model', function () {
                    expect( collection.selected ).not.to.deep.equal( m2 );
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

        describe( 'selectIfRemoved is set to a hash (label "starred" set to "next", label "picked" set to "prev"', function () {
            var m4;

            beforeEach( function () {
                m4 = new Model();
                models.push( m4 );

                Collection = bindOptions( { selectIfRemoved: { starred: "next", picked: "prev" } } );
                collection = new Collection( models );
            } );

            describe( 'When a model is removed which is not selected, starred or picked', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m3.select();
                    m4.select( { label: "picked" } );

                    collection.remove( m2 );
                } );

                it( 'the selected model in the collection remains unchanged', function () {
                    expect( collection.selected ).to.deep.equal( m3 );
                } );

                it( 'the starred model in the collection remains unchanged', function () {
                    expect( collection.starred ).to.deep.equal( m1 );
                } );

                it( 'the picked model in the collection remains unchanged', function () {
                    expect( collection.picked ).to.deep.equal( m4 );
                } );

            } );

            describe( 'When a model is removed which is selected, but not starred or picked', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m3.select();
                    m4.select( { label: "picked" } );

                    collection.remove( m3 );
                } );

                it( 'the selected model in the collection is left undefined', function () {
                    // For the "selected" label, selectIfRemoved is left at its default, "none".
                    expect( collection.selected ).to.be.undefined;
                } );

                it( 'the starred model in the collection remains unchanged', function () {
                    expect( collection.starred ).to.deep.equal( m1 );
                } );

                it( 'the picked model in the collection remains unchanged', function () {
                    expect( collection.picked ).to.deep.equal( m4 );
                } );

            } );

            describe( 'When a model is removed which is starred, but not selected or picked', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m3.select();
                    m4.select( { label: "picked" } );

                    collection.remove( m1 );
                } );

                it( 'the selected model in the collection remains unchanged', function () {
                    expect( collection.selected ).to.deep.equal( m3 );
                } );

                it( 'the starred model in the collection is updated according to the selectIfRemoved setting', function () {
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

                it( 'the picked model in the collection remains unchanged', function () {
                    expect( collection.picked ).to.deep.equal( m4 );
                } );

            } );

            describe( 'When a model is removed which is starred and picked, but not selected', function () {

                beforeEach( function () {
                    m2.select( { label: "starred" } );
                    m2.select( { label: "picked" } );
                    m3.select();

                    collection.remove( m2 );
                } );

                it( 'the selected model in the collection remains unchanged', function () {
                    expect( collection.selected ).to.deep.equal( m3 );
                } );

                it( 'the starred model in the collection is updated according to the selectIfRemoved setting', function () {
                    expect( collection.starred ).to.deep.equal( m3 );
                } );

                it( 'the picked model in the collection is updated according to the selectIfRemoved setting', function () {
                    expect( collection.picked ).to.deep.equal( m1 );
                } );

            } );

            describe( 'When a model is removed which is starred, picked, and selected', function () {

                beforeEach( function () {
                    m2.select( { label: "starred" } );
                    m2.select( { label: "picked" } );
                    m2.select();

                    collection.remove( m2 );
                } );

                it( 'the selected model in the collection is left undefined', function () {
                    // For the "selected" label, selectIfRemoved is left at its default, "none".
                    expect( collection.selected ).to.be.undefined;
                } );

                it( 'the starred model in the collection is updated according to the selectIfRemoved setting', function () {
                    expect( collection.starred ).to.deep.equal( m3 );
                } );

                it( 'the picked model in the collection is updated according to the selectIfRemoved setting', function () {
                    expect( collection.picked ).to.deep.equal( m1 );
                } );

            } );

        } );

        describe( 'The default label of the collection is set to "starred", and selectIfRemoved is set to "next"', function () {

            beforeEach( function () {
                Collection = bindOptions( { defaultLabel: "starred", selectIfRemoved: "next" } );
                collection = new Collection( models );
            } );

            describe( 'When a model is removed which is neither selected nor starred', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m3.select();

                    collection.remove( m2 );
                } );

                it( 'the starred model in the collection remains unchanged', function () {
                    expect( collection.starred ).to.deep.equal( m1 );
                } );

                it( 'the selected model in the collection remains unchanged', function () {
                    expect( collection.selected ).to.deep.equal( m3 );
                } );

            } );

            describe( 'When a model is removed which is selected, but not starred', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m3.select();

                    collection.remove( m3 );
                } );

                it( 'the selected model in the collection is left undefined', function () {
                    // For the "selected" label, selectIfRemoved is left at its default, "none".
                    expect( collection.selected ).to.be.undefined;
                } );

                it( 'the starred model in the collection remains unchanged', function () {
                    expect( collection.starred ).to.deep.equal( m1 );
                } );

            } );

            describe( 'When a model is removed which is starred, but not selected', function () {

                beforeEach( function () {
                    m1.select( { label: "starred" } );
                    m3.select();

                    collection.remove( m1 );
                } );

                it( 'the selected model in the collection remains unchanged', function () {
                    expect( collection.selected ).to.deep.equal( m3 );
                } );

                it( 'the starred model in the collection is updated according to the selectIfRemoved setting', function () {
                    expect( collection.starred ).to.deep.equal( m2 );
                } );

            } );

            describe( 'When a model is removed which is starred and selected', function () {

                beforeEach( function () {
                    m2.select( { label: "starred" } );
                    m2.select();

                    collection.remove( m2 );
                } );

                it( 'the selected model in the collection is left undefined', function () {
                    // For the "selected" label, selectIfRemoved is left at its default, "none".
                    expect( collection.selected ).to.be.undefined;
                } );

                it( 'the starred model in the collection is updated according to the selectIfRemoved setting', function () {
                    expect( collection.starred ).to.deep.equal( m3 );
                } );

            } );

        } );

        describe( 'selectIfRemoved in conjunction with an ignored label', function () {

            // We only test selectIfRemoved with a hash here. When selectIfRemoved is set to a string, it is applied to
            // the default label, and the default label can never be ignored.

            describe( 'When selectIfRemoved is set to "none" for an ignored label', function () {

                beforeEach( function () {
                    Collection = bindOptions( { ignoreLabel: "starred", selectIfRemoved: { starred: "none" } } );
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

            describe( 'When selectIfRemoved is set to a value other than "none" for an ignored label', function () {

                beforeEach( function () {
                    Collection = bindOptions( { ignoreLabel: "starred", selectIfRemoved: { starred: "next" } } );
                } );

                it( 'an error is thrown when the collection is created', function () {
                    expect( function () { new Collection( models ); } ).to.throw( "Conflicting options: Can't define selectIfRemoved behaviour for label \"starred\" because it is ignored in the collection." );
                } );

            } );

        } );

    } );

})();