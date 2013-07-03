'use strict';

Plan10.Prefab.Player = {
    name: "plan10.player",
    layer: 'default',
    components: {
        'audioListener': {},
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'plan10.shipController': {
            bombPrefab: 'plan10.bomb',
            blackHolePrefab: 'plan10.blackHole',
            thrustForce: 30,
            rotationForce: 200,
            fireDelay: 500,
            detonateDelay: 500,
            thrustSound: 'assets/kent/fx/FX-thruster.mp3'
        },
        'plan10.teleport': {},
        'sprite': {
            imagePath: 'assets/ship.png'
        },
        'plan10.health': {
            maxHealth: 400,
            currentHealth: 400,
            collisionDamage: 50,
            deathPrefab: 'plan10.shipExplosion'
        },
        'rigidbody2d': {
            radius: 40,
            density: 0.5,
            restitution: 0.4,
            friction: 0.5,
            damping: 0.8,
            angularDamping: 0.6
        },
        'transform2d': {
            position: {
                x: 100,
                y: 300
            }
        }
    }
};
