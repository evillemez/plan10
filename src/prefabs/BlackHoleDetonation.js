'use strict';

Plan10.Prefab.BlackHoleDetonation = {
    name: "plan10.blackHoleDetonation",
    components: {
        'plan10.detonation': {
            detonationForce: 200,
            detonationRadius: 150,
            detonationSound: 'assets/kent/fx/FX-blackhole.mp3',
            implode: true
        },
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'spriteAnimator': {
            animations: {
                'explode': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'spawner_black_activate_0000.png',
                        'spawner_black_activate_0001.png',
                        'spawner_black_activate_0002.png',
                        'spawner_black_activate_0003.png',
                        'spawner_black_activate_0004.png',
                        'spawner_black_activate_0005.png',
                        'spawner_black_activate_0006.png',
                        'spawner_black_activate_0007.png',
                        'spawner_black_activate_0008.png',
                        'spawner_black_activate_0009.png',
                        'spawner_black_activate_0010.png',
                        'spawner_black_activate_0011.png',
                        'spawner_black_activate_0012.png',
                        'spawner_black_activate_0013.png',
                        'spawner_black_activate_0014.png',
                        'spawner_black_activate_0015.png',
                        'spawner_black_activate_0015.png',
                        'spawner_black_activate_0014.png',
                        'spawner_black_activate_0013.png',
                        'spawner_black_activate_0012.png',
                        'spawner_black_activate_0011.png',
                        'spawner_black_activate_0010.png',
                        'spawner_black_activate_0009.png',
                        'spawner_black_activate_0008.png',
                        'spawner_black_activate_0007.png',
                        'spawner_black_activate_0006.png',
                        'spawner_black_activate_0005.png',
                        'spawner_black_activate_0004.png',
                        'spawner_black_activate_0003.png',
                        'spawner_black_activate_0002.png',
                        'spawner_black_activate_0001.png',
                        'spawner_black_activate_0000.png',
                    ]
                }
            }
        }
    }
};
