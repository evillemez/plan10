'use strict';

Plan10.Prefab.Turret = {
    name: "plan10.turret",
    components: {
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'sprite': {
            atlasPath: 'assets/grits/grits_effects.atlas.json',
            imagePath: 'turret.png'
        },
        'plan10.health': {
            maxHealth: 200,
            currentHealth: 200,
            collisionDamage: 50,
            deathPrefab: 'plan10.bombExplosion'
        },
        'plan10.turretController': {
            energyPerShot: 10,
            maxEnergy: 100,
            currentEnergy: 100,
            fireRate: 500,
            laserPrefab: 'plan10.laser',
            driftForce: 100000,
            driftAngle: 180
        },
        'rigidbody2d': {
            radius: 20,
            density: 1.0,
            restitution: 0.0,
            friction: 0.0,
            damping: 1,
            angularDamping: 0.2,
            fixedRotation: true
        }
    },
    children: [
        {
            name: 'sensor',
            components: {
                'plan10.proximitySensor': {
                    
                },
                'rigidbody2d': {
                    radius: 100, //radius for the proximity sensor
                    trigger: true
                }
            }
        }
    ]
};
