'use strict';

Plan10.Prefab.Laser = {
    name: "plan10.laser",
    components: {
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'plan10.teleport': {},
        'plan10.projectile': {
            damage: 50,
            velocity: 15,
            fireSound: 'assets/kent/fx/FX-pew.mp3',
            explosionPrefab: 'plan10.laserImpact',
            timeToLive: 6000
        },
        'rigidbody2d': {
            height: 3,
            width: 20,
            density: 0.2,
            damping: 0.0,
            angularDamping: 0.0,
            trigger: false
        },
        'spriteAnimator': {
            animations: {
                'default': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'chaingun_projectile_0000.png',
                        'chaingun_projectile_0001.png',
                        'chaingun_projectile_0002.png',
                        'chaingun_projectile_0003.png',
                        'chaingun_projectile_0004.png',
                        'chaingun_projectile_0005.png',
                        'chaingun_projectile_0006.png',
                        'chaingun_projectile_0007.png'
                    ]
                }
            }
        }
    }
};
