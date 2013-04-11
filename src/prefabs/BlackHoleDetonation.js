'use strict';

Plan10.Prefab.BlackHoleDetonation = {
    name: "plan10.blackHoleDetonation",
    components: {
        'plan10.detonation': {
            detonationForce: 1000,
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
                        'railgun_impact_0000.png',
                        'railgun_impact_0001.png',
                        'railgun_impact_0002.png',
                        'railgun_impact_0003.png',
                        'railgun_impact_0004.png',
                        'railgun_impact_0005.png',
                        'railgun_impact_0006.png',
                        'railgun_impact_0007.png',
                        'railgun_impact_0008.png',
                        'railgun_impact_0009.png',
                        'railgun_impact_0010.png',
                        'railgun_impact_0011.png',
                        'railgun_impact_0012.png',
                        'railgun_impact_0013.png',
                        'railgun_impact_0014.png',
                        'railgun_impact_0015.png',
                        'railgun_impact_0016.png',
                        'railgun_impact_0017.png',
                        'railgun_impact_0018.png',
                        'railgun_impact_0019.png',
                        'railgun_impact_0020.png',
                        'railgun_impact_0021.png',
                        'railgun_impact_0022.png',
                        'railgun_impact_0023.png',
                        'railgun_impact_0024.png',
                        'railgun_impact_0025.png',
                        'railgun_impact_0026.png',
                        'railgun_impact_0027.png',
                        'railgun_impact_0028.png',
                        'railgun_impact_0029.png',
                    ]
                }
            }
        }
    }
};
