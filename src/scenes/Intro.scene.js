'use strict';

Plan10.Scene.Intro = {
    name: "plan10.intro",
    objects: [
        {
            name: "Monologue",
            components: {
                'plan10.monologue': { 
                    dataFile: 'assets/monologue_intro.json'
                },
                'audioEmitter': {
                    spatial: false
                }
            }
        }
    ]
};
