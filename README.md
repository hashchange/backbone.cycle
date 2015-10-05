# Backbone.Cycle

Backbone.Cycle is a set of mixins for [Backbone][] models and collections. Models gain the ability to be selected, and collections handle those selections. Methods for navigating a collection are also part of the package, such as `model.ahead(3)`, `collection.selectNext()`, `collection.prev()`, `collection.prevNoLoop()`.

With Backbone.Cycle options, you enable predefined, common behaviours, like always selecting the first item in a new collection, or selecting the previous model when a selected model is removed. Models can be shared across multiple collections, and selections are synced among them.

##### Backbone.Cycle vs Backbone.Select

Backbone.Cycle is built on top of [Backbone.Select][]. The selection features are identical. Backbone.Cycle adds navigation methods and options.

- Backbone.Select is designed with a minimal surface area. As few methods as possible are added to your objects. Basically, all you can do is `select` and `deselect`. The idea is that you should be able to use Backbone.Select mixins pretty much everywhere, with a near-zero risk of conflicts.
- With Backbone.Cycle, you get a little more in terms of methods and behaviour. It may often be more convenient to use and probably is the better choice for a greenfield project.

## The gist of it

Perhaps the best way to explain what Backbone.Cycle does, before getting into the details, is an example.

```javascript
var Model = Backbone.Model.extend( {
    initialize: function () {
        // Applies the mixin:
        Backbone.Cycle.SelectableModel.applyTo( this );
    }
} );

var Collection = Backbone.Collection.extend( {
    initialize: function ( models, options ) {
        // Applies the mixin:
        Backbone.Cycle.SelectableCollection.applyTo( this, models, options );
    }
} );

var m1 = new Model( {id: "m1"} ),
    m2 = new Model( {id: "m2"} ),
    m3 = new Model( {id: "m3"} );

var collection = new Collection(
    [m1, m2, m3],
    { autoSelect: "first", selectIfRemoved: "next" }
);

console.log( collection.selected.id ); // prints "m1" because of autoSelect: "first"
console.log( m2.next().id );           // prints "m3"
console.log( m1.ahead( 2 ).id );       // prints "m3"

collection.selectNext();               // selects m2

collection.remove( m2 );
console.log( collection.selected.id ); // prints "m3" because of selectIfRemoved: "next"
```

If you are not familiar with [Backbone.Select][], you should [have a look there][Backbone.Select-intro-example], too.

## Dependencies and setup

[Backbone][] and [Backbone.Select][] are the only dependencies. Include backbone.cycle.js after [Backbone][] and [Backbone.Select][].

The stable version of Backbone.Cycle is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]), including an AMD build ([dev][dist-amd-dev], [prod][dist-amd-prod]). If you use Bower, fetch the files with `bower install backbone.cycle`. With npm, it is `npm install backbone.cycle`.

## Components

There are three components in this package:

- Backbone.Cycle.Model just offers basic navigation features
- Backbone.Cycle.SelectableModel and Backbone.Cycle.SelectableCollection, used in tandem, provide the full feature set.

### Basic navigation: Backbone.Cycle.Model

The basic navigation methods are provided by Backbone.Cycle.Model. The component doesn't include the ability to select items.

#### Methods of Backbone.Cycle.Model

There are two kinds of methods in Backbone.Cycle.Model.

- Looping navigation methods: 
  
  `model.next()`, `model.prev()`, `model.ahead(n)`, `model.behind(n)`. 

   They return the next or previous model in the collection, relative to the model the method is called on. `ahead` and `behind` return a model which is _n_ items ahead or back. Once the final item of the collection is reached, the methods loop and continue from the first item, or from the last item when moving in the opposite direction.

- Non-looping navigation methods: 
  
  `model.nextNoLoop()`, `model.prevNoLoop()`, `model.aheadNoLoop(n)`, `model.behindNoLoop(n)`. 

  When these methods try to access a model beyond the boundaries of the collection, they return `undefined`.
  
Navigation always happens in the context of a collection. That collection is referenced in the [`collection` property][backbone-model-initialize] of the model. If a model is part of more than one collection, `model.collection` refers to the one the model was added to first.

You can override the collection context, though, and pass a collection as an argument to any of the above methods. For instance, `model.ahead(5, otherCollection)` returns the model which is five items ahead of `model` in `otherCollection`. Likewise, you'd call `next` with a collection context as `model.next(otherCollection)`. 

#### Applying the mixin

Backbone.Cycle.Model is applied to a model in `initialize`:

```javascript
var Model = Backbone.Model.extend( {
    initialize: function () {
        Backbone.Cycle.Model.applyTo( this );
    }
} );
```


