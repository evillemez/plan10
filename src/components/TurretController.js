'use strict';

Plan10.Component.TurretController = function(gameObject, component) {
    
    //this is a reference back to the turretManager, the turret manager needs
    //to set it when it instantiates the turrets
    component.manager = null;
    
    component.damagePerShot = 10;
    component.energyPerShot = 10;
    component.fireRate = 400;       //time in ms between each shot
    component.maxEnergy = 10000;
    component.currentEnergy = 10000;
    component.laserPrefab = null;
    
    var target = null;
    var targetHealth = null;
    var audio = null;
    var lastFired = 0;
    
    component.setTarget = function(asteroid) {
        target = asteroid;
        targetHealth = asteroid.getComponent('plan10.health');
        console.log('locked');
    };
    
    component.dropTarget = function() {
        target = null;
        targetHealth = null;
        console.log('dropped');
    };
    
    component.getTarget = function() {
        return target;
    };
    
    component.fire = function() {
        if (gameObject.engine.time - lastFired >= component.fireRate && component.currentEnergy > 0) {
            audio.playOnce('assets/kent/fx/FX-pew.mp3');
            component.currentEnergy -= component.energyPerShot;
            targetHealth.applyDamage(component.damagePerShot);
            lastFired = gameObject.engine.time;
        }
    };
    
    component.$on('engine.update', function(deltaTime) {
        if (target) {
            component.fire();
        }
        
        //stop firing at an asteroid if it has moved out of range
    });
    
    component.$on('engine.create', function() {
        audio = gameObject.getComponent('audioEmitter');
        
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
