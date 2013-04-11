'use strict';

/**
 * Controls health and destruction of various objects
 */
Plan10.Component.Health = function(gameObject, component) {
    //default starting values (override from prefab definitions)
    component.maxHealth = 100;
    component.currentHealth = 100;
    component.deathPrefab = null;
    
    component.applyDamage = function(damage) {
        component.currentHealth -= damage;
        if (component.currentHealth <= 0) {
            component.destroy();
        }
    };
    
    component.applyHealth = function(health) {
        component.currentHealth += health;
        if (component.currentHealth > component.maxHealth) {
            component.currentHealth = component.maxHealth;
        }
    };
    
    component.destroy = function() {
        gameObject.broadcast('health.destruct');

        if (component.deathPrefab) {
            var go = gameObject.engine.instantiate(component.deathPrefab);
            go.getComponent('transform2d').position = gameObject.getComponent('transform2d').position;
        }

        gameObject.destroy();
    };
    
    component.$on('box2d.collision.enter', function() {
        //if there's a collision, apply damage
        //based on the force of the impact
    });
};
Plan10.Component.Health.alias = "plan10.health";
Plan10.Component.Health.requires = [
    'rigidbody2d'
];
