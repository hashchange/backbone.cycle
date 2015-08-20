// amd.js

require( [

    'jquery',
    'underscore',
    'backbone',
    'backbone.select',
    'backbone.cycle'

], function ( $, _, Backbone ) {

    var Model = Backbone.Model.extend( {
            initialize: function () {
                Backbone.Cycle.SelectableModel.applyTo( this );
            }
        } ),

        Collection = Backbone.Collection.extend( {
            initialize: function ( models, options ) {
                Backbone.Cycle.SelectableCollection.applyTo( this, models, options );
            }
        } ),

        modelCount = 24,
        models = [],
        collection,

        CollectionView = Backbone.View.extend( {
            // A base class. Extend, don't instantiate.
            // By default, render is a no-op. Override if necessary.
            initialize: function ( options ) {
                _.bindAll( this, "selectNext", "selectPrev", "onSelect", "render" );
                this.collection = options.collection;
                this.listenTo( this.collection, "select:one", this.onSelect );
                this.listenTo( this.collection, "remove", this.render );
                this.render();
            },
            selectNext: function ( event ) {
                if ( event ) event.preventDefault();
                this.collection.selectNext();
            },
            selectPrev: function ( event ) {
                if ( event ) event.preventDefault();
                this.collection.selectPrev();
            },
            onSelect: function () {
                this.render();
            }
        } ),

        PaginationView = CollectionView.extend( {
            el: '#pagination',
            events: {
                "click #arrowPrev": "selectPrev",
                "click #arrowNext": "selectNext"
            }
        } ),

        StageView = CollectionView.extend( {
            el: '#stage',
            events: {
                "click": "selectNext"
            },

            render: function () {
                this.$el.html( this.collection.selected && '<a href="#">' + this.collection.selected.id + '</a>' || "-" );
            }
        } ),

        ControlsView = CollectionView.extend( {
            el: '#controls',
            events: {
                "click #remove": "remove"
            },

            initialize: function ( options ) {
                _.bindAll( this, "remove" );
                CollectionView.prototype.initialize.apply( this, arguments );
            },
            remove: function ( event ) {
                if ( event ) event.preventDefault();
                if ( this.collection.selected ) this.collection.remove( this.collection.selected );
            }
        } ),

        ListView = CollectionView.extend( {
            el: '#itemlist',
            events: {
                "click .item": "select"
            },

            initialize: function ( options ) {
                _.bindAll( this, "select" );
                CollectionView.prototype.initialize.apply( this, arguments );
                this.onSelect();
            },
            select: function ( event ) {
                var id = $( event.target ).text();
                if ( event ) event.preventDefault();
                this.collection.get( id ).select();
            },
            onSelect: function () {
                var id;
                if ( this.collection.selected ) {

                    id = this.collection.selected.id;
                    this.$el.find( ".selected" ).removeClass( "selected" );
                    this.$el
                        .find( "a" )
                        .filter( function () {
                            return $( this ).text() === String( id );
                        } )
                        .addClass( "selected" );
                }
            },
            render: function () {
                this.$el.empty();
                this.collection.each( function ( model ) {
                    this.$el.append( '<li class="item"><a href="#">' + model.id + '</a></li>' );
                }, this );
                this.onSelect();
            }
        } );

    for ( var i = 0; i < modelCount; i++ ) {
        models.push( new Model( { id: i + 1 } ) );
    }

    collection = new Collection( models, { autoSelect: "first", selectIfRemoved: "prevNoLoop" } );

    new StageView( { collection: collection } );
    new PaginationView( { collection: collection } );
    new ControlsView( { collection: collection } );
    new ListView( { collection: collection } );

} );
