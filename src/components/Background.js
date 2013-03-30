'use strict';

Plan10.Component.Background = function(gameObject, component) {
    
    component.$on('canvas2d.draw', function() {
        //draw the star field by setting a black background and moving a 
        //transparent image w/ starts over it
        
        //draw some part of a planet background that moves as the timer gets
        //closer to zero
        
        //this may be done here, or the earth and background objects may be better done as
        //separate child objects
    });
};
Plan10.Component.Background.alias = 'plan10.background';
