'use strict';

Plan10.Prefab.Asteroid = {
    name: 'plan10.asteroid',
    components: {
        'plan10.asteroid': {},
        'plan10.health': {
            maxHealth: 500
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
            density: 1,
            dampening: 0.8
        }
    }
};
