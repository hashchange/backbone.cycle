# Backbone.Cycle

<small>[Example][intro-example] – [Setup][setup] – [Basic navigation][Cycle.SelectableModel-methods] – [Navigating with selections][Cycle.SelectableCollection-methods] – [Behaviours][setup-options] – [Guidelines][guidelines] – [Build and test][build]</small>

Backbone.Cycle is a set of mixins for [Backbone][] models and collections. Models gain the ability to be selected, and collections handle those selections. Methods for navigating a collection are also part of the package, such as [`model.ahead(3)`][Cycle.SelectableModel-looping-navigation-methods], [`collection.selectNext()`][Cycle.SelectableCollection-selection-methods], [`collection.prev()`][Cycle.SelectableCollection-looping-navigation-methods], [`collection.prevNoLoop()`][Cycle.SelectableCollection-nonlooping-navigation-methods].

With Backbone.Cycle options, you can enable predefined, common [behaviours][setup-options], like always selecting the first item [in a new collection][autoselect-option], or selecting an adjacent model when a selected model [is removed][selectifremoved-option]. Models can be shared across multiple collections, and selections are synced among them.

##### Backbone.Cycle vs Backbone.Select

Backbone.Cycle is built on top of [Backbone.Select][]. The selection features are identical. Backbone.Cycle adds navigation methods and options.

- Backbone.Select is designed with a minimal surface area. As few methods as possible are added to your objects. Basically, all you can do is `select` and `deselect`. The idea is that you should be able to use Backbone.Select mixins pretty much everywhere, with a near-zero risk of conflicts.

- With Backbone.Cycle, you get a little more in terms of methods and behaviour. It may often be more convenient to use and probably is the better choice for a greenfield project.

## The gist of it

Perhaps the best way to explain what Backbone.Cycle does, before getting into the details, is an example.

```javascript
// --- (1) Setup ---

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

// --- (2) Defining behaviours ---

var collection = new Collection(
    [m1, m2, m3],
    { autoSelect: "first", selectIfRemoved: "next" }
);

console.log( collection.selected.id ); // prints "m1" because of autoSelect: "first"

// --- (3) Navigating ---

console.log( m2.next().id );           // prints "m3"
console.log( m1.ahead( 2 ).id );       // prints "m3"

collection.selectNext();               // selects m2

// --- (4) Removal behaviour ---

collection.remove( m2 );
console.log( collection.selected.id ); // prints "m3" because of selectIfRemoved: "next"
```

If you are not familiar with [Backbone.Select][], you should [have a look there][Backbone.Select-intro-example], too.

###### Demo

There is an interactive demo you can play around with. The demo is kept simple, and is a good way to explore the features of Backbone.Cycle. Check it out at [JSBin][demo-jsbin] or [Codepen][demo-codepen].

In addition, there are many more [interactive demos for Backbone.Select][Backbone.Select-demos].

## Dependencies and setup

[Underscore][], [Backbone][] and [Backbone.Select][] are the only dependencies. Include backbone.cycle.js when they are loaded.

The stable version of Backbone.Cycle is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]). If you use Bower, fetch the files with `bower install backbone.cycle`. With npm, it is `npm install backbone.cycle`.

When loaded as a module (e.g. AMD, Node), Backbone.Cycle does not export a meaningful value. It solely lives in the Backbone namespace.

## Components

There are three components in this package:

- [Backbone.Cycle.SelectableModel][Cycle.SelectableModel-methods] and [Backbone.Cycle.SelectableCollection][Cycle.SelectableCollection-methods] are used together. They provide the full feature set.
- [Backbone.Cycle.Model][lightweight-mixin] just offers basic navigation features, and does not support making selections.

## Full-featured mixins

[Backbone.Cycle.SelectableModel][Cycle.SelectableModel-methods] and [Backbone.Cycle.SelectableCollection][Cycle.SelectableCollection-methods] provide you with methods for navigation, and for selecting items. The collection also gives you [options for automatic selections][setup-options]. 

Both components must be used together. The model mixin, Backbone.Cycle.SelectableModel, has to be applied to all models in a Backbone.Cycle.SelectableCollection. 

If you don't take care of that yourself, it happens automatically when models, or sets of raw model data, are added to a SelectableCollection. That mechanism is the same as in Backbone.Select. [See there for more][Backbone.Select.Me-auto-applied] – including cases where you are [better off applying][Backbone.Select.Me-when-to-apply-manually] the model mixin yourself.

