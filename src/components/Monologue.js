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
    var monoArray = [];
    var monoLast = 12;
    var monoIndex = (-1);  //init to -1 so that it will increment to start of array upon first loop
    var imgChanged = 0;
    var frameDelay = null;    
    var lastTimeDrawn = 0;
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
            'assets/Mario_Pinball.png',
            'assets/Bombette.jpg',
            'assets/dice.png',
            'assets/Mario_Pinball.png',
            'assets/Bombette.jpg',
            'assets/dice.png',
            'assets/Mario_Pinball.png',
            'assets/Bombette.jpg',
            'assets/dice.png',
            'assets/Mario_Pinball.png',
            'assets/Bombette.jpg',
            'assets/dice.png',
            'assets/Mario_Pinball.png'            
    ];    

    var timeArray = [
        14,
        2,
        6,
        12,
        12,
        4,
        10,
        6,
        12,
        8,
        7,
        12,
        3
    ];


    //load a bunch of stuff and start
    component.$on('engine.create', function() {
        gameObject.disable();
        audio = gameObject.getComponent('audioEmitter');

        gameObject.engine.loadAssets(imgPaths, function(loaded_images) {                
            monoArray = loaded_images;
            gameObject.enable(); 

        }
);
                
    
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
                
                //loop through all the arrays.  For now, start over instead of stopping
                if (monoIndex < monoLast) { monoIndex++; }  else { monoIndex = 0; }
                
                //set frameDelay to length of next part of monologue
                frameDelay = ((timeArray[monoIndex]) * 1000); 
                
                //start playing next monologue audio, canvas will draw next image in a second
                audio.playOnce(audioPaths[monoIndex]);
        }
   
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
        context.drawImage(monoArray[monoIndex],500,200,200,200);
       // frameDelay = (timeArray[monoIndex] * 1000); 
    });
};
Plan10.Component.Monologue.alias = "plan10.monologue";
Plan10.Component.Monologue.requires = [
//    'audioListener'
      'audioEmitter'
];
