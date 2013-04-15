'use strict';

Plan10.Prefab.ShipExplosion = {
    name: "plan10.shipExplosion",
    components: {
        'plan10.detonation': {
            detonationForce: 9999000,
            detonationRadius: 150,
            detonationSound: 'assets/kent/fx/FX-shipblow.mp3',
            implode: false
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
                        'landmine_explosion_large_0000.png',
                        'landmine_explosion_large_0001.png',
                        'landmine_explosion_large_0002.png',
                        'landmine_explosion_large_0003.png',
                        'landmine_explosion_large_0004.png',
                        'landmine_explosion_large_0005.png',
                        'landmine_explosion_large_0006.png',
                        'landmine_explosion_large_0007.png',
                        'landmine_explosion_large_0008.png',
                        'landmine_explosion_large_0009.png',
                        'landmine_explosion_large_0010.png',
                        'landmine_explosion_large_0011.png',
                        'landmine_explosion_large_0012.png',
                        'landmine_explosion_large_0013.png',
                        'landmine_explosion_large_0014.png',
                        'landmine_explosion_large_0015.png',
                        'landmine_explosion_large_0016.png',
                        'landmine_explosion_large_0017.png',
                        'landmine_explosion_large_0018.png',
                        'landmine_explosion_large_0019.png',
                        'landmine_explosion_large_0020.png',
                        'landmine_explosion_large_0021.png',
                        'landmine_explosion_large_0022.png',
                        'landmine_explosion_large_0023.png',
                        'landmine_explosion_large_0024.png',
                        'landmine_explosion_large_0025.png',
                        'landmine_explosion_large_0026.png',
                        'landmine_explosion_large_0027.png',
                        'landmine_explosion_large_0028.png',
                        'landmine_explosion_large_0029.png',
                    ]
                }
            }
        }
    }
};
