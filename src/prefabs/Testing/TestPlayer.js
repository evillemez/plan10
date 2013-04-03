'use strict';

Plan10.Prefab.TestPlayer = {
    name: "plan10.testPlayer",
    components: {
        "plan10.testPlayerController": {},
        "audioEmitter": {
            spatial: false
        },
        "audioListener": {}, //this isn't really needed since spatial audio isn't implemented
        'transform2d': {
            position: {
                x: 300,
                y: 300
            }
        }
    }
};
