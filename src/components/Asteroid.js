'use strict';

/**
 * Asteroid registers/unregisters its self with the manager
 */
Plan10.Component.Asteroid = function(gameObject, component) {
    
    component.$on('engine.destroy', function() {
        gameObject.engine.loadScene('plan10.win_ending');
    });
    
};
Plan10.Component.Asteroid.alias = 'plan10.asteroid';
Plan10.Component.Asteroid.requires = [
    'sprite'
    ,'plan10.health'
    ,'rigidbody2d'
];