### Inheriting from Backbone.Select

Backbone.Cycle.SelectableModel and Backbone.Cycle.SelectableCollection inherit the features of [Backbone.Select][]. A SelectableCollection allows one model to be selected at a time; it is derived from [Backbone.Select.One][]. 

As a result, you can `select()` models, retrieve the `selected` model from a collection, listen to `reselect:one` or `deselected` events, implement an `onSelect` event handler etc. See the [Backbone.Select documentation][Backbone.Select] for more on selection-related methods, properties and events.

### Model methods

Backbone.Cycle.SelectableModel adds two kinds of navigation methods to a Backbone model.

#### Looping navigation methods 
  
  `model.next()`, `model.prev()`, `model.ahead(n)`, `model.behind(n)`. 

Looping navigation methods return the next or previous model in the collection, relative to the model the method is called on. `ahead` and `behind` return a model which is _n_ items ahead or back. Once the final item of the collection is reached, the methods loop and continue from the first item, or from the last item when moving in the opposite direction.

#### Non-looping navigation methods 
  
`model.nextNoLoop()`, `model.prevNoLoop()`, `model.aheadNoLoop(n)`, `model.behindNoLoop(n)`. 

When you try to access a model beyond the boundaries of the collection, these methods return `undefined`.

#### Collection context in a model
  
Navigation always happens in the context of a collection. That collection is referenced in the [`collection` property][backbone-model-initialize] of the model. If a model is part of more than one collection, `model.collection` refers to the one the model was added to first.

You can override the collection context, though. Just pass a collection as an argument to any of the above methods. For instance, `model.ahead(5, otherCollection)` returns the model which is five items ahead of `model` in `otherCollection`. Likewise, you'd call `next` with a collection context as `model.next(otherCollection)`. 

#### Usage examples for Backbone.Cycle.SelectableModel

The basic usage, plain and simple:

```javascript
var Model = Backbone.Model.extend( {
    initialize: function ( attributes, options ) {
        Backbone.Cycle.SelectableModel.applyTo( this, options );
    }
} );

var m1 = new Model( {id: "m1"} ),
    m2 = new Model( {id: "m2"} ),
    m3 = new Model( {id: "m3"} );

var collection = new Backbone.Collection( [m1, m2, m3] );

console.log( m2.next().id );           // prints "m3"
console.log( m1.ahead( 2 ).id );       // prints "m3"
```

If you share models among multiple collections, [specify the collection][Cycle.SelectableModel-collection-context]:

```javascript
// Model order is reversed in otherCollection
var otherCollection = new Backbone.Collection( [m3, m2, m1] );

console.log( m2.next( otherCollection ).id );     // prints "m1"
console.log( m3.ahead( 2, otherCollection ).id ); // prints "m1"
```

### Collection methods

The methods of a SelectableCollection match those [of a SelectableModel][Cycle.SelectableModel-methods].

There is a difference, though. In a collection, navigation happens relative to the selected model. By contrast, navigation methods called on a model are relative to that model. A selection doesn't matter in that context. 

#### Looping navigation methods
  
`collection.next( [options] )`, `collection.prev( [options] )`

`collection.ahead(n, [options] )`, `collection.behind(n, [options] )`. 

The `next` and `prev` methods return the next or previous model in the collection, relative to the selected model. Likewise, `ahead` and `behind` return a model _n_ items ahead or back. 

Once the final item of the collection is reached, the methods loop and continue from the first item, or from the last item when moving in the opposite direction.

The looping navigation methods support the following option: [`label`][choosing-label].

#### Non-looping navigation methods
  
`collection.nextNoLoop( [options] )`, `collection.prevNoLoop( [options] )`

`collection.aheadNoLoop(n, [options] )`, `collection.behindNoLoop(n, [options] )`. 

When you try to access a model beyond the boundaries of the collection, these methods return `undefined`.

The non-looping navigation methods support the following option: [`label`][choosing-label].

#### Looping and non-looping selection methods
  
`collection.selectNext( [options] )`, `collection.selectPrev( [options] )`

`collection.selectNextNoLoop( [options] )`, `collection.selectPrevNoLoop( [options] )`. 

Instead of returning the model, these methods select it. (They return the collection, and thus allow chaining.)

