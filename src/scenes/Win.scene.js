'use strict';

Plan10.Scene.Win = {
    name: "plan10.win_ending",
    objects: [
        {
            name: "Monologue",
            components: {
                'plan10.monologue': {
                    dataFile: 'assets/monologue_win.json'
                },
                'audioEmitter': {
                    spatial: false
                }                
            }
        }
    ]
};