#### Usage examples for Backbone.Cycle.Model

The basic usage, plain and simple:

```javascript
var Model = Backbone.Model.extend( {
    initialize: function () {
        Backbone.Cycle.Model.applyTo( this );
    }
} );

var m1 = new Model( {id: "m1"} ),
    m2 = new Model( {id: "m2"} ),
    m3 = new Model( {id: "m3"} );

var collection = new Backbone.Collection( [m1, m2, m3] );

console.log( m2.next().id );           // prints "m3"
console.log( m1.ahead( 2 ).id );       // prints "m3"
```

If you share models among multiple collections:

```javascript
// Model order is reversed in otherCollection
var otherCollection = new Backbone.Collection( [m3, m2, m1] );

console.log( m2.next( otherCollection ).id );     // prints "m1"
console.log( m3.ahead( 2, otherCollection ).id ); // prints "m1"
```

### Navigating with selections: Backbone.Cycle.SelectableModel, Backbone.Cycle.SelectableCollection

Backbone.Cycle.SelectableModel and Backbone.Cycle.SelectableCollection add methods for selecting items. They also give you options for automatic selections. Both components must be used in tandem.

#### Methods 

Backbone.Cycle.SelectableModel and Backbone.Cycle.SelectableCollection inherit the features of [Backbone.Select][]. A SelectableCollection allows one model to be selected at a time; it is derived from Backbone.Select.One. 

As a result, you can `select()` models, retrieve the `selected` model from a collection, listen to `reselect:one` or `deselected` events, implement an `onSelect` event handler etc. See the [Backbone.Select documentation][Backbone.Select] for more on selection-related methods, properties and events.

Beyond the Backbone.Select features, a SelectableModel exposes the same methods as a basic Backbone.Cycle.Model. Call `next()`, `ahead(n)` etc as [described above][Cycle.Model-methods].

A SelectableCollection has similar methods.

- Looping navigation methods: 
  
  `collection.next()`, `collection.prev()`, `collection.ahead(n)`, `collection.behind(n)`. 

   They return the next or previous model in the collection, relative to the selected model. `ahead` and `behind` return a model _n_ items ahead or back. Once the final item of the collection is reached, the methods loop and continue from the first item, or from the last item when moving in the opposite direction.

- Non-looping navigation methods: 
  
  `collection.nextNoLoop()`, `collection.prevNoLoop()`, `collection.aheadNoLoop(n)`, `collection.behindNoLoop(n)`. 

  When these methods try to access a model beyond the boundaries of the collection, they return `undefined`.

- Looping and non-looping selection methods: 
  
  `collection.selectNext()`, `collection.selectPrev()`, `collection.selectNextNoLoop()`, `collection.selectPrevNoLoop()`. 

   Instead of returning the model, these methods select it. Looping methods always do. But if a non-looping, `select*NoLoop` method tries to select a model beyond the boundaries of the collection, the method is a no-op, and the selection remains unchanged.

- The odd one out: `selectAt(n)`. An unrelated convenience method, selects the model at index _n_.

Navigation methods, like `next()`, appear in SelectableModel and SelectableCollection. Keep in mind, though, that SelectableModel methods calculate positions relative to the model they are invoked on. By contrast, SelectableCollection methods act relative to the _selected_ model in the collection.

Unsurprisingly, then, SelectableCollection methods require that a model has been selected in the collection. Otherwise, an error is thrown. The only exception is `selectAt`, which is purely index-based and works without an existing selection.

#### Applying the mixins

Backbone.Cycle.SelectableModel and Backbone.Cycle.SelectableCollection must be used together. Only SelectableModels can be added to a SelectableCollection.

Both mixins are applied in `initialize`:

```javascript
var Model = Backbone.Model.extend( {
    initialize: function () {
        Backbone.Cycle.SelectableModel.applyTo( this );
    }
} );

var Collection = Backbone.Collection.extend( {
    initialize: function ( models, options ) {
        Backbone.Cycle.SelectableCollection.applyTo( this, models, options );
    }
} );
```

Even though Backbone.Cycle depends on [Backbone.Select][], there is no need to apply the Backbone.Select mixins in `initialize`. The Backbone.Cycle mixins do that themselves, behind the scenes.

Backbone.Cycle.SelectableCollection allows only one selected item at a time. It is based on Backbone.Select.One. Its features make less sense if there are multiple selected items in a collection, so there is no corresponding component for Backbone.Select.Many in Backbone.Cycle.

#### Options for a SelectableCollection