Looping methods always succeed. By contrast, if you call a non-looping, `select*NoLoop` method to select a model beyond the boundaries of the collection, the method is a no-op, and the selection remains unchanged.

The selection methods support the following options: [`silent`][Backbone.Select-select.one-silent], [`label`][choosing-label].

#### Other methods

`selectAt(n)`. 

An unrelated convenience method, selects the model at index _n_.

The method returns the collection, and allows chaining.

#### Collection methods require selection

Navigation methods, like `next()`, appear in SelectableModel and SelectableCollection. Keep in mind, though, that SelectableModel methods calculate positions relative to the model they are invoked on. By contrast, SelectableCollection methods act relative to the _selected_ model in the collection.

Unsurprisingly, then, SelectableCollection methods require that a model has been selected in the collection. Otherwise, an error is thrown. The only exception is `selectAt`, which is purely index-based and works without an existing selection.

#### Choosing a label

As mentioned above, the collection methods determine their destination based on the selected model. And by "selected model", we mean the one implied by the default label of the collection. 

(Out of the box, that [default label][Backbone.Select-default-label] is `"selected"`. Read more about labels in the [Backbone.Select documentation][Backbone.Select-custom-labels].)

To base the navigation, or selection, on a different label, pass in an options object with its `label` property set.

```js
collection.ahead( 3, { label: "starred" } );   // => relative to the model selected 
                                               //    with label "starred"

collection.selectNext( { label: "picked" } );  // => selects a model with label "picked", 
                                               //    relative to the current "picked" model
```

### Applying the mixins

Backbone.Cycle.SelectableModel and Backbone.Cycle.SelectableCollection must be used together. Only SelectableModels can be added to a SelectableCollection.

If you don't apply the SelectableModel mixin yourself, it happens automatically when models, or sets of raw model data, are added to a SelectableCollection. That mechanism is the same as in Backbone.Select. [See there for more][Backbone.Select.Me-auto-applied] – including cases where you are [better off applying][Backbone.Select.Me-when-to-apply-manually] the model mixin yourself.

Mixins are applied in `initialize`:

```javascript
// Collection mixin. You must apply this mixin.
var Collection = Backbone.Collection.extend( {
    initialize: function ( models, options ) {
        Backbone.Cycle.SelectableCollection.applyTo( this, models, options );
    }
} );

// Model mixin. This is optional.
//
// You can also pass in ordinary models, or raw model data, and
// rely on automatic mixin application when the models are added 
// to the collection.
var Model = Backbone.Model.extend( {
    initialize: function ( attributes, options ) {
        Backbone.Cycle.SelectableModel.applyTo( this, options );
    }
} );
```

###### Signature, options

The Backbone.Cycle.**SelectableCollection** `applyTo()` signature is: 

```js
Backbone.Cycle.SelectableModel.applyTo( collection, models, [options] );
```

You can pass an options hash as the third parameter to `.applyTo()`. Backbone.Cycle.SelectableCollection recognizes the [options of a Backbone.Select.One collection][Backbone.Select.One-applyTo], and the following ones in addition: [`autoSelect`][autoselect-option], [`selectIfRemoved`][selectifremoved-option].

The Backbone.Cycle.**SelectableModel** `applyTo()` signature is: 

```js
Backbone.Cycle.SelectableModel.applyTo( model, [options] );
```

You can pass an options hash as the second parameter to `.applyTo()`. Backbone.Cycle.SelectableModel recognizes the [options of Backbone.Select.Me models][Backbone.Select.Me-applyTo], and passes them on to the Select.Me mixin internally.

###### Automatic inclusion of Backbone.Select mixins

Even though Backbone.Cycle depends on [Backbone.Select][], there is no need to apply the Backbone.Select mixins in `initialize`. The Backbone.Cycle mixins do that themselves, behind the scenes.

Backbone.Cycle.SelectableCollection allows only one selected item at a time. It is based on [Backbone.Select.One][]. Its features make less sense if there are multiple selected items in a collection, so there is no corresponding component for [Backbone.Select.Many][] in Backbone.Cycle.

### Setup options for a SelectableCollection

When a SelectableCollection mixin is [created with `applyTo`][applying-full-featured-mixins], you can pass an options object to it. Options define the behaviour when models are passed to a collection, removed from it, or when models are shared among multiple collections.

#### What they are, what they do

