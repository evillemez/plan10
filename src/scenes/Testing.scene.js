'use strict';

Plan10.Scene.Testing = {
    name: "plan10.test_scene",
    requiredAssets: [
        'plan10.robot_animation'
    ],
    objects: [
        {
            name: "Robot",
            components: {
                "plan10.robot_manager": {
                    maxRobots: 100,
                    createDelay: 10,
                    destroyDelay: 10,
                    robotPrefab: 'plan10.fast_robot'
                }
            }
        }
    ]
};
