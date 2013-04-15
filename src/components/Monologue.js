'use strict';

/**
 * This component manages the intro/win/lose monologues.  It plays sound and shows images
 * based on the content of the json file it is told to load.  This whole thing is kinda full of
 * hacks because Javelin isn't handling audio very well yet.
 */
Plan10.Component.Monologue = function(gameObject, component) {

    //public, to be set in prefab or scene definitions
    component.dataFile = null;
    
    var started = false;
    var input = null;
    var audio;
    var frames = null;
    var frameStatus = {};
    var images;
    var currentFrame = 0;
    var frameStartTime = 0;
    var times = [];
    var soundPaths = [];
    var imgPaths = [];
    var finished = false;
    var timeoutInterval = null;
        
    //figure out current frame, start new sound if necessary - this is terrible and full of hacks
    component.$on('engine.update', function(deltaTime) {
        if (gameObject.engine.time - frameStartTime >= times[currentFrame] * 1000) {
            if (!started) {
                started = true;
            } else {
                currentFrame++;
                if (currentFrame > images.length - 1) {
                    gameObject.emit('plan10.splash_screen');
                }
            }
            
            if (soundPaths[currentFrame]) {
                audio.playOnce(soundPaths[currentFrame]);
                frameStartTime = gameObject.engine.time;
            }
        }
        
        if (input.getButton('quit')) {
            gameObject.emit('plan10.splash_screen');
        }
    });
    
    //draw current image
    component.$on('canvas2d.draw', function(context) {
        if (images[currentFrame]) {
            context.drawImage(images[currentFrame], 0, 0);
        }
    });
    
    //load assets
    component.$on('engine.create', function() {
        input = gameObject.engine.getPlugin('input');
        audio = gameObject.getComponent('audioEmitter');
        gameObject.disable();
        gameObject.engine.loadAsset(component.dataFile, function (json) {
            frames = json;
            imgPaths = [];
            soundPaths = [];
            for (var i in json.frames) {
                soundPaths.push(json.frames[i].sound);
                imgPaths.push(json.frames[i].image);
                times.push(json.frames[i].time);
            }
            var imgsLoaded = false;

            //load images
            gameObject.engine.loadAssets(imgPaths, function(imgs) {
                images = imgs;
                imgsLoaded = true;
                
//                if (imgsLoaded && soundLoaded) {
                    gameObject.enable();
//                }
            });
            
        });
    });
};
Plan10.Component.Monologue.alias = "plan10.monologue";
Plan10.Component.Monologue.requires = [
    'audioListener',
    'audioEmitter'
];
