# README #

This is the game *Plan 10 From Outer Space!*. It was developed in sync with the *Javelin* game engine for submission in the Udacity 255 HTML5 Game Development course contest.

For more on *Javelin*, see the [Javelin repository](https://github.com/evillemez/javelin).  It's poorly documented for now, and probably has a few hacks for the sake of getting this game done for the contest.  It's also missing a fair amount of features I didn't have time to implement for the contest.

## Features! ##

* Epic story line spanning 70 years!
* Multiple endings!
* EXTREME GRAPHICS! (In some places, thanks to grits...)
* 

## Overview ##

Months ago I decided to write a game engine in javascript, because I thought it would be fun, and I have two specific projects that I would like to pursue with it.  I could have used another engine, but I couldn't find one that I particularly liked.  I have some experience using Unity3d, and ultimate I wanted to be able approach a game the way I would with Unity3d, but use the same open-source toolkit I used for web development.  So, I started Javelin.

Once I learned about the course (a week or two after I decided to actually start on the engine), I thought it would be a good opportunity to tackle specific issues.  I figured the contest would give me a way to focus on getting the bare-minimum implemented in order to have a functioning, but simple, game.  So... I needed a premise for a game.

My wife brought up saving the Earth from a meteor, and that immediately seemed like a good idea because the premise would be enough to build a game that demonstrated all, or most, of the concepts covered in the class, while not requiring many artistic assets.

## Structure ##

Here's what you need to know about the structure of the files and code.  There's some documentation in the code, but it may not be great, time was short.

The actual game is built with `grunt`, so the final code is in `build/plan10.js`, which is just the compressed version of everything under `src/`.  `vendor/` contains everything else that is not specific to the game, including *Javelin* and *Box2d*.

`app.js` instantiates the game, and wires some behavior to the elements on the page, and that's about it.

The actual game code is organized as such:

`src/game.js` - contains the main config for the game, which is passed to Javelin.Engine in app.js.  This file also defines the subnamespaces that the rest of the game code uses.  The config mostly contains values for the specific plugins to use in each scene.

`src/scenes/` - This directory defines the scenes that the instance of Javelin.Engine can load.  A scene is just a collection of initial game objects, and optional plugin configuration.  Plugins can be configured on a per-scene basis, but there was no need for it in this demo game.  The `objects` array can contain either object definitions, or strings, which are references to `prefabs`.  

`src/prefabs/` - This contains definitions for objects that are used in the various scenes.  A prefab is just a named object structure, saved for reuse. If you're familiar with Unity3d's terminology, it's the same as that.  Each object can have several properties, but the most important is the `components` property.  That property defines what components should exist on the object, and how they should be configured.

`src/components/` - This is where all the logic lives.  All game code is defined in a *component* that gets attached to a game object.  All of the components that are specific to this game are named with  `plan10.` prefix.  All other, such as `transform2d` or `sprite`, are components provided by *Javelin*.

So, to recap - the game defines some config for the engine, then the engine loads a scene which instantiates game objects.  Game objects are defined either in-line in a scene, or in a prefab.  When the engine instantiates a prefab, it adds instances of components to it, and configures them based on the values in the object definition.

## Assets ##