When a SelectableCollection mixin is created with `applyTo`, you can pass an options object to it. Options define the behaviour when models are passed to a collection, removed from it, or when models are shared among multiple collections.

##### What they are, what they do

You have three options to choose from.

- `autoSelect`:

  Set it to `"first"` if you want the first model in a collection to be selected automatically. You can also set the option to `"last"`, or provide the index of the model you'd like to see auto-selected. If the index does not exist at the time, that's fine – `autoSelect` just won't select anything then.
  
  The `autoSelect` setting kicks in when the initial set of models is passed to a collection – be it to the constructor, with `add`, or with `reset`. Auto select can also be triggered later on in the lifecycle of a collection: when you do an `add` or `reset` while there is no selection in the collection.
  
  It's important to note that `autoSelect` will _only_ spring into action during instantiation, with an `add`, or with a `reset`. It won't guarantee that there is a selected item all the time. If you deselect manually, nothing will happen unless you `add` or `reset` later on.
   
  `autoSelect` may have a performance impact when adding items to really large collections. Those are better handled without `autoSelect` magic, at least if you add items frequently. The negative effect is limited to actual `add` calls, though – resets are not affected.
  
  The `autoSelect` option is off by default, with value `autoSelect: "none"`.

- `selectIfRemoved`:

  Use it if you want to select another model when the selected model is removed from the collection. The option value determines which model gets selected: `"prev"`, `"next"`, `"prevNoLoop"`, `"nextNoLoop"`. 

  The option is off by default, with value `selectIfRemoved: "none"`.

- `enableModelSharing`:

  Set it to true if you share models among multiple collections. See the [section on model sharing][Backbone.Select-model-sharing] in the documentation of Backbone.Select. Model sharing is disabled by default.

Watch out: When `autoSelect` or `selectIfRemoved` is set to anything other than "none", model-sharing mode *is enabled automatically*. (That is because all options are based on the same event-handling mechanism.) [See below][options-caveats] for potential pitfalls.

The use of options is demonstrated in the [introductory example][intro-example].

##### Restrictions and caveats when using options

If you use any of these options, the following caveats apply:

- When a collection is no longer in use, call `close()` on it to avoid memory leaks.

  So don't just replace a collection like this:

        var myCol = new MySelectableCollection([myModel]);
        // ... do stuff
        myCol = new MySelectableCollection([myModel]);  // WRONG!

  Instead, call `close()` before you let an obsolete collection fade away into oblivion:

        var myCol = new MySelectableCollection([myModel]);
        // ... do stuff
        myCol.close();
        myCol = new MySelectableCollection([myModel]);

  Note that you don't need to call `close()` if you leave all options at their defaults.

- As a general rule, don't use the `silent` option when adding models, removing them, or resetting a collection. 
  
  If you are sharing models among multiple collections, this is more than a general rule, it is a must. Never use the `silent` option for `add`, `remove` or `reset` actions.

##### Workarounds for silent actions

If you are not actually sharing models among collections, you can get away with silent actions if you watch out for the following traps.

- `remove`:
  Don't remove a _selected_ model silently. If you do, the model will remain selected, and it will still be referenced by `collection.selected`. The `selectIfRemoved` setting won't get applied either, of course. 

  On the other hand, if you remove unselected models silently, that's OK.

- `reset`:
  Likewise, don't reset the collection silently if a model is selected. You'd end up with the exact same mess: a reference to a selected model which has been removed from the collection. 

  Make sure all models are deselected before silently resetting the collection. If you pass in new models with the silent reset, `autoSelect` is bypassed, so automatic selection doesn't happen.

- `add`:
  Silencing `add` is safe. If you are using `add` to pass the initial set of models to the collection, the `silent` option suppresses the automatic selection (ie, no `autoSelect`).

Confused? Fair enough. Don't use `silent` then ;).

#### Usage examples for Backbone.Cycle.SelectableCollection

Check out the [introductory example][intro-example].

## Build process and tests

If you'd like to fix, customize or otherwise improve the project: here are your tools.

### Setup

[npm][] and [Bower][] set up the environment for you. 

- The only thing you've got to have on your machine is [Node.js]. Download the installer [here][Node.js].
- Open a command prompt in the project directory.
- Run `npm install`. (Creates the environment.)
- Run `bower install`. (Fetches the dependencies of the script.)

Your test and build environment is ready now. If you want to test against specific versions of Backbone or Backbone.Select, edit `bower.json` first.

### Running tests, creating a new build

The test tool chain: [Grunt][] (task runner), [Karma][] (test runner), [Mocha][] (test framework), [Chai][] (assertion library), [Sinon][] (mocking framework). The good news: you don't need to worry about any of this.