The use of options is demonstrated in the [introductory example][intro-example]. A SelectableCollection supports all [options of a Backbone.Select.One collection][Backbone.Select.One-applyTo], as well as the ones listed below. 

##### `autoSelect` option

Choices: `"first"`, `"last"`, model index, `"none"` (default).

Set `autoSelect` to `"first"` if you want the first model in a collection to be selected automatically. You can also set the option to `"last"`, or provide the index of the model you'd like to see auto-selected. If the index does not exist at the time, that's fine – `autoSelect` just won't select anything then.

###### Triggers

The `autoSelect` setting kicks in when the initial set of models is passed to a collection – be it to the constructor, or with `add()`, `set()`, or `reset()`. Auto select can also be triggered later on in the lifecycle of a collection: when you call `add()`, `set()` or `reset()` while there is no selection in the collection.

It's important to note that `autoSelect` will only spring into action when you add models to a collection, or when you reset it. The option won't guarantee that there is a selected item all the time. If you simply deselect a model, nothing will happen unless you `add()` or `reset()` later on.

###### Events

If `autoSelect` selects a model while the collection is being instantiated, or when models are passed to `add()` or `set()`, all selection-related events fire as usual.

During a `reset()`, however, `select:one` and `deselect:one` events are silenced in the collection which is being reset. This is [standard behaviour in Backbone.Select][Backbone.Select-event-guidelines], and it also applies to selections made by `autoSelect`.

The silencing effect is strictly limited to the collection being reset, though. The `selected` and `deselected` events on a model _are_ triggered even during a reset. So are `select:*` and `deselect:one` events in other collections sharing the models. Again, this is how things always work [in Backbone.Select][Backbone.Select-event-guidelines].

Finally, if you call `add()` or `set()` with the `silent` option, selection-related events are silenced as well.

###### Labels

When you set `autoSelect` to a string, the option only affects the default [label][Backbone.Select-custom-labels] of the collection ([usually `"selected"`][Backbone.Select-default-label]). Other, secondary labels are not treated to auto selection magic then.

However, instead of setting `autoSelect` to a primitive value, you can set it to a hash. That hash must detail which labels you want auto selection behaviour for, and what that behaviour should be.

```js
Backbone.Cycle.SelectableCollection.applyTo( this, models, { 
    autoSelect: { selected: "first", starred: "first", picked: "last" } 
} );
```

If you want auto selection for the default label, make sure to include it explicitly in the hash, as seen above (`selected: "first"`).

###### Performance

`autoSelect` may have a performance impact when adding items to really large collections. Those are better handled without `autoSelect` magic, at least if you add items frequently. The negative effect is limited to actual `add()` calls, though – resets are not affected.

###### Default
  
The `autoSelect` option is off by default, with value `autoSelect: "none"`.

##### `selectIfRemoved` option

Choices: `"prev"`, `"next"`, `"prevNoLoop"`, `"nextNoLoop"`, `"none"` (default).

Use `selectIfRemoved` if you want to select another model when the selected model is removed from the collection. The option value determines which model gets selected: `"prev"`, `"next"`, `"prevNoLoop"`, `"nextNoLoop"`. 

###### Triggers and events

The `selectIfRemoved` setting responds to a `remove()` call on the collection. It does not respond to `reset()`. And obviously, if a model is shared with other collections, removing it from those _other_ collections doesn't somehow trigger the local `selectIfRemoved` behaviour.

If the behaviour causes to a model to be selected, all selection-related events fire as usual. However, if you call `remove()` with the `silent` option, the selection-related events are silenced as well.

###### Labels

When you set `selectIfRemoved` to a string, the option only affects the default [label][Backbone.Select-custom-labels] of the collection ([usually `"selected"`][Backbone.Select-default-label]). Other, secondary labels are not treated to auto selection magic then.

But just like `autoSelect`, you can set `selectIfRemoved` to a hash instead. That hash must detail which labels you want auto selection behaviour for, and what that behaviour should be.

```js
Backbone.Cycle.SelectableCollection.applyTo( this, models, { 
    selectIfRemoved: { selected: "next", starred: "next", picked: "prevNoLoop" } 
} );
```

Again, if you want auto selection for the default label, make sure to include it explicitly in the hash, as seen above (`selected: "next"`).

###### Default

The option is off by default, with value `selectIfRemoved: "none"`.

#### Guidelines

