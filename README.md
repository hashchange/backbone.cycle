# Backbone.Cycle

Navigating and selecting Backbone Models and Collections.

## Dependencies and setup

[Backbone][] and [Backbone.Picky][] are the only dependencies. (Backbone.Picky needs to be pulled from [my repo][Backbone.Picky_hashchange] until my PRs are merged in.) Include backbone.cycle.js after [Backbone][] and [Backbone.Picky][] are loaded.

## Components

## Usage and examples

### The basics

### Options

#### What they do

- initialSelection
- selectIfRemoved
- enableModelSharing

Important: If `initialSelection` or `selectIfRemoved` is set to anything other than "none", model-sharing mode is enabled automatically. (That is because they all are based on the same event-handling mechanisms.)

#### Restrictions and caveats

If you make use of any of these options, the following caveats apply:

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

- As a general rule, don't use the `silent` option when adding models, removing them, or resetting a collection. If you are sharing models among multiple collections, this is a must. Never use the `silent` option for `add`, `remove` or `reset` actions.

#### Workarounds for using silent actions

If you are not actually sharing models among collections, you can get away with silent actions if you watch out for these traps:

* Don't remove a selected model silently. (With or without Backbone.Cycle.) If you do, the model will remain selected, and it will still be referenced by `collection.selected`. The `selectIfRemoved` setting won't get applied either, of course.
* Likewise, don't reset the collection silently if a model is selected. You'd end up with the exact same mess: a reference to a selected model which has been removed from the collection.
* If you make sure a model is deselected at the time it is removed, you _can_ safely suppress the `remove` event. (`selectIfRemoved` wouldn't apply then, as the removed model isn't selected.)
* With `reset`, same story. Make sure there is no selection, then a silent reset is OK. If you pass in new models with the silent reset, you suppress the initial selection.
* Silencing `add` is safe. If you are using `add` to pass the initial set of models to the collection, the silent option suppresses the initial selection.

Confused? Fair enough. Don't use `silent` then ;).

## Build process and tests

### Setup

[npm][] and [Bower][] set up the environment for you. 

- The only thing you've got to have on your machine is [Node.js]. Download the installer [here][Node.js].
- Open a command prompt in the project directory.
- Run `npm install`. (Creates the environment.)
- Run `bower install`. (Fetches the dependencies of the script.)

Your test and build environment is ready now. If you want to test against specific versions of Backbone or Backbone.Picky, edit `bower.json` first.

### Running tests, creating a new build

The test tool chain: [Grunt][] (task runner), [Karma][] (test runner), [Mocha][] (test framework), [Chai][] (assertion library), [Sinon][] (mocking framework). The good news: you don't need to worry much about any of this.

A handful of commands manage everything for you:

- Run the tests in a terminal with `grunt test`.
- Run the tests in a browser interactively, live-reloading the page when the source or the tests change: `grunt interactive`.
- Build the dist files (also running tests and linter) with `grunt build`, or just `grunt`.
- Build continuously on every save with `grunt ci`.
- Change the version number throughout the project with `grunt setver --to=1.2.3`. (Remember to rebuild the project with `grunt` afterwards.)

Finally, if need be, you can set up a quick demo page to play with the code. First, edit the files in the `demo` directory. Then display `demo/index.html`, live-reloading your changes to the code or the page, with `grunt demo`. Libraries needed for the demo/playground should go into the Bower dev dependencies, in the project-wide `bower.json`, or else be managed by the dedicated `bower.json` in the demo directory.

_The `grunt interactive` and `grunt demo` commands spin up a web server, opening up the whole project to access via http. By default, that access is restricted to localhost. You can relax the restriction it in `Gruntfile.js`, but be aware of the security implications._

### Changing the tool chain configuration

In case anything about the test and build process needs to be changed, have a look at the following config files:

- `karma.conf.js` (changes to dependencies, additional test frameworks)
- `Gruntfile.js`  (changes to the whole process)
- `web-mocha/_index.html` (changes to dependencies, additional test frameworks)

New test files in the `spec` directory are picked up automatically, no need to edit the configuration for that.

## License

MIT.

[Backbone.Picky_hashchange] "Backbone.Picky, hashchange"
[Backbone]: http://backbonejs.org/ "Backbone.js"
[Backbone.Picky]: https://github.com/derickbailey/backbone.picky#readme "Backbone.Picky"
[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma - Spectacular Test Runner for Javascript"
[Mocha]: http://visionmedia.github.io/mocha/ "Mocha - the fun, simple, flexible JavaScript test framework"
[Chai]: http://chaijs.com/ "Chai: a BDD / TDD assertion library"
[Sinon]: http://sinonjs.org/ "Sinon.JS - Versatile standalone test spies, stubs and mocks for JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"