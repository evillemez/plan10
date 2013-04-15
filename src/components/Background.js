'use strict';

Plan10.Component.Background = function(gameObject, component) {
    
//Variable declarations    
var stars = null;
var backgroundColor = 'black'; 
var draw_start_x = 0;
var draw_start_y = 0;
var scrollDelay = 0;
var lastTimeDrawn = 0;
 
    
     component.$on('engine.create', function() {
        gameObject.disable();

        gameObject.engine.loadAsset('assets/starfield.png',function(image) {
            stars = image;
            gameObject.enable(); 
        });
        
      //end of engine create
      });

 component.$on('engine.update', function(deltaTime) {
                
                if (lastTimeDrawn + scrollDelay <= gameObject.engine.time) {       
                lastTimeDrawn = gameObject.engine.time;
                //console.log("My God, it's full of stars!");

                }
              
 });
    
    
    component.$on('canvas2d.draw', function(context) {
        //draw the star field by setting a black background and moving a 
        //transparent image w/ starts over it
//        console.log("y before: " + draw_start_y);
        context.fillStyle = backgroundColor;
        context.fillRect(0,0,800,600);
        context.drawImage(stars,draw_start_x,draw_start_y,800,600);
        context.drawImage(stars, draw_start_x, (600 - Math.abs(draw_start_y)), 800, 600);
        
               
        if (Math.abs(draw_start_y) > 600) {
             draw_start_y = 0;
        }
 
         draw_start_y -= 2;
//         console.log("y after: " + draw_start_y);
        


        //draw some part of a planet background that moves as the timer gets
        //closer to zero
        
        //this may be done here, or the earth and background objects may be better done as
        //separate child objects
    });
};
Plan10.Component.Background.alias = 'plan10.background';