The guidelines for Backbone.Cycle are the same [as for Backbone.Select][Backbone.Select-guidelines]. Still, it may be worthwile to repeat the most important rule here.

##### Call `close()` when discarding a collection

When a collection is no longer in use, call `close()` on it. That avoids memory leaks and ensures proper selection handling when models are shared between collections.

So don't just replace a collection like this:

```js
var collection = new MySelectableCollection( [model] );
// ... do stuff
collection = new MySelectableCollection( [model] );  // WRONG!
```

Instead, call `close()` before you let an obsolete collection fade away into oblivion:

```js
var collection = new MySelectableCollection( [model] );
// ... do stuff
collection.close();
collection = new MySelectableCollection( [model] );
```

### Usage examples for Backbone.Cycle.SelectableCollection

Check out the [introductory example][intro-example].

## Backbone.Cycle.Model: A lightweight alternative for basic navigation

If you don't need to make selections, and you don't use Backbone.Cycle.SelectableCollection, you can keep things simple with a stripped-down model mixin. Backbone.Cycle.Model provides navigation methods, and there it ends.

### Methods of Backbone.Cycle.Model

Backbone.Cycle.Model exposes the same navigation methods as Backbone.Cycle.SelectableModel. Call `next()`, `ahead(n)` etc as [described above][Cycle.SelectableModel-methods].

Backbone.Cycle.Model does not inherit [Backbone.Select][] functionality, though, and does not support making selections. Do not use it in collections which have the [SelectableCollection mixin][full-featured-mixins] applied.

### Applying the mixin

Backbone.Cycle.Model is applied to a model in `initialize`:

```javascript
var Model = Backbone.Model.extend( {
    initialize: function () {
        Backbone.Cycle.Model.applyTo( this );
    }
} );
```

###### Signature, options

The Backbone.Cycle.Model `applyTo()` signature is: 

```js
Backbone.Cycle.Model.applyTo( model );
```

The method does not accept an options argument.

### Usage examples for Backbone.Cycle.Model

See the [examples for Backbone.Cycle.SelectableModel][Cycle.SelectableModel-usage].

## Build process and tests

If you'd like to fix, customize or otherwise improve the project: here are your tools.

### Setup

[npm][] sets up the environment for you.

- The only thing you've got to have on your machine (besides Git) is [Node.js]. Download the installer [here][Node.js].
- Clone the project and open a command prompt in the project directory.
- Run the setup with `npm run setup`.
- Make sure the Grunt CLI is installed as a global Node module. If not, or if you are not sure, run `npm install -g grunt-cli` from the command prompt.

Your test and build environment is ready now. If you want to test against specific versions of Backbone or Backbone.Select, edit `bower.json` first.

### Running tests, creating a new build

The test tool chain: [Grunt][] (task runner), [Karma][] (test runner), [Mocha][] (test framework), [Chai][] (assertion library), [Sinon][] (mocking framework). The good news: you don't need to worry about any of this.

A handful of commands manage everything for you:

- Run the tests in a terminal with `grunt test`.
- Run the tests in a browser interactively, live-reloading the page when the source or the tests change: `grunt interactive`.
- If the live reload bothers you, you can also run the tests in a browser without it: `grunt webtest`.
- Run the linter only with `grunt lint` or `grunt hint`. (The linter is part of `grunt test` as well.)
- Build the dist files (also running tests and linter) with `grunt build`, or just `grunt`.
- Build continuously on every save with `grunt ci`.
- Change the version number throughout the project with `grunt setver --to=1.2.3`. Or just increment the revision with `grunt setver --inc`. (Remember to rebuild the project with `grunt` afterwards.)
- `grunt getver` will quickly tell you which version you are at.

Finally, if need be, you can set up a quick demo page to play with the code. First, edit the files in the `demo` directory. Then display `demo/index.html`, live-reloading your changes to the code or the page, with `grunt demo`. Libraries needed for the demo/playground should go into the Bower dev dependencies – in the project-wide `bower.json` – or else be managed by the dedicated `bower.json` in the demo directory.

_The `grunt interactive` and `grunt demo` commands spin up a web server, opening up the **whole project** to access via http._ So please be aware of the security implications. You can restrict that access to localhost in `Gruntfile.js` if you just use browsers on your machine.

### Changing the tool chain configuration

In case anything about the test and build process needs to be changed, have a look at the following config files:

