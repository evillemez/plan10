'use strict';

Plan10.Prefab.LaserImpact = {
    name: "plan10.laserImpact",
    components: {
        'plan10.detonation': {
            detonationSound: 'assets/kent/fx/FX-bomb.mp3',
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
                        'chaingun_impact_0000.png',
                        'chaingun_impact_0001.png',
                        'chaingun_impact_0002.png',
                        'chaingun_impact_0003.png',
                        'chaingun_impact_0004.png',
                        'chaingun_impact_0005.png',
                        'chaingun_impact_0006.png',
                        'chaingun_impact_0007.png',
                        'chaingun_impact_0008.png',
                        'chaingun_impact_0009.png',
                        'chaingun_impact_0010.png',
                        'chaingun_impact_0011.png',
                        'chaingun_impact_0012.png',
                        'chaingun_impact_0013.png',
                        'chaingun_impact_0014.png',
                        'chaingun_impact_0015.png',
                        'chaingun_impact_0016.png',
                        'chaingun_impact_0017.png',
                        'chaingun_impact_0018.png',
                        'chaingun_impact_0019.png',
                        'chaingun_impact_0020.png',
                        'chaingun_impact_0021.png',
                        'chaingun_impact_0022.png',
                        'chaingun_impact_0023.png',
                        'chaingun_impact_0024.png',
                        'chaingun_impact_0025.png',
                        'chaingun_impact_0026.png',
                        'chaingun_impact_0027.png',
                        'chaingun_impact_0028.png',
                        'chaingun_impact_0029.png',
                    ]
                }
            }
        }
    }
};
