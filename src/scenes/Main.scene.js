'use strict';

Plan10.Scene.Main = {
    name: "plan10.main",
    objects: [
        'plan10.player',
        {
            fromPrefab: 'plan10.turret',
            components: {
                'transform2d': {
                    position: {
                        x: 500,
                        y: 300
                    }
                }
            }
        },
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
            name: 'timer',
            components: { 'plan10.timer': {}}
        }
//        ,'plan10.turretManager'
//        ,'plan10.asteroidManager'
//        ,'plan10.background'
//        ,'plan10.filmgrain'
//        ,'plan10.timer'
    ]
};
