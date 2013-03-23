'use strict';

Plan10.Component.RobotController = function(go, comp) {
    //public
    comp.speed = 10;

    //declare private references
    var transform, input;
    
    //setup, get references to stuff we need
    //and start playing the 'walk' animation
    comp.$on('create', function() {
        transform = go.getComponent('transform2d');
        //input = go.engine.getPlugin('input');
        go.getComponent('spriteAnimator').play('walk');
    });
    
    //move the robot accross the screen a little each frame
    comp.$on('update', function(deltaTime) {
        transform.position.x += comp.speed * deltaTime;
        
        /*
        if (input.getButton('move left')) {
            transform.position.x -= comp.speed * deltaTime;
        }
        
        if (input.getButton('move right')) {
            transform.position.x += comp.speed * deltaTime;
        }
        
        if (input.getButton('move up')) {
            transform.position.y -= comp.speed * deltaTime;
        }
        
        if (input.getButton('move down')) {
            transform.position.y += comp.speed * deltaTime;
        }
        */
    });
};
Plan10.Component.RobotController.alias = "plan10.robot_controller";
Plan10.Component.RobotController.requires = ['plan10.robot_animation'];
