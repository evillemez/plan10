'use strict';

/**
 * Asteroid registers/unregisters its self with the manager
 */
Plan10.Component.Asteroid = function(gameObject, component) {
    //the asteroid manager needs to set this
    component.manager = null;
    component.killer = false;
    component.number = 1;
};
Plan10.Component.Asteroid.alias = 'plan10.asteroid';
Plan10.Component.Asteroid.requires = [
    'sprite'
    ,'plan10.health'
    ,'rigidbody2d'
];
