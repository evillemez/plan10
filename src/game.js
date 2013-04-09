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
Plan10.Plugin = {};         //for experimental engine plugins

//main game config passed to Javelin engine instance
Plan10.config = {
    name: "Plan 10 from Outer Space!",
    debug: true,
    layers: ['background', 'default', 'foreground'],
    stepsPerSecond: 1000/30,
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
                    'fire': 'space'
                }
            }
        },
        "canvas2d": {
            renderTargetId: 'game',
            height: 768,
            width: 1024,
            framesPerSecond: 1000/30
        },
    },
    autoregisterComponents: Plan10.Component,
    autoregisterPrefabs: Plan10.Prefab,
    autoregisterScenes: Plan10.Scene,
    autoregisterPlugins: Plan10.Plugin,
    requiredAssets: []
};
