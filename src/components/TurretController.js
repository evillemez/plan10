'use strict';

/**
 * Controls firing at asteroid targets, if a target is present.  Also controls energy
 * bars that were shamelessly ripped from Grits.
 */
Plan10.Component.TurretController = function(gameObject, component) {
    
    //this is a reference back to the turretManager, the turret manager needs
    //to set it when it instantiates the turrets
    component.manager = null;
    
    component.energyPerShot = 10;
    component.fireRate = 400;       //time in ms between each shot
    component.maxEnergy = 100;
    component.currentEnergy = 100;
    component.laserPrefab = null;
    component.driftForce = 10000;
    component.driftAngle = 180;
    
    var target = null;
    var targetHealth = null;
    var audio = null;
    var lastFired = 0;
    var transform = null;
    var rigidbody;
    
    component.setTarget = function(asteroid) {
        target = asteroid;
        targetHealth = asteroid.getComponent('plan10.health');
    };
    
    component.dropTarget = function() {
        target = null;
        targetHealth = null;
    };
    
    component.getTarget = function() {
        return target;
    };
    
    component.lookAt = function(x, y) {
        var dy = transform.position.y - y;
        var dx = transform.position.x - x;
        var angle = Math.atan2(dy, dx) * Javelin._180_OVER_PI;
        
        //technically I'm looking -away- to make the images look right
        transform.rotation = angle + 180 % 360;
    };
    
    component.fire = function() {
        if (gameObject.engine.time - lastFired >= component.fireRate && component.currentEnergy > 0) {
            component.currentEnergy -= component.energyPerShot;
            lastFired = gameObject.engine.time;
            
            if (this.laserPrefab) {
                var laser = gameObject.engine.instantiatePrefab(component.laserPrefab);
                var lt = laser.getComponent('transform2d');
                lt.rotation = transform.rotation;
                
                var x = Math.cos(transform.rotation * Javelin.PI_OVER_180) * 40;
                var y = Math.sin(transform.rotation * Javelin.PI_OVER_180) * 40;
                
                lt.position.x = transform.position.x + x;
                lt.position.y = transform.position.y + y;
            }
        }
    };
    
    component.$on('engine.update', function(deltaTime) {
        if (target) {
            var pos = target.getComponent('transform2d').position;
            component.lookAt(pos.x, pos.y);
            component.fire();
        }
        
        //destroy if out of energy
        if (component.currentEnergy <= 0) {
            gameObject.destroy();
        }
        
        //destroy if out of bounds
        if (
            (transform.position.x > 900 || transform.position.x < -100) ||
            (transform.position.y > 700 || transform.position.x < -100)
        ) {
            gameObject.destroy();
        }
        
        //check for low energy sound
        if (component.manager && component.currentEnergy <= 0 && !component.manager.soundLowEnergy) {
            component.manager.soundLowEnergy = true;
            audio.playOnce('assets/kent/script-limited-energy.mp3');
        }
        
        rigidbody.applyForce(component.driftAngle, component.driftForce);
    });
    
    component.$on('box2d.collision.enter', function(gameObject) {
        if (component.manager && !component.manager.soundTurretDamage) {
            component.manager.soundTurretDamage = true;
            audio.playOnce('assets/kent/script-turretdamage.mp3');
        }
    });
    
    component.$on('engine.create', function() {
        audio = gameObject.getComponent('audioEmitter');
        transform = gameObject.getComponent('transform2d');
        rigidbody = gameObject.getComponent('rigidbody2d');

        //inform manager this has been created
        if (component.manager) {
            component.manager.addTurret(gameObject);
        }
    });
    
    component.$on('engine.destroy', function() {
        //inform manager this is being destroyed
        if (component.manager) {
            component.manager.removeTurret(gameObject);
        }
    });
    
    //this mostly taken from grits: src/client/scripts/core/ClientPlayer.js
    //draw energy bar
    component.$on('canvas2d.draw', function(context) {
        var x = transform.position.x;
        var y = transform.position.y;

        if (component.currentEnergy * 3 / 2 >= component.maxEnergy) {
            context.fillStyle = "aqua";
        } else if (component.currentEnergy * 3 >= component.maxEnergy) {
            context.fillStyle = "blue";
        } else {
            context.fillStyle = "darkblue";
        }
        context.fillRect(x - 30, y - 30, (60 * component.currentEnergy / component.maxEnergy), 10);
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.strokeRect(x - 30, y - 30, 60, 10);
    });
};
Plan10.Component.TurretController.alias = 'plan10.turretController';
Plan10.Component.TurretController.requires = [
    'sprite'
    ,'plan10.health'
    ,'rigidbody2d'
    ,'audioEmitter'
];
