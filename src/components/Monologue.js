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
    var started = false;
    var finished = false;
    
    var monoArray = [];    //eventually use 1 array instead of 3
    var monoLast = 12;     //list of assets - 1
    var monoIndex = (-1);  //init to -1 so that it will increment to start of array upon first loop
    var imgChanged = 0;
    
    var frameDelay = null;    
    var lastTimeDrawn = 0;
    
    var theater_img = null;
    
    var audio;
    
    var audioPaths = [
         'assets/plan10intro/script-01.mp3',
         'assets/plan10intro/script-02.mp3',
         'assets/plan10intro/script-03.mp3',
         'assets/plan10intro/script-04.mp3',
         'assets/plan10intro/script-05.mp3',
         'assets/plan10intro/script-06.mp3',
         'assets/plan10intro/script-07.mp3',
         'assets/plan10intro/script-08.mp3',
         'assets/plan10intro/script-09.mp3',
         'assets/plan10intro/script-10.mp3',
         'assets/plan10intro/script-11.mp3',
         'assets/plan10intro/script-12.mp3',
         'assets/plan10intro/script-13.mp3'
    ]; 

    var imgPaths = [
            'assets/monologue_image/script-01.png',
            'assets/monologue_image/script-02.png',
            'assets/monologue_image/script-03.png',
            'assets/monologue_image/script-04.png',
            'assets/monologue_image/script-05.png',
            'assets/monologue_image/script-06.png',
            'assets/monologue_image/script-07.png',
            'assets/monologue_image/script-08.png',
            'assets/monologue_image/script-09.png',
            'assets/monologue_image/script-10.png',
            'assets/monologue_image/script-11.png',
            'assets/monologue_image/script-12.png',
            'assets/monologue_image/script-13.png'            
    ];    

    var timeArray = [
        15,
        4,
        6,
        12,
        12,
        4,
        10,
        6,
        12,
        8,
        8,
        12,
        3
    ];


    //load a bunch of stuff and start
    component.$on('engine.create', function() {
        gameObject.disable();
        audio = gameObject.getComponent('audioEmitter');

       // gameObject.engine.loadAsset(audioPaths[0], function() {
           //nothing to do!
        //});
        
        gameObject.engine.loadAsset('assets/Theater_Working_Demo.png',function(image) {
            theater_img = image;
        });
        
        gameObject.engine.loadAssets(imgPaths, function(loaded_images) {                
            monoArray = loaded_images;
            gameObject.enable(); 

        });
                
    
    });

    
    //just keep track of state  
    component.$on('engine.update', function(deltaTime) {
        //if starting, set framedelay to length of first frame
        if (started === false) {
            started = true;
            frameDelay = ((timeArray[0])*1000);
        }
        
        console.log("before loop: " + frameDelay);
        //either here, or in the `canvas2d.draw` section, check to figure
        //out when the monologue has finished and set "finished" to true
            if (lastTimeDrawn + frameDelay <= gameObject.engine.time) {
                console.log("In loop: " + frameDelay);
                lastTimeDrawn = gameObject.engine.time;
                
                //use monoIndex to loop through all the arrays.  For now, start over instead of stopping
                if (monoIndex < monoLast) { monoIndex++; }  else { finished = 1; }
                
                //set frameDelay to length of next part of monologue
                frameDelay = ((timeArray[monoIndex]) * 1000); 
                
                //start playing next monologue audio, canvas will draw next image in a second
                audio.playOnce(audioPaths[monoIndex]);
        }
   
        if (finished) {
            //the html page will have a listener on it that shows the
            //splash page with the ('intro', 'play') buttons whenever this
            //event is emitted from the engine
            gameObject.engine.loadScene('plan10.main', function() {
                    gameObject.engine.run();
            });
            
            //gameObject.engine.emit('monologue.finished');
        }


    });
    
    //actually draw the monologue images/text
    component.$on('canvas2d.draw', function(context) {
        //use the canvas directly to draw the images and the text
        context.drawImage(monoArray[monoIndex],0,0,1024,768);
        frameDelay = (timeArray[monoIndex] * 1000); 
    });
};
Plan10.Component.Monologue.alias = "plan10.monologue";
Plan10.Component.Monologue.requires = [
//    'audioListener'
      'audioEmitter'
];
