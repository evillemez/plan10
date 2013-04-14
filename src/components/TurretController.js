'use strict';

Plan10.Component.TurretController = function(gameObject, component) {
    
    //this is a reference back to the turretManager, the turret manager needs
    //to set it when it instantiates the turrets
    component.manager = null;
    
    component.range = 250;
    component.damagePerSecond = 10;
    component.energyPerSecond = 10;
    component.maxEnergy = 100;
    component.currentEnergy = 100;
    component.laserPrefab = null;
    
    var target = null;
    var audio = null;
    
    component.setTarget = function(asteroid) {
        target = asteroid;
        console.log("GOT TARGET!");
    };
    
    component.dropTarget = function() {
        target = null;
        console.log("LOST TARGET!");
    };
    
    component.getTarget = function() {
        return target;
    };
    
    component.$on('engine.update', function(deltaTime) {
        if (target && component.currentEnergy > 0) {
            audio.playLoop('assets/kent/fx/FX-laser.mp3');
            component.currentEnergy -= component.energyPerSecond;
        } else {
            audio.stopSound('assets/kent/fx/FX-laser.mp3');
        }
        
        //stop firing at an asteroid if it has moved out of range
    });
    
    component.$on('box2d.trigger.enter', function(gameObject) {
        if (!target) {
            if (gameObject.hasComponent('asteroid')) {
                target = gameObject;
                gameObject.on('health.destroy', function() {
                    target = null;
                });
            }
        }
    });
    
    component.$on('box2d.trigger.exit', function(gameObject) {
        if (target && gameObject === target) {
            target = null;
        }
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
