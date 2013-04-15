'use strict';

Plan10.Component.TurretController = function(gameObject, component) {
    
    //this is a reference back to the turretManager, the turret manager needs
    //to set it when it instantiates the turrets
    component.manager = null;
    
    component.energyPerShot = 10;
    component.fireRate = 400;       //time in ms between each shot
    component.maxEnergy = 10000;
    component.currentEnergy = 10000;
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
                
                var x = Math.cos(transform.rotation * Javelin.PI_OVER_180) * 30;
                var y = Math.sin(transform.rotation * Javelin.PI_OVER_180) * 30;
                
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
        
        rigidbody.applyForce(component.driftAngle, component.driftForce);
    });
    
    component.$on('engine.create', function() {
        audio = gameObject.getComponent('audioEmitter');
        transform = gameObject.getComponent('transform2d');
        rigidbody = gameObject.getComponent('rigidbody2d');
        //inform manager this has been created
        //component.manager.addTurret(gameObject);
    });
    
    component.$on('engine.destroy', function() {
        
        //inform manager this has been destroyed
        //component.manager.removeTurret(gameObject);
    });
};
Plan10.Component.TurretController.alias = 'plan10.turretController';
Plan10.Component.TurretController.requires = [
    'sprite'
    ,'plan10.health'
    ,'rigidbody2d'
    ,'audioEmitter'
];
