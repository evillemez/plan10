'use strict';

/**
 * Timer keeps track of how much time is left to complete the mission.
 * When the timer runs out, it loads the end scene
 */
Plan10.Component.Timer = function(gameObject, component) {
    //the asteroid manager needs to set this
    component.manager = null;
    
    //total time in seconds
    component.totalTime = 250;
    component.timeLeft = null;
    
    //internal times are in milliseconds - not seconds
    var startTime, timeLeft;
    var warningPlayed = false;
    var audio = null;
    var timeLow = false;
    
    component.$on('engine.create', function() {
        startTime = gameObject.engine.time;
        timeLeft = (component.timeLeft) ? component.timeLeft : component.totalTime;
        audio = gameObject.getComponent('audioEmitter');
    });
    
    component.$on('engine.update', function(deltaTime) {
        timeLeft -= deltaTime;
        
        //play warning if little time left
        if (false) {
            audio.playOnce('assets/kent/script/time.mp3');
            warningPlayed = true;
            timeLow = true;
        }
        
        //trigger loss if time expires
        if (timeLeft <= 0) {
            gameObject.engine.loadScene('plan10.intro');
        }
    });
    
    component.$on('canvas2d.draw', function(context) {
        var x = timeLeft;
        var seconds = Math.round((x % 60)) * 100 / 100;
        var minutes = Math.floor((timeLeft / 60)) % 60;
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        var text = minutes + ':' + seconds;
        
        
        context.font = "bold 32px sans-serif";
        context.fillStyle = (timeLow) ? '#F00' : '#0F0';
        context.fillText(text, 700, 50);
    });
};
Plan10.Component.Timer.alias = 'plan10.timer';
Plan10.Component.Timer.requires = ['audioEmitter'];
