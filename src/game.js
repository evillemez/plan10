'use strict';

/**
 * This file is basic setup for the entire game.  It defines the namespaces the rest of the code uses, and
 * the configuration passed to the engine when it's instantiated.
 */

//setup namespace & sub namespaces for game
var Plan10 = Plan10 || {};
Plan10.Component = {};      //for game object components
Plan10.Prefab = {};         //for prefab definitions
Plan10.Scene = {};          //for scene definitions

//main game config passed to Javelin engine instance
Plan10.config = {
    name: "Plan 10 from Outer Space!",
    debug: true,
    stepsPerSecond: 1000/60,
    autoregisterComponents: Plan10.Component,
    autoregisterPrefabs: Plan10.Prefab,
    autoregisterScenes: Plan10.Scene,
    loader: {
        assetUrl: "http://localhost/plan10/"
    },
    plugins: {
        'audio': {},
        'input': {
            keyboard: {
                buttons: {
                    'move left': 'a',
                    'move right': 'd',
                    'move down': 's',
                    'move up': 'w',
                    'strafe': 'shift',
                    'fire bomb': 'j',
                    'fire black hole': 'k',
                    'quit': 'escape'
                }
            }
        },
        'box2d': {
            stepsPerSecond: 1000/60,
            stepHZ: 1.0/60.0,
            velocityIterations: 10,
            positionIterations: 10,
            clearForces: true
        },
        'canvas2d': {
            renderTargetId: 'game',
            height: 600,
            width: 800,
            framesPerSecond: 1000/60,
            layers: ['background', 'default', 'foreground']
        },
    }
};
