'use strict';

/**
 * Main component for the ship, uses player's input to control the ship, and play sounds
 */
Plan10.Component.ShipController = function(gameObject, component) {
    component.collisionNoise = '';
    component.bombPrefab = null;
    
    //references to other components
    var rigidbody, audio;
    
    //input values
    var inputLeft, inputRight, inputUp, inputDown, inputFire;
        
    component.$on('engine.update', function(deltaTime) {
        //check user input values, and store them
        
        //if user has fired the weapon, instantiate a bomb, and set necessary
        //starting values - make sure it is moved far enough away to not
        //collide with the ship when it's created
        //BUT: don't let the player fire more than one bomb at a time
        /*
        var bomb = gameObject.engine.instantiatePrefab(component.bombPrefab);
        bomb.getComponent('transform2d').position = {
            x: '',
            y: ''
        };
        */
    });
    
    component.$on('box2d.update', function() {
        //based on user-input, set force values on the rigidbody
        //so the physics engine can move the ship properly
    });
    
    component.$on('box2d.collision.enter', function() {
        //use audio component to play collision noise
    });
};
Plan10.Component.ShipController.alias = "plan10.shipController";
Plan10.Component.ShipController.requires = [
    'plan10.shipAnimations'
    ,'plan10.health'
    //,'rigidbody2d',
    //,'audioEmitter'
];
