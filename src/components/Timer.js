'use strict';

/**
 * Timer keeps track of how much time is left to complete the mission.
 * When the timer runs out, it loads the end scene
 */
Plan10.Component.Timer = function(gameObject, component) {
    //the asteroid manager needs to set this
    component.manager = null;
    
    //total time in seconds
    component.totalTime = 10000;
    component.timeLeft = 10000;
    
    component.$on('engine.create', function() {
        //start timer
    });
    
    component.$on('engine.update', function(deltaTime) {
        //decrease time if still running
        
        //if time is out, load lose scene
    });
    
    component.$on('canvas2d.draw', function(context) {
        //draw a timer somewhere on the screen to show how much
        //time is left before you lose
    });
    
};
Plan10.Component.Timer.alias = 'plan10.timer';
Plan10.Component.Timer.requires = [
    'sprite'
    ,'plan10.health'
    //,'rigidbody2d'
    //,'audioEmitter'
];
