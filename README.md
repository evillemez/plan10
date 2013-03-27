# README #

This is the game *Plan10!*. It is being developed in sync with the *Javelin* game engine.  More details on the game will come at 
a later date.

For more on *Javelin* and how to use it, see the [Javelin repository](https://github.com/evillemez/javelin).

> **Note**: to actually run the game/demos, you need `javelin.js` to be included in the `vendor/` directory.  That file is not included in this repo, it should be built from the *Javelin* repo mentioned above.

## Structure ##

Here's what you need to know about the structure of the files.

* `src/` - Includes all javascript for the game.  All these files are compressed and minified using *Grunt.js* and written to `/build`.  There's no special structure for anything under `src/`, I just organized it however felt most natural for me.
* `assets/` - All (mostly) non-code game assets.  This indludes sound and image files.
* `vendor/` - Includes other javascript required for the game, for example `javelin.js` and potentially others
* `docs/` - A copies of the working documentation that was used while planning the game
* `build/` - The compressed and minified version of everything under `src/`.  These are what are used in `index.html`.
* `util/` - One-off utilities, mostly for the build process.
* `Gruntfile.js` - Grunt settings for the project
* `index.html` - The entry-point for the game.  It includes the necessary files, then instantiates the engine, loads the first scene, and runs.


## Deployment ##

    //TODO: describe what to do to "build" the game