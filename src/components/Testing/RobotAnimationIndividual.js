'use strict';

Plan10.Component.RobotAnimationIndividual = function(gameObject, component) {
    var transform;
    
    //define animations on create
    component.$on('engine.create', function() {
        //disable until we know we've loaded & defined the animations needed
        gameObject.disable();
        var animator = gameObject.getComponent('spriteAnimator');
        
        var paths = [
            'assets/grits/robot/robowalk00.png',
            'assets/grits/robot/robowalk01.png',
            'assets/grits/robot/robowalk02.png',
            'assets/grits/robot/robowalk03.png',
            'assets/grits/robot/robowalk04.png',
            'assets/grits/robot/robowalk05.png',
            'assets/grits/robot/robowalk06.png',
            'assets/grits/robot/robowalk07.png',
            'assets/grits/robot/robowalk08.png',
            'assets/grits/robot/robowalk09.png',
            'assets/grits/robot/robowalk10.png',
            'assets/grits/robot/robowalk11.png',
            'assets/grits/robot/robowalk12.png',
            'assets/grits/robot/robowalk13.png',
            'assets/grits/robot/robowalk14.png',
            'assets/grits/robot/robowalk15.png',
            'assets/grits/robot/robowalk16.png',
            'assets/grits/robot/robowalk17.png',
            'assets/grits/robot/robowalk18.png'
        ];
        
        //load assets on start
        gameObject.engine.loadAssets(paths, function(images) {
            
            //walk animation
            animator.define('walk', images);
            
            //activate
            gameObject.enable();
        });
    });
        
};
Plan10.Component.RobotAnimationIndividual.alias = "plan10.robotAnimationIndividual";
Plan10.Component.RobotAnimationIndividual.requires = ['spriteAnimator'];
