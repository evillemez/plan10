'use strict';

Plan10.Scene.Main = {
    name: "plan10.main",
    objects: [
        'plan10.player',
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