A handful of commands manage everything for you:

- Run the tests in a terminal with `grunt test`.
- Run the tests in a browser interactively, live-reloading the page when the source or the tests change: `grunt interactive`.
- Build the dist files (also running tests and linter) with `grunt build`, or just `grunt`.
- Build continuously on every save with `grunt ci`.
- Change the version number throughout the project with `grunt setver --to=1.2.3`. Or just increment the revision with `grunt setver --inc`. (Remember to rebuild the project with `grunt` afterwards.)
- `grunt getver` will quickly tell you which version you are at.

Finally, if need be, you can set up a quick demo page to play with the code. First, edit the files in the `demo` directory. Then display `demo/index.html`, live-reloading your changes to the code or the page, with `grunt demo`. Libraries needed for the demo/playground should go into the Bower dev dependencies, in the project-wide `bower.json`, or else be managed by the dedicated `bower.json` in the demo directory.

_The `grunt interactive` and `grunt demo` commands spin up a web server, opening up the **whole project** to access via http._ So please be aware of the security implications. You can restrict that access to localhost in `Gruntfile.js` if you just use browsers on your machine.

### Changing the tool chain configuration

In case anything about the test and build process needs to be changed, have a look at the following config files:

- `karma.conf.js` (changes to dependencies, additional test frameworks)
- `Gruntfile.js`  (changes to the whole process)
- `web-mocha/_index.html` (changes to dependencies, additional test frameworks)

New test files in the `spec` directory are picked up automatically, no need to edit the configuration for that.

## Release notes

### v.2.0.1

* Fixed compatibility with Backbone 1.2.x

### v.2.0.0

* Added an `applyTo` setup method for Backbone.Cycle.Model, protecting the mixin from unintentional modification. The setup method _must_ be used – applying the mixin just by extending the host model no longer works.
* Fixed compatibility with Underscore 1.7.0
* Switched to plain objects as mixins internally

### v1.1.0

* Renamed `initialSelection` to `autoSelect`; `initialSelection` is deprecated but kept around as an alias in 1.x
* `autoSelect` no longer triggers a deselection event under any circumstances
* `autoSelect` now accepts values "last" or an item index

### v1.0.9, 1.0.10

* Minor bug and documentation fixes

### v1.0.8

* Fleshed out package.json for npm installs

### v1.0.4 - 1.0.7

* Minor bug fixes

### v1.0.3

* Relaxed dependency requirements

### v1.0.2

* Added _cycleType property to identify mixins in a model or collection
* Fixed line endings in minified AMD build, added source map
* Updated Backbone.Select dependency
* Fixed bower.json ignore list
* Fixed typos in readme

### v.1.0.1

* Added documentation

### v.1.0.0

* Initial version

## License

MIT.

Copyright (c) 2014, 2015 Michael Heim.

[dist-dev]: https://raw.github.com/hashchange/backbone.cycle/master/dist/backbone.cycle.js "backbone.cycle.js"
[dist-prod]: https://raw.github.com/hashchange/backbone.cycle/master/dist/backbone.cycle.min.js "backbone.cycle.min.js"
[dist-amd-dev]: https://raw.github.com/hashchange/backbone.cycle/master/dist/amd/backbone.cycle.js "backbone.cycle.js, AMD build"
[dist-amd-prod]: https://raw.github.com/hashchange/backbone.cycle/master/dist/amd/backbone.cycle.min.js "backbone.cycle.min.js, AMD build"

[Backbone]: http://backbonejs.org/ "Backbone.js"
[Backbone.Select]: https://github.com/hashchange/backbone.select#readme "Backbone.Select"
[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma – Spectacular Test Runner for Javascript"
[Mocha]: http://visionmedia.github.io/mocha/ "Mocha – the fun, simple, flexible JavaScript test framework"
[Chai]: http://chaijs.com/ "Chai: a BDD / TDD assertion library"
[Sinon]: http://sinonjs.org/ "Sinon.JS – Versatile standalone test spies, stubs and mocks for JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"

[backbone-model-initialize]: http://backbonejs.org/#Model-constructor "Backbone Documentation: Model constructor/initialize"
[Backbone.Select-model-sharing]: https://github.com/hashchange/backbone.select#sharing-models-among-collections "Backbone.Select: Sharing models among collections"
[Backbone.Select-intro-example]: https://github.com/hashchange/backbone.select#an-introductory-example "Backbone.Select: An introductory example"

[Cycle.Model-methods]: #methods-of-backbonecyclemodel
[options-caveats]: #restrictions-and-caveats-when-using-options
[intro-example]: #the-gist-of-it
