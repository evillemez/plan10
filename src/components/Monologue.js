'use strict';

/**
 * This component manages the intro/win/lose monologues.  It plays sound and shows images/text
 * based on the content of the json file it is told to load.
 */
Plan10.Component.Monologue = function(gameObject, component) {
    
    //public, to be set in prefab definitions, look at 'assets/monologue_example.json' for example format
    component.dataFile = null;
    
    //some private state things
    var timeStarted = null;
    var lastTimeDrawn = null;
    var finished = false;
    
    //load a bunch of stuff and start
    component.$on('engine.create', function() {
        //0. disable the gameobject until it's done loading stuff
        //1. load the data file
        //2. load the sound file specified
        //3. load all the image files specified
        //4. enable the gameobject
        //5. start playing the sound file using the audio component
        //6. keep track of what time the file started playing
        
        //an example data file is in assets/monologue_example.json
    });
    
    //just keep track of state
    component.$on('engine.update', function(deltaTime) {
        //either here, or in the `canvas2d.draw` section, check to figure
        //out when the monologue has finished and set "finished" to true
        
        if (finished) {
            //the html page will have a listener on it that shows the
            //splash page with the ('intro', 'play') buttons whenever this
            //event is emitted from the engine

            //gameObject.engine.emit('monologue.finished');
        }
    });
    
    //actually draw the monologue images/text
    component.$on('canvas2d.draw', function(context) {
        //use the canvas directly to draw the images and the text
        //context.drawimage()
        
        //for text, that will be trickier, depending on whether or not you want the scrolling effect
        //https://developer.mozilla.org/en-US/docs/Drawing_text_using_a_canvas
    });
};
Plan10.Component.Monologue.alias = "plan10.monologue";
Plan10.Component.Monologue.requires = [
//    'audioListener'
//    ,'audioEmitter'
];