- `karma.conf.js` (changes to dependencies, additional test frameworks)
- `Gruntfile.js`  (changes to the whole process)
- `web-mocha/_index.html` (changes to dependencies, additional test frameworks)

New test files in the `spec` directory are picked up automatically, no need to edit the configuration for that.

## Release notes

### v3.0.0

Changes:

- Removed the separate AMD/Node builds in `dist/amd`. Module systems and browser globals are now supported by the same file, `dist/backbone.cycle.js` (or `.min.js`)
- Updated to Backbone.Select 2.1, as a minimum requirement. Model sharing is always enabled now. Remember to call `.close()` when you no longer use a collection.
- No more restrictions on using the `silent` option when calling` add()`, `remove()` or `reset()` on a collection. The `autoSelect` and `selectIfRemoved` options now respond to `silent` calls.

Other:

- Collections are able to process the full set of input types during instantiation, and when calling `add()`, `set()`, and `reset()`. Collections now accept attribute hashes, raw model data requiring `options.parse`, and models without the SelectableModel mixin applied. Previously, only models with the SelectableModel mixin have been accepted.

### v2.1.4

- Version is exposed in `Backbone.Cycle.version`
- AMD demo allows testing r.js output

### v2.1.3

- Updated bower.json, package.json for Backbone 1.3.x

### v2.1.2

- Fixed `select:one` event being fired by `autoSelect` during a reset, is silent now

### v2.1.1

- Made methods chainable which select a model
 
### v2.1.0

- Added `label` support

### v2.0.1

- Fixed compatibility with Backbone 1.2.x

### v2.0.0

- Added an `applyTo` setup method for Backbone.Cycle.Model, protecting the mixin from unintentional modification. The setup method _must_ be used – applying the mixin just by extending the host model no longer works.
- Fixed compatibility with Underscore 1.7.0
- Switched to plain objects as mixins internally

### v1.1.0

- Renamed `initialSelection` to `autoSelect`; `initialSelection` is deprecated but kept around as an alias in 1.x
- `autoSelect` no longer triggers a deselection event under any circumstances
- `autoSelect` now accepts values "last" or an item index

### v1.0.9, 1.0.10

- Minor bug and documentation fixes

### v1.0.8

- Fleshed out package.json for npm installs

### v1.0.4 - 1.0.7

- Minor bug fixes

### v1.0.3

- Relaxed dependency requirements

### v1.0.2

- Added _cycleType property to identify mixins in a model or collection
- Fixed line endings in minified AMD build, added source map
- Updated Backbone.Select dependency
- Fixed bower.json ignore list
- Fixed typos in readme

### v1.0.1

- Added documentation

### v1.0.0

- Initial version

## License

MIT.

Copyright (c) 2014-2024 Michael Heim.

[dist-dev]: https://raw.github.com/hashchange/backbone.cycle/master/dist/backbone.cycle.js "backbone.cycle.js"
[dist-prod]: https://raw.github.com/hashchange/backbone.cycle/master/dist/backbone.cycle.min.js "backbone.cycle.min.js"

