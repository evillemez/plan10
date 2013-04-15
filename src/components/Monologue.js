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
    
    var canvas_plugin_lastcall = 0; //tell canvas plugin to clean up before loading next scene
    var canvas_plugin_finished = 0; //when canvas is finished, load next scene
    var loop_breaker           = 0; 
    
    var assetArray = [];   //audioArray;
    var monoArray = [];    //eventually use 1 array instead of 3
    var monoLast = 12;     //list of assets - 1
    var monoIndex = (-1);  //init to -1 so that it will increment to start of array upon first loop
    var imgChanged = 0;
    
    var frameDelay = null;    
    var lastTimeDrawn = 0;
    
    var theater_img = null;
    
    var audio;
    
    var audioPaths = [
         'assets/monologue_sound/script-01.mp3',
         'assets/monologue_sound/script-02.mp3',
         'assets/monologue_sound/script-03.mp3',
         'assets/monologue_sound/script-04.mp3',
         'assets/monologue_sound/script-05.mp3',
         'assets/monologue_sound/script-06.mp3',
         'assets/monologue_sound/script-07.mp3',
         'assets/monologue_sound/script-08.mp3',
         'assets/monologue_sound/script-09.mp3',
         'assets/monologue_sound/script-10.mp3',
         'assets/monologue_sound/script-11.mp3',
         'assets/monologue_sound/script-12.mp3',
         'assets/monologue_sound/script-13.mp3'
      ];
   
   
    var assetPaths = [
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
        12
    ];


    //load a bunch of stuff and start
    component.$on('engine.create', function() {
        gameObject.disable();
        audio = gameObject.getComponent('audioEmitter');

        gameObject.engine.loadAssets(assetPaths, function(loaded_assets) {
            monoArray = loaded_assets;   
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
        
  
        //either here, or in the `canvas2d.draw` section, check to figure
        //out when the monologue has finished and set "finished" to true
            if (lastTimeDrawn + frameDelay <= gameObject.engine.time) {       
                lastTimeDrawn = gameObject.engine.time;
                
                //log some stuff
                console.log("monoindex: " + monoIndex);
                console.log("canvas_plugin_lastcall: " + canvas_plugin_lastcall);
                console.log("canvas_plugin_finished: " + canvas_plugin_finished);

            if ( (!(canvas_plugin_finished)) && (!(canvas_plugin_lastcall)) ){     
                
                //use monoIndex to loop through all the assets and keep them in sync.
                if (monoIndex === (monoLast)) { canvas_plugin_lastcall = 1; loop_breaker = 1; }
                if (monoIndex < monoLast) {  monoIndex++; }  
                
                
                //set frameDelay to length of next part of monologue
                frameDelay = ((timeArray[monoIndex]) * 1000); 
                
                //start playing next monologue audio, canvas will draw next image in a second
                // added "loop_breaker" because the game still plays the audio file even though I can tell Canvas to stop drawing
                // this leads to the canvas clearing, but the final audio playing 1 more time before the next scene loads
                // not sure why
                  if (!(loop_breaker)) { 
                  
                  audio.playOnce(audioPaths[monoIndex]);
                  //audio.stopSound(assetPaths[monoIndex]);
                
                  }
                  
            
            }
            
            else {
            console.log("I think I got it");
           // gameObject.engine.loadScene('plan10.main', function() {
           //         gameObject.engine.run();
           // });
             gameObject.emit('plan10.splash_screen');
            }
        } 
   

    });
    
    //actually draw the monologue images/text
    component.$on('canvas2d.draw', function(context) {
         context.drawImage(monoArray[monoIndex],0,0,800,600);
         frameDelay = (timeArray[monoIndex] * 1000);               
         
         if (canvas_plugin_lastcall) {
              canvas_plugin_finished = 1;
              context.clearRect(0, 0, 800, 600);
         }
    
         
    });
};
Plan10.Component.Monologue.alias = "plan10.monologue";
Plan10.Component.Monologue.requires = [
//    'audioListener'
      'audioEmitter'
];
