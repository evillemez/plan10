'use strict';

Plan10.Scene.Testing = {
    name: "plan10.test_scene",
    requiredAssets: [
        'plan10.robotAnimation'
    ],
    objects: [
        'plan10.testPlayer',
        {
            components: {
                'plan10.robotAnimation': {},
                'transform2d': {
                    position: {
                        x: 500,
                        y: 500
                    }
                }
            }
        },
        {
            components: {
                'plan10.robotAnimation': {},
                'transform2d': {
                    position: {
                        x: 150,
                        y: 500
                    }
                }
            }
        },
        {
            layer: 'background',
            components: {
                'plan10.robotAnimation': {},
                'transform2d': {
                    position: {
                        x: 150,
                        y: 150
                    }
                }
            }
        },
        {
            components: {
                'plan10.robotAnimation': {},
                'transform2d': {
                    position: {
                        x: 500,
                        y: 150
                    }
                }
            }
        }
    ]
};
