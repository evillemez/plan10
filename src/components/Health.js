'use strict';

/**
 * Controls health and destruction of various objects that have health, and draws health bars that were shamelessly
 * stolen from Grits.  (thanks :) )
 */
Plan10.Component.Health = function(gameObject, component) {
    //default starting values (override from prefab definitions)
    component.maxHealth = 100;
    component.currentHealth = 100;
    component.deathPrefab = null;
    component.collisionDamage = 20;
    
    var transform = gameObject.getComponent('transform2d');
    
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
        if (component.deathPrefab) {
            var go = gameObject.engine.instantiate(component.deathPrefab);
            go.getComponent('transform2d').position = gameObject.getComponent('transform2d').position;
        }

        gameObject.broadcast('health.destruct');
        gameObject.destroy();
    };
    
    component.$on('box2d.collision.enter', function(gameObject) {
        var damage = 0;
        component.applyDamage(component.collisionDamage);
    });
    
    //this mostly taken from grits: src/client/scripts/core/ClientPlayer.js
    //draw health bar
    component.$on('canvas2d.draw', function(context) {
        var x = transform.position.x;
        var y = transform.position.y;
        //Draw health bar
        if (component.currentHealth * 3 / 2 >= component.maxHealth) {
            context.fillStyle = "green";
        } else if (component.currentHealth * 3 >= component.maxHealth) {
            context.fillStyle = "orange";
        } else {
            context.fillStyle = "red";
        }
        context.fillRect(x - 30, y - 40, (60 * component.currentHealth / component.maxHealth), 10);
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.strokeRect(x - 30, y - 40, 60, 10);        
    });
};
Plan10.Component.Health.alias = "plan10.health";
Plan10.Component.Health.requires = [
    'rigidbody2d'
];
