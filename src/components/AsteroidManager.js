'use strict';

/**
 * AsteroidManager will take care of instantiating two smaller asteroids when an asteroid is destroyed.
 * It also needs to keep track of whether or not the biggest asteroids have been destroyed enough
 * to "win" the game.  If so, it needs to load the 'win' scene.
 */
Plan10.Component.AsteroidManager = function(gameObject, component) {
    component.asteroidPrefab = null;
    
    //instantiated asteroids
    var asteroids = [];
    var won = false;
    
    component.addAsteroid = function(gameObject) {
        //store in asteroids array
    };
    
    component.removeAsteroid = function(gameObject) {
        
    };
    
    component.$on('engine.update', function(deltaTime) {
        if (won) {
            gameObject.engine.loadScene('plan10.win_ending');
        }
    });
    
};
Plan10.Component.AsteroidManager.alias = 'plan10.asteroidManager';
