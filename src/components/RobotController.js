'use strict';

Plan10.Component.RobotController = function(gameObject, component) {
    //public
    component.speed = 10;

    //declare private references
    var transform, input, sprite;
    
    //setup, get references to stuff we need
    //and start playing the 'walk' animation
    component.$on('engine.create', function() {
        transform = gameObject.getComponent('transform2d');
        sprite = gameObject.getComponent('sprite');
        
        input = gameObject.engine.getPlugin('input');
        gameObject.getComponent('spriteAnimator').play('walk');
    });
    
    //move the robot accross the screen a little each frame
    component.$on('engine.update', function(deltaTime) {
        
        //gradually shrink it
        sprite.scale.x -= 0.005;
        sprite.scale.y -= 0.005;
        
        if (input.getButton('move left')) {
            transform.rotate(-5);
        }
        
        if (input.getButton('move right')) {
            transform.rotate(5);
        }
        
        if (input.getButton('move up')) {
            transform.translate(0.0, component.speed * deltaTime);
        }
        
        if (input.getButton('move down')) {
            transform.translate(0.0, component.speed * -deltaTime);
        }
        
        if (input.getButton('fire')) {
            console.log("FIRING!!!!");
        }
    });
};
Plan10.Component.RobotController.alias = "plan10.robot_controller";
Plan10.Component.RobotController.requires = ['plan10.robot_animation'];
