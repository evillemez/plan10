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
    var finished = false;
    var mario = [];
    var luigi = 2;
    var imgIndex = (-1);
    var frameDelay = 5000;    
    var imgChanged = null;
    var lastTimeDrawn = 0;
    var imageChanged = false;
    var audio;
    
    var audioPaths = [
         'assets/plan 10 script01.mp3',
         'assets/plan 10 script07.mp3',
         'assets/plan 10 script23.mp3'
    ]; 

    var imgPaths = [
            'assets/Mario_Pinball.png',
            'assets/Bombette.jpg',
            'assets/dice.png'
    ];    

    var timeArray = [
        16,
        12,
        13
    ];

frameDelay = timeArray[0];


    //load a bunch of stuff and start
    component.$on('engine.create', function() {
        gameObject.disable();
        audio = gameObject.getComponent('audioEmitter');

        gameObject.engine.loadAssets(imgPaths, function(loaded_images) {                
          console.log("hi");
          console.log(loaded_images);
          mario = loaded_images;
          luigi = 2;
          gameObject.enable(); 

        }
);
                
    
    });

    
    //just keep track of state  
    component.$on('engine.update', function(deltaTime) {
        
        //either here, or in the `canvas2d.draw` section, check to figure
        //out when the monologue has finished and set "finished" to true
            if (lastTimeDrawn + frameDelay <= gameObject.engine.time) {
                lastTimeDrawn = gameObject.engine.time;
//                console.log(imgIndex);
//                console.log("fd" + frameDelay);
//                console.log("tA" + timeArray[imgIndex]);
            if (imgIndex < luigi) { imgIndex++; }  else { imgIndex = 0; }
                audio.playOnce(audioPaths[imgIndex]);
        }
   
        if (finished) {
            //the html page will have a listener on it that shows the
            //splash page with the ('intro', 'play') buttons whenever this
            //event is emitted from the engine

            //gameObject.engine.emit('monologue.finished');
        }

        // if ((timeArray[imgIndex] === 1) && imageChanged === false) { audio.playOnce('/assets/Zarathustra.mp3');}


    });
    
    //actually draw the monologue images/text
    component.$on('canvas2d.draw', function(context) {
        //use the canvas directly to draw the images and the text
        //context.drawimage()
  //      audio.playOnce(audioPaths[imgIndex]);
//audio.playOnce('/assets/Zarathustra.mp3');
        context.drawImage(mario[imgIndex],500,200,200,200);
        frameDelay = (timeArray[imgIndex] * 1000);
       // imageChanged=true;
  
    });
};
Plan10.Component.Monologue.alias = "plan10.monologue";
Plan10.Component.Monologue.requires = [
//    'audioListener'
      'audioEmitter'
];
