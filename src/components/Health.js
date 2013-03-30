'use strict';

/**
 * Controls health and destruction of various objects
 */
Plan10.Component.Health = function(gameObject, component) {
    //default starting values (override from prefab definitions)
    component.maxHealth = 100;
    component.currentHealth = 100;
    component.deathPrefab = null;
    
    //API for other components to use
    component.applyDamage = function(damage) {
        //subtract from current health
    };
    
    component.applyHealth = function(health) {
        //add to current, but no more than max
    };
    
    component.$on('engine.update', function(deltaTime) {
        //if health is <= 0:
        // - instantiate the deathPrefab, and set the transform position equal to this gameObject's transform.position
        // - destroy this game object (gameObject.destroy();)
    });
    
    component.$on('box2d.collision.enter', function() {
        //if there's a collision, apply damage
        //based on the force of the impact
    });
};
Plan10.Component.Health.alias = "plan10.health";
Plan10.Component.Health.requires = [
    'transform2d'
    //,'rigidbody2d'
];
