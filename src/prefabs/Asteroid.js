'use strict';

Plan10.Prefab.Asteroid = {
    name: 'plan10.asteroid',
    components: {
        'plan10.asteroid': {},
        'plan10.teleport': {},
        'plan10.health': {
            maxHealth: 2000,
            currentHealth: 2000,
            collisionDamage: 10,
            deathPrefab: 'plan10.shipExplosion'
        },
        'sprite': {
            imagePath: 'assets/asteroid.png',
            scale: {
                x: 0.6,
                y: 0.6
            }
        },
        'rigidbody2d': {
            height: 100,
            width: 60,
            density: 0.5,
            dampening: 0.8
        }
    }
};
