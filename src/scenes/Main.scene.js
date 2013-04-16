'use strict';

Plan10.Scene.Main = {
    name: "plan10.main",
    objects: [
        'plan10.player',            //in src/prefabs/Player.js
        'plan10.turretManager',     //in src/prefabs/TurretManager.js
        {
            fromPrefab: 'plan10.asteroid',
            components: {
                'transform2d': {
                    position: {
                        x: 300,
                        y: 300
                    }
                }
            }
        },
        {
            name: 'background',
            layer: 'background',
            components: { 'plan10.background': {} }
        },
        {
            name: 'timer',
            components: { 
                'plan10.timer': {
                    totalTime: 300
                }
            }
        }
    ]
};
