'use strict';

/**
 * Main component for the ship, uses player's input to control the ship, play sounds, and fire weapons
 */
Plan10.Component.ShipController = function(gameObject, component) {
    component.collisionSound = null;
    component.thrustSound = null;
    component.shipImagePath = null;
    component.bombPrefab = null;
    component.blackholePrefab = null;
    component.detonateDelay = 1000;
    component.fireDelay = 1000;

    //cache input values
    var inputLeft, inputRight, inputForward, inputBackward, inputStrafe, inputBomb, inputBlackHole;
    
    //internal references to other components and objects
    var rigidbody = gameObject.getComponent('rigidbody2d');
    var transform = gameObject.getComponent('transform2d');
    var audio = gameObject.getComponent('audioEmitter');
    var input = gameObject.engine.getPlugin('input');
    var sprite = gameObject.getComponent('sprite');
    var health = gameObject.getComponent('plan10.health');
    var currentTime = 0;
    var activeBomb = null;
    var activeBlackHole = null;
    var timeBombFired = 0;
    var timeBombDetonated = 0;
    var timeBlackHoleFired = 0;
    var timeBlackHoleDetonated = 0;
    var isMoving = false;
    var engine = null;
    
    //on create load required assets
    component.$on('engine.create', function() {
        engine = gameObject.engine;
        if (component.shipImagePath) {
            gameObject.disable();
            gameObject.engine.loadAssets([
                component.shipImagePath,
                component.thrustSound,
                component.collisionSound
            ], function(assets) {
                sprite.image = assets[0];

                gameObject.enable();
                audio.playOnce('assets/kent/plan 10 script-15.mp3');
            });
        }
    });
    
    //get input values, handle firing weapons
    component.$on('engine.update', function(deltaTime) {
        currentTime = gameObject.engine.time;
        
        //get input values
        inputForward = input.getButton('move up');
        inputBackward = input.getButton('move down');
        inputLeft = input.getButton('move left');
        inputRight = input.getButton('move right');
        inputStrafe = input.getButton('strafe');
        inputBomb = input.getButton('fire bomb');
        inputBlackHole = input.getButton('fire black hole');
        
        //play thrust sound if appropriate
        if (component.thrustSound) {
            if (inputForward || inputBackward || inputLeft || inputRight) {
                audio.playLoop(component.thrustSound);
            } else {
                audio.stopSound(component.thrustSound);
            }
        }
        
        var x, y;
        
        if (inputBomb) {
            if (activeBomb !== null && currentTime - timeBombFired >= component.detonateDelay) {
                timeBombDetonated = currentTime;
                activeBomb.detonate();
                activeBomb = null;
            } else if (activeBomb === null && currentTime - timeBombDetonated >= component.fireDelay) {
                //instantiate bomb in front of ship
                var bomb = gameObject.engine.instantiatePrefab(component.bombPrefab);
                timeBombFired = currentTime;
                
                x = Math.cos(transform.rotation * Javelin.PI_OVER_180) * 60;
                y = Math.sin(transform.rotation * Javelin.PI_OVER_180) * 60;                                
                
                bomb.getComponent('transform2d').position = {
                    x: transform.position.x + x,
                    y: transform.position.y + y
                };

                bomb.getComponent('transform2d').rotation = transform.rotation;
                activeBomb = bomb.getComponent('plan10.projectile');
                bomb.on('projectile.destroy', function() {
                    activeBomb = null;
                });
            }
        }

        //this could be refactored to not duplicate the same logic as above.... but whatever
        if (inputBlackHole) {
            if (activeBlackHole !== null && currentTime - timeBlackHoleFired >= component.detonateDelay) {
                timeBlackHoleDetonated = currentTime;
                activeBlackHole.detonate();
                activeBlackHole = null;
            } else if (activeBlackHole === null && currentTime - timeBlackHoleDetonated >= component.fireDelay) {
                //instantiate bomb in front of ship
                var blackHole = gameObject.engine.instantiatePrefab(component.blackHolePrefab);
                timeBlackHoleFired = currentTime;

                x = Math.cos(transform.rotation * Javelin.PI_OVER_180) * 60;
                y = Math.sin(transform.rotation * Javelin.PI_OVER_180) * 60;                                
                
                blackHole.getComponent('transform2d').position = {
                    x: transform.position.x + x,
                    y: transform.position.y + y
                };
                blackHole.getComponent('transform2d').rotation = transform.rotation;
                activeBlackHole = blackHole.getComponent('plan10.projectile');
                blackHole.on('projectile.destroy', function() {
                    activeBlackHole = null;
                });
            }
        }
    });
    
    //apply forces to ship based on input
    component.$on('box2d.update', function() {
        if (inputForward) {
            rigidbody.applyForceForward(component.thrustForce);
        }
        if (inputBackward) {
            rigidbody.applyForceBackward(component.thrustForce);
        }
        if (inputLeft) {
            if (inputStrafe) {
                rigidbody.applyForceLeft(component.thrustForce);
            } else {
                rigidbody.applyRotationForce(-component.rotationForce);
            }
        }
        if (inputRight) {
            if (inputStrafe) {
                rigidbody.applyForceRight(component.thrustForce);
            } else {
                rigidbody.applyRotationForce(component.rotationForce);
            }
        }
    });
    
    //use audio component to play collision noise and/or commentary
    component.$on('box2d.collision.enter', function() {
        audio.playOnce('assets/kent/fx/FX-turretcollide.mp3');
    });

    //if the health component destroys this object, let's do... what?
    gameObject.on('health.destruct', function() {
        setTimeout(function() {
            audio.stopSound();
            engine.loadScene('plan10.lose_ending');
        }, 5000);
    });
};
Plan10.Component.ShipController.alias = "plan10.shipController";
Plan10.Component.ShipController.requires = [
    'plan10.health'
    ,'audioEmitter'
    ,'audioListener'
    ,'sprite'
];
