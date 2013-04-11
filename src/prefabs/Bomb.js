'use strict';

Plan10.Prefab.Bomb = {
    name: "plan10.bomb",
    components: {
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'plan10.projectile': {
            velocity: 100000,
            fireSound: 'assets/kent/fx/FX-laybomb.mp3',
            explosionPrefab: 'plan10.bombExplosion',
            timeToLive: 6000
        },
        'spriteAnimator': {
            animations: {
                'default': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'landmine_idle_0000.png',
                        'landmine_idle_0001.png',
                        'landmine_idle_0002.png',
                        'landmine_idle_0003.png',
                        'landmine_idle_0004.png',
                        'landmine_idle_0005.png',
                        'landmine_idle_0006.png',
                        'landmine_idle_0007.png',
                        'landmine_idle_0008.png',
                        'landmine_idle_0009.png',
                        'landmine_idle_0010.png',
                        'landmine_idle_0011.png',
                        'landmine_idle_0012.png',
                        'landmine_idle_0013.png',
                        'landmine_idle_0014.png',
                        'landmine_idle_0015.png',
                        'landmine_idle_0016.png',
                        'landmine_idle_0017.png',
                        'landmine_idle_0018.png',
                        'landmine_idle_0019.png',
                        'landmine_idle_0020.png',
                        'landmine_idle_0021.png',
                        'landmine_idle_0022.png',
                        'landmine_idle_0023.png',
                        'landmine_idle_0024.png',
                        'landmine_idle_0025.png',
                        'landmine_idle_0026.png',
                        'landmine_idle_0027.png',
                        'landmine_idle_0028.png',
                        'landmine_idle_0029.png'
                    ]
                }
            }
        },
        'rigidbody2d': {
            radius: 15,
            density: 0.0,
            restitution: 0.0,
            friction: 0.0,
            damping: 0.0,
            angularDamping: 0.0
        }
    }
};
