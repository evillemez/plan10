# README #

This is the game *Plan 10 From Outer Space!*. It was developed in sync with the *Javelin* game engine for submission in the Udacity 255 HTML5 Game Development course contest.

For more on *Javelin*, see the [Javelin repository](https://github.com/evillemez/javelin).  It's poorly documented for now, and probably has a few hacks for the sake of getting this game done for the contest.  It's also missing a fair amount of features I didn't have time to implement for the contest.

## Controls ##

* `w`, `a`, `s`, `d` to move forwards/backwards and rotate
* `shift + a` and `shift + d` to strafe left/right
* `j` to fire bomb, press again to detonate
* `k` to fire black hole, press again to detonate
* `escape` to go back to splash screen (Note that actually doing this will cause problems with the audio :) )

## Features! ##

* Epic story line spanning 70 years!
* Multiple endings!
* EXTREME GRAPHICS! (In some places, thanks to grits...)

## Structure ##

Here's what you need to know about the structure of the files and code.  There's some documentation in the code, but it may not be great, time was short.

The actual game is built with `grunt`, so the final code is in `build/plan10.js`, which is just the compressed version of everything under `src/`.  `vendor/` contains everything else that is not specific to the game, including *Javelin* and *Box2d*.

`app.js` instantiates the game, and wires some behavior to the elements on the page, and that's about it.

The actual game code is organized as such:

`src/game.js` - contains the main config for the game, which is passed to Javelin.Engine in app.js.  This file also defines the subnamespaces that the rest of the game code uses.  The config mostly contains values for the specific plugins to use in each scene.

`src/scenes/` - This directory defines the scenes that the instance of Javelin.Engine can load.  A scene is just a collection of initial game objects, and optional plugin configuration.  Plugins can be configured on a per-scene basis, but there was no need for it in this demo game.  The `objects` array can contain either object definitions, or strings, which are references to `prefabs`.  

`src/prefabs/` - This contains definitions for objects that are used in the various scenes.  A prefab is just a named object structure, saved for reuse. If you're familiar with Unity3d's terminology, it's the same as that.  Each object can have several properties, but the most important is the `components` property.  That property defines what components should exist on the object, and how they should be configured.

`src/components/` - This is where all the logic lives.  All game code is defined in a *component* that gets attached to a game object.  All of the components that are specific to this game are named with the `plan10.` prefix.  All others, such as `transform2d` or `sprite`, are components provided by *Javelin*.

So, to recap - the game defines some config for the engine, then the engine loads a scene which instantiates game objects.  Game objects are defined either in-line in a scene, or in a prefab.  When the engine instantiates a prefab, it adds instances of components to it, and configures them based on the values in the object definition.

## Known issues ##

* The physics w/ Box2d is not tuned well, the plugin for Javelin needs some modification to really work well
* everything related to sound
    * sounds holding over between scenes
    * sounds playing double when pre loaded
    * multiple sounds may trigger at once
    * generally the audio plugin in javelin needs to be fixed, it's not handling a lot of things properly
* instantiating bombs/black holes too close to another rigidbody (inside it, basically), will create many at once
    * For a neat bug, hold `q` and `e` together and enjoy the chaos

## Backstory ##

Months ago I decided to write a game engine in javascript because I thought it would be fun, and I have two specific projects that I would like to pursue with it.  I could have used another engine, but I couldn't find one that I particularly liked.  I have some experience using Unity3d, and ultimately I wanted to be able approach a game the way I would with Unity3d, but use the same open-source toolkit I used for web development.  So, I started Javelin.

Once I learned about the course (a week or two after I decided to actually start on the engine), I thought it would be a good opportunity to tackle specific issues.  I figured the contest would give me a way to focus on getting the bare-minimum implemented in order to have a functioning, but simple, game.  So... I needed a premise for a game.

My wife brought up saving the Earth from a meteor, and that immediately seemed like a good idea because the premise would be enough to build a game that demonstrated all, or most, of the concepts covered in the class, while not requiring many artistic assets.

## Assets & Attribution ##

All images are under Creative Commons License on the Web, from GRITS, or original artwork.

Voices/sound effects are the work of [Alkaizer](http://alkaizer.newgrounds.com/movies/)

Original artwork was produced and other assets modified using Inkscape (http://inkscape.org)

Format:
Asset
    Origin
    Attribution


/assets/monologue_image/script-04.png
     http://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg
     By NASA/Apollo 17 crew; taken by either Harrison Schmitt or Ron Evans [Public domain], via Wikimedia Commons

/assets/monologue_image/script-07.png
     http://commons.wikimedia.org/wiki/File%3A2013_Russian_meteor_event_(Magnitogorsk).webm
     By Noo4891 (Пu1072 дu1077 нu1080 емu1077 тu1077 оu1088 иu1090 аМu1072 гu1085 иu1090 оu1075 оu1088 сu1082 ) [CC-BY-3.0 (http://creativecommons.org/licenses/by/3.0)], via Wikimedia Commons

/assets/monologue_image/script-08.png
     http://commons.wikimedia.org/wiki/File%3AGemini_2.jpg
     Attribution not legally required By NASA [Public Domain], via Wikimedia Commons

/assets/monologue_image/script-09.png
     http://commons.wikimedia.org/wiki/File%3AMickey_Mouse_star_in_Walk_of_Fame.jpg
     By freshwater2006 [CC-BY-2.0 (http://creativecommons.org/licenses/by/2.0)], via Wikimedia Commons

/assets/monologue_image/script-10.png
     http://commons.wikimedia.org/wiki/File%3AJAXA_Space_Station_inside_1.jpg
     By Polimerek (Own work) [CC-BY-SA-3.0 (http://creativecommons.org/licenses/by-sa/3.0)], via Wikimedia Commons

/assets/monologue_image/script-11.png
     http://upload.wikimedia.org/wikipedia/commons/2/22/Asteroid_1.png
     By don't need [Public domain], via Wikimedia Commons

/assets/monologue_image/script-12.png &&
/assets/monologue_image/script-13.png
     Curt - cjc83486  http://opengameart.org/content/rpg-character
     CC-BY 3.0
     
/assets/lose.png
     http://commons.wikimedia.org/wiki/File%3ABert2.png
     See page for author [Public domain], via Wikimedia Commons

/assets/win.png
     http://commons.wikimedia.org/wiki/File%3ARepublic_of_Texas_Biker_Rally_Patriotism.jpg
     By Alex Thomson from Seattle, United States of America (Patriotism)
     [CC-BY-SA-2.0 (http://creativecommons.org/licenses/by-sa/2.0) or
     CC-BY-SA-2.0 (http://creativecommons.org/licenses/by-sa/2.0)], via
     Wikimedia Commons

/assets/starfield.png
     http://noise.png  
     300-1-100-monochrome.png

/assets/clapper.png
     <p>Image courtesy of ponsulak / <a href="http://www.freedigitalphotos.net" target="_blank">FreeDigitalPhotos.net</a></p>

/assets/asteroid.png
    http://opengameart.org/content/asteroid-generator-and-a-set-of-generated-asteroids
    Jasper, from opengameart.org