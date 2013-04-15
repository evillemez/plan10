'use strict';

Plan10.Scene.Lose = {
    name: "plan10.lose_ending",
    objects: [
        {
            name: "Monologue",
            components: {
                'plan10.monologue': {
                    dataFile: 'assets/monologue_lose.json'
                },
                'audioEmitter': {
                    spatial: false
                }
            }
        }
    ]
};
