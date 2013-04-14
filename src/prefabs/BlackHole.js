'use strict';

Plan10.Prefab.BlackHole = {
    name: "plan10.blackHole",
    components: {
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'plan10.projectile': {
            velocity: 100000,
            fireSound: 'assets/kent/fx/FX-laybomb.mp3',
            explosionPrefab: 'plan10.blackHoleDetonation',
            timeToLive: 6000
        },
        'rigidbody2d': {
            radius: 15,
            trigger: true
        },
        'spriteAnimator': {
            animations: {
                'default': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'quad_effect_0000.png',
                        'quad_effect_0001.png',
                        'quad_effect_0002.png',
                        'quad_effect_0003.png',
                        'quad_effect_0004.png',
                        'quad_effect_0005.png',
                        'quad_effect_0006.png',
                        'quad_effect_0007.png',
                        'quad_effect_0008.png',
                        'quad_effect_0009.png',
                        'quad_effect_0010.png',
                        'quad_effect_0011.png',
                        'quad_effect_0012.png',
                        'quad_effect_0013.png',
                        'quad_effect_0014.png',
                        'quad_effect_0015.png'
                    ]
                }
            }
        }
    }
};
