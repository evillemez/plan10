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
    
    component.$on('engine.update', function(deltaTime) {
        //float around or something
        
        //stop firing at an asteroid if it has moved out of range
    });
    
    component.$on('box2d.trigger.enter', function() {
        //fire at the turret and drain energy accordingly
    });
    
    component.$on('engine.create', function() {
        //set sprite
        
        //inform manager this has been created
        component.manager.addTurret(gameObject);
    });
    
    component.$on('engine.destroy', function() {
        
        //inform manager this has been destroyed
        component.manager.removeTurret(gameObject);
    });
};
Plan10.Component.TurretController.alias = 'plan10.turretController';
Plan10.Component.TurretController.requires = [
    'sprite'
    ,'plan10.health'
    //,'rigidbody2d'
    //,'audioEmitter'
];
