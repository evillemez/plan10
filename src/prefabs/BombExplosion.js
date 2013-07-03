'use strict';

Plan10.Prefab.BombExplosion = {
    name: "plan10.bombExplosion",
    components: {
        'plan10.detonation': {
            detonationForce: 2000,
            detonationRadius: 150,
            detonationSound: 'assets/kent/fx/FX-bomb.mp3',
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
                        'landmine_explosion_small_0000.png',
                        'landmine_explosion_small_0001.png',
                        'landmine_explosion_small_0002.png',
                        'landmine_explosion_small_0003.png',
                        'landmine_explosion_small_0004.png',
                        'landmine_explosion_small_0005.png',
                        'landmine_explosion_small_0006.png',
                        'landmine_explosion_small_0007.png',
                        'landmine_explosion_small_0008.png',
                        'landmine_explosion_small_0009.png',
                        'landmine_explosion_small_0010.png',
                        'landmine_explosion_small_0011.png',
                        'landmine_explosion_small_0012.png',
                        'landmine_explosion_small_0013.png',
                        'landmine_explosion_small_0014.png',
                        'landmine_explosion_small_0015.png',
                        'landmine_explosion_small_0016.png',
                        'landmine_explosion_small_0017.png',
                        'landmine_explosion_small_0018.png',
                        'landmine_explosion_small_0019.png',
                        'landmine_explosion_small_0020.png',
                        'landmine_explosion_small_0021.png',
                        'landmine_explosion_small_0022.png',
                        'landmine_explosion_small_0023.png',
                        'landmine_explosion_small_0024.png',
                        'landmine_explosion_small_0025.png',
                        'landmine_explosion_small_0026.png',
                        'landmine_explosion_small_0027.png',
                        'landmine_explosion_small_0028.png',
                        'landmine_explosion_small_0029.png',
                    ]
                }
            }
        }
    }
};
