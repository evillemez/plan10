'use strict';

/**
 * Asteroid registers/unregisters its self with the manager
 */
Plan10.Component.Asteroid = function(gameObject, component) {
    //the asteroid manager needs to set this
    component.manager = null;
    
    var audio, sprite;
    
    component.$on('engine.create', function() {
        sprite = gameObject.getComponent('sprite');
        audio = gameObject.getComponent('audioEmitter');
        
        //set sprite image
        
        //register w/ manager
        component.manager.addAsteroid(gameObject);
    });
    
    component.$on('engine.destroy', function() {
        
        //unregister w/ manager
        component.manager.removeAsteroid(gameObject);
    });
    
    component.$on('box2d.collision.enter', function() {
        //play collision noise
    });
};
Plan10.Component.Asteroid.alias = 'plan10.asteroid';
Plan10.Component.Asteroid.requires = [
    'sprite'
    ,'plan10.health'
    //,'rigidbody2d'
    //,'audioEmitter'
];
