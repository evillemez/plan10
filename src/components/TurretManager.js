'use strict';

/*
 * The turret manager is in charge of instantiating new turrets.
 */
Plan10.Component.TurretManager = function(gameObject, component) {
    //the turret to instantiate
    component.turretPrefab = null;
    
    //how many active turrets can exist at a time
    component.maxTurrets = 4;
    component.spawnY = 150;
    component.spawnX = 800;
    component.soundLowEnergy = false;
    component.soundTurretDamage = false;
    
    //time in ms to delay creating new turrets if not at max
    component.spawnDelay = 3000;

    //active turrets
    var turrets = [];
    var lastTimeCreated = 0;
    var nextOffsetY;
    
    component.addTurret = function(turret) {
        turrets.push(turret);
    };
    
    component.removeTurret = function(turret) {
        var index = turrets.indexOf(turret);
        if (-1 !== index) {
            turrets.splice(turret, 1);
        }
    };
    
    component.spawnTurret = function() {
        if (gameObject.engine.time - lastTimeCreated >= component.spawnDelay) {
            lastTimeCreated = gameObject.engine.time;

            var turret = gameObject.engine.instantiatePrefab(component.turretPrefab);
            var t = turret.getComponent('transform2d');
            t.position.x = component.spawnX;
            t.position.y = nextOffsetY;
            
            turret.getComponent('plan10.turretController').manager = component;
            
            nextOffsetY += component.spawnY;
            if (nextOffsetY >= 600) {
                nextOffsetY = component.spawnY;
            }
        }
    };
    
    component.$on('engine.create', function() {
        nextOffsetY = component.spawnY;
    });
    
    component.$on('engine.update', function(deltaTime) {
        if (turrets.length < component.maxTurrets) {
            component.spawnTurret();
        }
    });
};
Plan10.Component.TurretManager.alias = 'plan10.turretManager';