[Backbone]: http://backbonejs.org/ "Backbone.js"
[Underscore]: http://underscorejs.org/ "Underscore.js"
[Backbone.Select]: https://github.com/hashchange/backbone.select#readme "Backbone.Select"
[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma – Spectacular Test Runner for Javascript"
[Mocha]: http://mochajs.org/ "Mocha – the fun, simple, flexible JavaScript test framework"
[Chai]: http://chaijs.com/ "Chai: a BDD / TDD assertion library"
[Sinon]: http://sinonjs.org/ "Sinon.JS – Versatile standalone test spies, stubs and mocks for JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"

[backbone-model-initialize]: http://backbonejs.org/#Model-constructor "Backbone Documentation: Model constructor/initialize"

[Backbone.Select-intro-example]: https://github.com/hashchange/backbone.select#an-introductory-example "Backbone.Select: An introductory example"
[Backbone.Select-demos]: https://github.com/hashchange/backbone.select#demos "Backbone.Select: Demos"
[Backbone.Select.Me-applyTo]: https://github.com/hashchange/backbone.select#signature-options "Backbone.Select.Me: `applyTo` signature and options"
[Backbone.Select.Me-auto-applied]: https://github.com/hashchange/backbone.select#applying-the-selectme-model-mixin-automatically "Backbone.Select: Applying the Select.Me model mixin automatically"
[Backbone.Select.Me-when-to-apply-manually]: https://github.com/hashchange/backbone.select#when-to-apply-the-model-mixin-manually "Backbone.Select: When to apply the model mixin manually"
[Backbone.Select.One]: https://github.com/hashchange/backbone.select#backboneselectone-a-single-select-collection "Backbone.Select.One: a single-select collection"
[Backbone.Select.One-applyTo]: https://github.com/hashchange/backbone.select#signature-options-1 "Backbone.Select.One: `applyTo` signature and options"
[Backbone.Select-select.one-silent]: https://github.com/hashchange/backbone.select#silent-option-1 "Backbone.Select: Select.One silent option"
[Backbone.Select.Many]: https://github.com/hashchange/backbone.select#backboneselectmany-a-multi-select-collection "Backbone.Select.Many: a multi-select collection"
[Backbone.Select-custom-labels]: https://github.com/hashchange/backbone.select#custom-labels "Backbone.Select: Custom labels"
[Backbone.Select-default-label]: https://github.com/hashchange/backbone.select#the-defaultlabel-setup-option "Backbone.Select: The `defaultLabel` setup option"
[Backbone.Select-guidelines]: https://github.com/hashchange/backbone.select#guidelines "Backbone.Select: Guidelines"
[Backbone.Select-event-guidelines]: https://github.com/hashchange/backbone.select#events "Backbone.Select: Guidelines – Events"

[intro-example]: #the-gist-of-it "The gist of it"
[setup]: #dependencies-and-setup "Dependencies and setup"

[full-featured-mixins]: #fullfeatured-mixins "Full-featured mixins: Backbone.Cycle.SelectableModel and Backbone.Cycle.SelectableCollection"
 
[Cycle.SelectableModel-methods]: #model-methods "Methods of Backbone.Cycle.SelectableModel"
[Cycle.SelectableModel-looping-navigation-methods]: #looping-navigation-methods "Backbone.Cycle.SelectableModel: Looping navigation methods"
[Cycle.SelectableModel-nonlooping-navigation-methods]: #nonlooping-navigation-methods "Backbone.Cycle.SelectableModel: Non-looping navigation methods"
[Cycle.SelectableModel-collection-context]: #collection-context-in-a-model "Collection context in a model"
[Cycle.SelectableModel-usage]: #usage-examples-for-backbonecycleselectablemodel "Usage examples for Backbone.Cycle.SelectableModel"

[Cycle.SelectableCollection-methods]: #collection-methods "Methods of Backbone.Cycle.SelectableCollection"
[Cycle.SelectableCollection-looping-navigation-methods]: #looping-navigation-methods-1 "Backbone.Cycle.SelectableCollection: Looping navigation methods"
[Cycle.SelectableCollection-nonlooping-navigation-methods]: #nonlooping-navigation-methods-1 "Backbone.Cycle.SelectableCollection: Non-looping navigation methods"
[Cycle.SelectableCollection-selection-methods]: #looping-and-nonlooping-selection-methods "Backbone.Cycle.SelectableCollection: Looping and non-looping selection methods"
[applying-full-featured-mixins]: #applying-the-mixins "Applying the mixins"

[setup-options]: #setup-options-for-a-selectablecollection "Setup options for a SelectableCollection"
[autoselect-option]: #autoselect-option "`autoSelect` option"
[choosing-label]: #choosing-a-label "Choosing a label"
[selectifremoved-option]: #selectifremoved-option "`selectIfRemoved` option"
[guidelines]: #guidelines

[lightweight-mixin]: #backbonecyclemodel-a-lightweight-alternative-for-basic-navigation "Backbone.Cycle.Model: A lightweight alternative for basic navigation"
[Cycle.Model-methods]: #methods-of-backbonecyclemodel "Methods of Backbone.Cycle.Model"

[build]: #build-process-and-tests "Build process and tests"

[demo-jsbin]: http://jsbin.com/johoha/4/edit?js,output "Backbone.Cycle: Demo (AMD) – JSBin"
[demo-codepen]: http://codepen.io/hashchange/pen/OVeovy "Backbone.Cycle: Demo (AMD) – Codepen"

[license]: #license "License"
[hashchange-projects-overview]: http://hashchange.github.io/ "Hacking the front end: Backbone, Marionette, jQuery and the DOM. An overview of open-source projects by @hashchange."