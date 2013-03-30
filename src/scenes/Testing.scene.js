'use strict';

Plan10.Scene.Testing = {
    name: "plan10.test_scene",
    requiredAssets: [
        'plan10.robotAnimation'
    ],
    objects: [
        {
            name: "Robot",
            components: {
                "plan10.robotManager": {
                    maxRobots: 100,
                    createDelay: 10,
                    destroyDelay: 10,
                    robotPrefab: 'plan10.fastRobot'
                }
            }
        }
    ]
};
