'use strict';

/**
 * Defines the various ship animations - copy and rename for other objects that need animations:
 *      - explosions
 */
Plan10.Component.ShipAnimations = function(gameObject, component) {
    
    component.$on('engine.create', function() {
        //disable until we know we've loaded & defined the animations needed
        gameObject.disable();
        var animator = gameObject.getComponent('spriteAnimator');
        
        //define all the image paths to load
        var paths = [
            'assets/path/to/image.png',
            'assets/path/to/image.png',
            'assets/path/to/image.png'
        ];

        //load assets on start
        gameObject.engine.loadAssets(paths, function(images) {
            
            //first animation
            animator.define('animation1', [
                images['assets/path/to/image.png'],
                images['assets/path/to/image.png'],
                images['assets/path/to/image.png']
            ]);
            
            //second animation
            animator.define('animation2', [
                images['assets/path/to/image.png'],
                images['assets/path/to/image.png'],
                images['assets/path/to/image.png']
            ]);
            
            //activate
            gameObject.enable();
        });
    });
};
Plan10.Component.ShipAnimations.alias = "plan10.shipAnimations";
Plan10.Component.ShipAnimations.requires = ['spriteAnimator'];
