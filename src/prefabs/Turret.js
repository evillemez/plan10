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
            deathPrefab: 'plan10.bombExplosion'
        },
        'plan10.turretController': {
            
        },
        'rigidbody2d': {
            radius: 20,
            density: 1.0,
            restitution: 0.0,
            friction: 0.0,
            damping: 1,
            angularDamping: 0.2
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
