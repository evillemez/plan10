'use strict';

Plan10.Prefab.Player = {
    name: "plan10.player",
    components: {
        "plan10.shipAnimations": {},
        "audioEmitter": {},
        "audioListener": {},
        "plan10.shipController": {
            speed: 80
        },
        "plan10.health": {
            
        },
        "transform2d": {
            position: {
                x: 5,
                y: 5
            }
        }
    }
};
