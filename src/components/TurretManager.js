'use strict';

Plan10.Component.TurretManager = function(gameObject, component) {
    //the turret to instantiate
    component.turretPrefab = null;
    
    //how many active turrets can exist at a time
    component.maxTurrets = 5;
    
    //time in ms to delay creating new turrets if not at max
    component.createDelay = 5000;
    component.lastTimeCreated = 0;
    
    //active turrets
    var turrets = [];
    
    component.addTurret = function(turret) {
        //add to turrets
    };
    
    component.removeTurret = function(turret) {
        //remove from turrets
    };
    
    component.$on('engine.update', function(deltaTime) {
        //if enough time has passed and not at max, create a turret somewhere...
        //generally they should come from the same direction, and not be instantiated
        //too close to each other
    });
};
Plan10.Component.TurretManager.alias = 'plan10.turretManager';
