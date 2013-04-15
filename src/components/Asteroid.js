'use strict';

/**
 * Asteroid triggers the win ending if it's destroyed.
 */
Plan10.Component.Asteroid = function(gameObject, component) {
    var engine = null;
    
    component.$on('engine.create', function() {
        engine = gameObject.engine;
    });
    
    component.$on('engine.destroy', function() {
        setTimeout(function() {
            engine.loadScene('plan10.win_ending');
        }, 5000);
    });
};
Plan10.Component.Asteroid.alias = 'plan10.asteroid';
Plan10.Component.Asteroid.requires = [
    'sprite'
    ,'plan10.health'
    ,'rigidbody2d'
];
