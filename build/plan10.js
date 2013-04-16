(function() {

;'use strict';

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
        assetUrl: "/plan10/"
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
;'use strict';

/**
 * Asteroid triggers the win ending if it's destroyed.
 */
Plan10.Component.Asteroid = function(gameObject, component) {
    var engine = null;
    
    component.$on('engine.create', function() {
        engine = gameObject.engine;
    });
    
    component.$on('engine.destroy', function() {
        setTimeout(function() {
            engine.loadScene('plan10.win_ending');
        }, 5000);
    });
};
Plan10.Component.Asteroid.alias = 'plan10.asteroid';
Plan10.Component.Asteroid.requires = [
    'sprite'
    ,'plan10.health'
    ,'rigidbody2d'
];
;'use strict';

/**
 * Scrolls a starfield on the background to make things like EPIC!
 */
Plan10.Component.Background = function(gameObject, component) {
    
    //Variable declarations    
    var stars = null;
    var backgroundColor = 'black'; 
    var draw_start_x = 0;
    var draw_start_y = 0;
    var scrollDelay = 0;
    var lastTimeDrawn = 0;
 
    
    component.$on('engine.create', function() {
        gameObject.disable();

        gameObject.engine.loadAsset('assets/starfield.png',function(image) {
            stars = image;
            gameObject.enable(); 
        });
    });

    component.$on('engine.update', function(deltaTime) {
                
        if (lastTimeDrawn + scrollDelay <= gameObject.engine.time) {       
            lastTimeDrawn = gameObject.engine.time;
            //console.log("My God, it's full of stars!");

        }
              
    });
    
    
    component.$on('canvas2d.draw', function(context) {
        //draw the star field by setting a black background and moving a 
        //transparent image w/ starts over it
//        console.log("y before: " + draw_start_y);
        context.fillStyle = backgroundColor;
        context.fillRect(0,0,800,600);
        context.drawImage(stars,draw_start_x,draw_start_y,800,600);
        context.drawImage(stars, draw_start_x, (600 - Math.abs(draw_start_y)), 800, 600);
        
               
        if (Math.abs(draw_start_y) > 600) {
             draw_start_y = 0;
        }
 
         draw_start_y -= 2;
//         console.log("y after: " + draw_start_y);
        


        //draw some part of a planet background that moves as the timer gets
        //closer to zero
        
        //this may be done here, or the earth and background objects may be better done as
        //separate child objects
    });
};
Plan10.Component.Background.alias = 'plan10.background';
;'use strict';

/**
 * Used for player projectile detonations (for bomb and black hole).  Projectiles will apply either explosion or
 * implosion forces to bodies near them, if configured to do so.
 */
Plan10.Component.Detonation = function(gameObject, component) {
    component.detonationSound = null;
    component.detonationForce = null;
    component.detonationRadius = null;
    component.implode = false;
    
    //do a bunch of stuff once it creates
    component.$on('engine.create', function() {
        var audio = gameObject.getComponent('audioEmitter');
        var animator = gameObject.getComponent('spriteAnimator');
        var transform = gameObject.getComponent('transform2d');
        
        audio.playOnce(component.detonationSound);
        
        var box = gameObject.engine.getPlugin('box2d');
        
        //apply explosion/implosion force if it does that
        if (component.detonationForce && component.detonationRadius) {
            box.applyRadialForce(
                transform.position.x,
                transform.position.y,
                component.detonationForce,
                component.detonationRadius,
                component.implode,
                function(gameObject) {
                    console.log('TODO: apply damage');
                }
            );
        }
        
        //destroy this object once it's done animating it's explosion
        animator.playOnce('explode', function() {
            gameObject.destroy();
        });
    });
};
Plan10.Component.Detonation.alias = 'plan10.detonation';
Plan10.Component.Detonation.requires = ['spriteAnimator', 'audioEmitter'];
;'use strict';

/**
 * Controls health and destruction of various objects that have health, and draws health bars that were shamelessly
 * stolen from Grits.  (thanks :) )
 */
Plan10.Component.Health = function(gameObject, component) {
    //default starting values (override from prefab definitions)
    component.maxHealth = 100;
    component.currentHealth = 100;
    component.deathPrefab = null;
    component.collisionDamage = 20;
    
    var transform = gameObject.getComponent('transform2d');
    
    component.applyDamage = function(damage) {
        component.currentHealth -= damage;
        if (component.currentHealth <= 0) {
            component.destroy();
        }
    };
    
    component.applyHealth = function(health) {
        component.currentHealth += health;
        if (component.currentHealth > component.maxHealth) {
            component.currentHealth = component.maxHealth;
        }
    };
    
    component.destroy = function() {
        if (component.deathPrefab) {
            var go = gameObject.engine.instantiate(component.deathPrefab);
            go.getComponent('transform2d').position = gameObject.getComponent('transform2d').position;
        }

        gameObject.broadcast('health.destruct');
        gameObject.destroy();
    };
    
    component.$on('box2d.collision.enter', function(gameObject) {
        var damage = 0;
        component.applyDamage(component.collisionDamage);
    });
    
    //this mostly taken from grits: src/client/scripts/core/ClientPlayer.js
    //draw health bar
    component.$on('canvas2d.draw', function(context) {
        var x = transform.position.x;
        var y = transform.position.y;
        //Draw health bar
        if (component.currentHealth * 3 / 2 >= component.maxHealth) {
            context.fillStyle = "green";
        } else if (component.currentHealth * 3 >= component.maxHealth) {
            context.fillStyle = "orange";
        } else {
            context.fillStyle = "red";
        }
        context.fillRect(x - 30, y - 40, (60 * component.currentHealth / component.maxHealth), 10);
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.strokeRect(x - 30, y - 40, 60, 10);        
    });
};
Plan10.Component.Health.alias = "plan10.health";
Plan10.Component.Health.requires = [
    'rigidbody2d'
];
;'use strict';

/**
 * This component manages the intro/win/lose monologues.  It plays sound and shows images
 * based on the content of the json file it is told to load.  This whole thing is kinda full of
 * hacks because Javelin isn't handling audio very well yet.
 */
Plan10.Component.Monologue = function(gameObject, component) {

    //public, to be set in prefab or scene definitions
    component.dataFile = null;
    
    var started = false;
    var input = null;
    var audio;
    var frames = null;
    var frameStatus = {};
    var images;
    var currentFrame = 0;
    var frameStartTime = 0;
    var times = [];
    var soundPaths = [];
    var imgPaths = [];
    var finished = false;
    var timeoutInterval = null;
        
    //figure out current frame, start new sound if necessary - this is terrible and full of hacks
    component.$on('engine.update', function(deltaTime) {
        if (gameObject.engine.time - frameStartTime >= times[currentFrame] * 1000) {
            if (!started) {
                started = true;
            } else {
                currentFrame++;
                if (currentFrame > images.length - 1) {
                    gameObject.emit('plan10.splash_screen');
                }
            }
            
            if (soundPaths[currentFrame]) {
                audio.playOnce(soundPaths[currentFrame]);
                frameStartTime = gameObject.engine.time;
            }
        }
        
        if (input.getButton('quit')) {
            gameObject.emit('plan10.splash_screen');
        }
    });
    
    //draw current image
    component.$on('canvas2d.draw', function(context) {
        if (images[currentFrame]) {
            context.drawImage(images[currentFrame], 0, 0);
        }
    });
    
    //load assets
    component.$on('engine.create', function() {
        input = gameObject.engine.getPlugin('input');
        audio = gameObject.getComponent('audioEmitter');
        gameObject.disable();
        gameObject.engine.loadAsset(component.dataFile, function (json) {
            frames = json;
            imgPaths = [];
            soundPaths = [];
            for (var i in json.frames) {
                soundPaths.push(json.frames[i].sound);
                imgPaths.push(json.frames[i].image);
                times.push(json.frames[i].time);
            }
            var imgsLoaded = false;

            //load images
            gameObject.engine.loadAssets(imgPaths, function(imgs) {
                images = imgs;
                imgsLoaded = true;
                
//                if (imgsLoaded && soundLoaded) {
                    gameObject.enable();
//                }
            });
            
        });
    });
};
Plan10.Component.Monologue.alias = "plan10.monologue";
Plan10.Component.Monologue.requires = [
    'audioListener',
    'audioEmitter'
];
;'use strict';

/**
 * Controls all projectiles by moving them forwards, and destroying them if they have lived
 * for too long, or collide with another object.
 */
Plan10.Component.Projectile = function(gameObject, component) {
    component.damage = null;
    component.velocity = 100;
    component.implode = false;
    component.fireSound = null;
    component.detonateSound = null;
    component.explosionPrefab = null;
    component.timeToLive = 3000;
    
    var timeCreated;
    var audio = gameObject.getComponent('audioEmitter');
    var transform = gameObject.getComponent('transform2d');
    var box2d = gameObject.engine.getPlugin('box2d');
    var rigidbody = gameObject.getComponent('rigidbody2d');
    
    component.detonate = function() {
        //instantiate explosion prefab
        if (component.explosionPrefab) {
            var go = gameObject.engine.instantiate(component.explosionPrefab);
            go.getComponent('transform2d').position = transform.position;
        }

        gameObject.broadcast('projectile.destroy');
        gameObject.destroy();
    };
    
    component.$on('engine.create', function() {
        audio.playOnce(component.fireSound);
        timeCreated = gameObject.engine.time;
        gameObject.getComponent('spriteAnimator').play('default');
    });
    
    component.$on('engine.update', function(deltaTime) {
        if (gameObject.engine.time - timeCreated >= component.timeToLive) {
            component.detonate();
        }
    });
    
    component.$on('box2d.update', function(deltaTime) {
        rigidbody.setVelocityForward(component.velocity);
    });
    
    component.$on('box2d.trigger.enter', function(gameObject) {
        if (!gameObject.hasComponent('plan10.proximitySensor')) {
            component.detonate();
        }
    });
    
    component.$on('box2d.collision.enter', function(gameObject) {
        component.detonate();
        if (component.damage && gameObject.hasComponent('plan10.health')) {
            gameObject.getComponent('plan10.health').applyDamage(component.damage);
        }
    });
};
Plan10.Component.Projectile.alias = 'plan10.projectile';
Plan10.Component.Projectile.requires = [
    'spriteAnimator'
    ,'rigidbody2d'
    ,'audioEmitter'
];
;'use strict';

/**
 * Proximity sensor takes care of tracking objects that enter the trigger radius, and setting the target
 * for the turretController, which is in the parent object.
 */
Plan10.Component.ProximitySensor = function(gameObject, component) {
    var transform = null;
    var rigidbody = null;
    var box2d = null;
    var turret = null;
    var targetId = null;
    
    component.$on('engine.create', function() {
        rigidbody = gameObject.getComponent('rigidbody2d');
        //HACK
        gameObject.setComponent('transform2d', gameObject.parent.getComponent('transform2d'));

        transform = gameObject.getComponent('transform2d');
        box2d = gameObject.engine.getPlugin('box2d');

        //we're assuming the parent object is a turret with the turretController
        //component
        turret = gameObject.parent.getComponent('plan10.turretController');
    });
    
    component.$on('box2d.trigger.enter', function(gameObject) {
        if (!turret.target) {
            if (gameObject.hasComponent('plan10.asteroid')) {
                targetId = gameObject.id;
                turret.setTarget(gameObject);
            }
        }
    });
    
    component.$on('box2d.trigger.exit', function(gameObject) {
        var t = turret.getTarget();
        if (t && t.id === gameObject.id) {
            turret.dropTarget();
        }
    });
    
    //HACK: this is a shameless hack - I just don't have time to get proper 
    //parent/child relationship working with transforms & rigidbodies in Javelin
    //in time for the contest
    component.$on('box2d.update', function() {
        rigidbody.getBody().SetPosition(new box2d.Vec2(transform.position.x, transform.position.y));
    });
};
Plan10.Component.ProximitySensor.alias = 'plan10.proximitySensor';
Plan10.Component.ProximitySensor.requires = ['rigidbody2d'];
;'use strict';

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
    var soundCollisionWarning = false;
    
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
            });
        }
        
        //hacks to play audio
        audio.playOnce('assets/kent/script-15.mp3');
        setTimeout(function() {
            if (gameObject.id !== -1) {
                audio.playOnce('assets/kent/script-blackhole.mp3');
            }
        }, 8500);
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
        
        if (input.getButton('quit')) {
            gameObject.emit('plan10.splash_screen');
        }
        
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
        
        if (!soundCollisionWarning) {
            soundCollisionWarning = true;
            audio.playOnce('assets/kent/script-collision-damage.mp3');
        }
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
;'use strict';

/**
 * Prevents the asteroid and the player from going off-screen.  Like old-school Asteroids.
 */
Plan10.Component.Teleport = function(go, component) {
    
    var rb = go.getComponent('rigidbody2d');
    var box2d = go.engine.getPlugin('box2d');
    
    component.$on('box2d.update', function() {
        var x = rb.getBody().GetPosition().x;
        var y = rb.getBody().GetPosition().y;
        var changed = false;
        var newX = x;
        var newY = y;
        
        if (x > 800) {
            changed = true;
            newX = 0;
        }

        if (x < 0) {
            changed = true;
            newX = 800;
        }

        if (y > 600) {
            changed = true;
            newY = 0;
        }

        if (y < 0) {
            changed = true;
            newY = 600;
        }
        
        if (changed) {
            rb.getBody().SetPosition(new box2d.Vec2(newX, newY));
        }
    });
};
Plan10.Component.Teleport.alias = 'plan10.teleport';
Plan10.Component.Teleport.requires = ['rigidbody2d'];;'use strict';

/**
 * Timer keeps track of how much time is left to complete the mission.
 * When the timer runs out, it loads the lose ending
 */
Plan10.Component.Timer = function(gameObject, component) {
    //the asteroid manager needs to set this
    component.manager = null;
    
    //total time in seconds
    component.totalTime = 250;
    component.timeLeft = null;
    
    //internal times are in milliseconds - not seconds
    var startTime, timeLeft;
    var warningPlayed = false;
    var audio = null;
    var timeLow = false;
    
    component.$on('engine.create', function() {
        startTime = gameObject.engine.time;
        timeLeft = (component.timeLeft) ? component.timeLeft : component.totalTime;
        audio = gameObject.getComponent('audioEmitter');
    });
    
    component.$on('engine.update', function(deltaTime) {
        timeLeft -= deltaTime;
        
        //play warning if little time left
        if (!warningPlayed && timeLeft <= 60) {
            audio.playOnce('assets/kent/script-20.mp3');
            warningPlayed = true;
            timeLow = true;
        }
        
        //trigger loss if time expires
        if (timeLeft <= 0) {
            gameObject.engine.loadScene('plan10.lose_ending');
        }
    });
    
    component.$on('canvas2d.draw', function(context) {
        var x = timeLeft;
        var seconds = Math.round((x % 60)) * 100 / 100;
        var minutes = Math.floor((timeLeft / 60)) % 60;
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        var text = minutes + ':' + seconds;
        
        
        context.font = "bold 32px sans-serif";
        context.fillStyle = (timeLow) ? '#F00' : '#0F0';
        context.fillText(text, 700, 50);
    });
};
Plan10.Component.Timer.alias = 'plan10.timer';
Plan10.Component.Timer.requires = ['audioEmitter'];
;'use strict';

/**
 * Controls firing at asteroid targets, if a target is present.  Also controls energy
 * bars that were shamelessly ripped from Grits.
 */
Plan10.Component.TurretController = function(gameObject, component) {
    
    //this is a reference back to the turretManager, the turret manager needs
    //to set it when it instantiates the turrets
    component.manager = null;
    
    component.energyPerShot = 10;
    component.fireRate = 400;       //time in ms between each shot
    component.maxEnergy = 100;
    component.currentEnergy = 100;
    component.laserPrefab = null;
    component.driftForce = 10000;
    component.driftAngle = 180;
    
    var target = null;
    var targetHealth = null;
    var audio = null;
    var lastFired = 0;
    var transform = null;
    var rigidbody;
    
    component.setTarget = function(asteroid) {
        target = asteroid;
        targetHealth = asteroid.getComponent('plan10.health');
    };
    
    component.dropTarget = function() {
        target = null;
        targetHealth = null;
    };
    
    component.getTarget = function() {
        return target;
    };
    
    component.lookAt = function(x, y) {
        var dy = transform.position.y - y;
        var dx = transform.position.x - x;
        var angle = Math.atan2(dy, dx) * Javelin._180_OVER_PI;
        
        //technically I'm looking -away- to make the images look right
        transform.rotation = angle + 180 % 360;
    };
    
    component.fire = function() {
        if (gameObject.engine.time - lastFired >= component.fireRate && component.currentEnergy > 0) {
            component.currentEnergy -= component.energyPerShot;
            lastFired = gameObject.engine.time;
            
            if (this.laserPrefab) {
                var laser = gameObject.engine.instantiatePrefab(component.laserPrefab);
                var lt = laser.getComponent('transform2d');
                lt.rotation = transform.rotation;
                
                var x = Math.cos(transform.rotation * Javelin.PI_OVER_180) * 40;
                var y = Math.sin(transform.rotation * Javelin.PI_OVER_180) * 40;
                
                lt.position.x = transform.position.x + x;
                lt.position.y = transform.position.y + y;
            }
        }
    };
    
    component.$on('engine.update', function(deltaTime) {
        if (target) {
            var pos = target.getComponent('transform2d').position;
            component.lookAt(pos.x, pos.y);
            component.fire();
        }
        
        //destroy if out of energy
        if (component.currentEnergy <= 0) {
            gameObject.destroy();
        }
        
        //destroy if out of bounds
        if (
            (transform.position.x > 900 || transform.position.x < -100) ||
            (transform.position.y > 700 || transform.position.x < -100)
        ) {
            gameObject.destroy();
        }
        
        //check for low energy sound
        if (component.manager && component.currentEnergy <= 0 && !component.manager.soundLowEnergy) {
            component.manager.soundLowEnergy = true;
            audio.playOnce('assets/kent/script-limited-energy.mp3');
        }
        
        rigidbody.applyForce(component.driftAngle, component.driftForce);
    });
    
    component.$on('box2d.collision.enter', function(gameObject) {
        if (component.manager && !component.manager.soundTurretDamage) {
            component.manager.soundTurretDamage = true;
            audio.playOnce('assets/kent/script-turretdamage.mp3');
        }
    });
    
    component.$on('engine.create', function() {
        audio = gameObject.getComponent('audioEmitter');
        transform = gameObject.getComponent('transform2d');
        rigidbody = gameObject.getComponent('rigidbody2d');

        //inform manager this has been created
        if (component.manager) {
            component.manager.addTurret(gameObject);
        }
    });
    
    component.$on('engine.destroy', function() {
        //inform manager this is being destroyed
        if (component.manager) {
            component.manager.removeTurret(gameObject);
        }
    });
    
    //this mostly taken from grits: src/client/scripts/core/ClientPlayer.js
    //draw energy bar
    component.$on('canvas2d.draw', function(context) {
        var x = transform.position.x;
        var y = transform.position.y;

        if (component.currentEnergy * 3 / 2 >= component.maxEnergy) {
            context.fillStyle = "aqua";
        } else if (component.currentEnergy * 3 >= component.maxEnergy) {
            context.fillStyle = "blue";
        } else {
            context.fillStyle = "darkblue";
        }
        context.fillRect(x - 30, y - 30, (60 * component.currentEnergy / component.maxEnergy), 10);
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.strokeRect(x - 30, y - 30, 60, 10);
    });
};
Plan10.Component.TurretController.alias = 'plan10.turretController';
Plan10.Component.TurretController.requires = [
    'sprite'
    ,'plan10.health'
    ,'rigidbody2d'
    ,'audioEmitter'
];
;'use strict';

/*
 * The turret manager is in charge of instantiating new turrets.
 */
Plan10.Component.TurretManager = function(gameObject, component) {
    //the turret to instantiate
    component.turretPrefab = null;
    
    //how many active turrets can exist at a time
    component.maxTurrets = 4;
    component.spawnY = 150;
    component.spawnX = 800;
    component.soundLowEnergy = false;
    component.soundTurretDamage = false;
    
    //time in ms to delay creating new turrets if not at max
    component.spawnDelay = 3000;

    //active turrets
    var turrets = [];
    var lastTimeCreated = 0;
    var nextOffsetY;
    
    component.addTurret = function(turret) {
        turrets.push(turret);
    };
    
    component.removeTurret = function(turret) {
        var index = turrets.indexOf(turret);
        if (-1 !== index) {
            turrets.splice(turret, 1);
        }
    };
    
    component.spawnTurret = function() {
        if (gameObject.engine.time - lastTimeCreated >= component.spawnDelay) {
            lastTimeCreated = gameObject.engine.time;

            var turret = gameObject.engine.instantiatePrefab(component.turretPrefab);
            var t = turret.getComponent('transform2d');
            t.position.x = component.spawnX;
            t.position.y = nextOffsetY;
            
            turret.getComponent('plan10.turretController').manager = component;
            
            nextOffsetY += component.spawnY;
            if (nextOffsetY >= 600) {
                nextOffsetY = component.spawnY;
            }
        }
    };
    
    component.$on('engine.create', function() {
        nextOffsetY = component.spawnY;
    });
    
    component.$on('engine.update', function(deltaTime) {
        if (turrets.length < component.maxTurrets) {
            component.spawnTurret();
        }
    });
};
Plan10.Component.TurretManager.alias = 'plan10.turretManager';
;'use strict';

Plan10.Prefab.Asteroid = {
    name: 'plan10.asteroid',
    components: {
        'plan10.asteroid': {},
        'plan10.teleport': {},
        'plan10.health': {
            maxHealth: 2000,
            currentHealth: 2000,
            collisionDamage: 10,
            deathPrefab: 'plan10.shipExplosion'
        },
        'sprite': {
            imagePath: 'assets/asteroid.png',
            scale: {
                x: 0.6,
                y: 0.6
            }
        },
        'rigidbody2d': {
            height: 100,
            width: 60,
            density: 0.5,
            dampening: 0.8
        }
    }
};
;'use strict';

Plan10.Prefab.BlackHole = {
    name: "plan10.blackHole",
    components: {
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'plan10.projectile': {
            velocity: 100000,
            fireSound: 'assets/kent/fx/FX-laybomb.mp3',
            explosionPrefab: 'plan10.blackHoleDetonation',
            timeToLive: 6000
        },
        'rigidbody2d': {
            radius: 15,
            trigger: true
        },
        'spriteAnimator': {
            animations: {
                'default': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'quad_effect_0000.png',
                        'quad_effect_0001.png',
                        'quad_effect_0002.png',
                        'quad_effect_0003.png',
                        'quad_effect_0004.png',
                        'quad_effect_0005.png',
                        'quad_effect_0006.png',
                        'quad_effect_0007.png',
                        'quad_effect_0008.png',
                        'quad_effect_0009.png',
                        'quad_effect_0010.png',
                        'quad_effect_0011.png',
                        'quad_effect_0012.png',
                        'quad_effect_0013.png',
                        'quad_effect_0014.png',
                        'quad_effect_0015.png'
                    ]
                }
            }
        }
    }
};
;'use strict';

Plan10.Prefab.BlackHoleDetonation = {
    name: "plan10.blackHoleDetonation",
    components: {
        'plan10.detonation': {
            detonationForce: 9999000,
            detonationRadius: 150,
            detonationSound: 'assets/kent/fx/FX-blackhole.mp3',
            implode: true
        },
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'spriteAnimator': {
            animations: {
                'explode': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'spawner_black_activate_0000.png',
                        'spawner_black_activate_0001.png',
                        'spawner_black_activate_0002.png',
                        'spawner_black_activate_0003.png',
                        'spawner_black_activate_0004.png',
                        'spawner_black_activate_0005.png',
                        'spawner_black_activate_0006.png',
                        'spawner_black_activate_0007.png',
                        'spawner_black_activate_0008.png',
                        'spawner_black_activate_0009.png',
                        'spawner_black_activate_0010.png',
                        'spawner_black_activate_0011.png',
                        'spawner_black_activate_0012.png',
                        'spawner_black_activate_0013.png',
                        'spawner_black_activate_0014.png',
                        'spawner_black_activate_0015.png',
                        'spawner_black_activate_0015.png',
                        'spawner_black_activate_0014.png',
                        'spawner_black_activate_0013.png',
                        'spawner_black_activate_0012.png',
                        'spawner_black_activate_0011.png',
                        'spawner_black_activate_0010.png',
                        'spawner_black_activate_0009.png',
                        'spawner_black_activate_0008.png',
                        'spawner_black_activate_0007.png',
                        'spawner_black_activate_0006.png',
                        'spawner_black_activate_0005.png',
                        'spawner_black_activate_0004.png',
                        'spawner_black_activate_0003.png',
                        'spawner_black_activate_0002.png',
                        'spawner_black_activate_0001.png',
                        'spawner_black_activate_0000.png',
                    ]
                }
            }
        }
    }
};
;'use strict';

Plan10.Prefab.Bomb = {
    name: "plan10.bomb",
    components: {
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'plan10.projectile': {
            velocity: 100000,
            fireSound: 'assets/kent/fx/FX-laybomb.mp3',
            explosionPrefab: 'plan10.bombExplosion',
            timeToLive: 6000
        },
        'rigidbody2d': {
            radius: 15,
            trigger: true
        },
        'spriteAnimator': {
            animations: {
                'default': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'landmine_idle_0000.png',
                        'landmine_idle_0001.png',
                        'landmine_idle_0002.png',
                        'landmine_idle_0003.png',
                        'landmine_idle_0004.png',
                        'landmine_idle_0005.png',
                        'landmine_idle_0006.png',
                        'landmine_idle_0007.png',
                        'landmine_idle_0008.png',
                        'landmine_idle_0009.png',
                        'landmine_idle_0010.png',
                        'landmine_idle_0011.png',
                        'landmine_idle_0012.png',
                        'landmine_idle_0013.png',
                        'landmine_idle_0014.png',
                        'landmine_idle_0015.png',
                        'landmine_idle_0016.png',
                        'landmine_idle_0017.png',
                        'landmine_idle_0018.png',
                        'landmine_idle_0019.png',
                        'landmine_idle_0020.png',
                        'landmine_idle_0021.png',
                        'landmine_idle_0022.png',
                        'landmine_idle_0023.png',
                        'landmine_idle_0024.png',
                        'landmine_idle_0025.png',
                        'landmine_idle_0026.png',
                        'landmine_idle_0027.png',
                        'landmine_idle_0028.png',
                        'landmine_idle_0029.png'
                    ]
                }
            }
        }
    }
};
;'use strict';

Plan10.Prefab.BombExplosion = {
    name: "plan10.bombExplosion",
    components: {
        'plan10.detonation': {
            detonationForce: 9999000,
            detonationRadius: 150,
            detonationSound: 'assets/kent/fx/FX-bomb.mp3',
            implode: false
        },
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'spriteAnimator': {
            animations: {
                'explode': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'landmine_explosion_small_0000.png',
                        'landmine_explosion_small_0001.png',
                        'landmine_explosion_small_0002.png',
                        'landmine_explosion_small_0003.png',
                        'landmine_explosion_small_0004.png',
                        'landmine_explosion_small_0005.png',
                        'landmine_explosion_small_0006.png',
                        'landmine_explosion_small_0007.png',
                        'landmine_explosion_small_0008.png',
                        'landmine_explosion_small_0009.png',
                        'landmine_explosion_small_0010.png',
                        'landmine_explosion_small_0011.png',
                        'landmine_explosion_small_0012.png',
                        'landmine_explosion_small_0013.png',
                        'landmine_explosion_small_0014.png',
                        'landmine_explosion_small_0015.png',
                        'landmine_explosion_small_0016.png',
                        'landmine_explosion_small_0017.png',
                        'landmine_explosion_small_0018.png',
                        'landmine_explosion_small_0019.png',
                        'landmine_explosion_small_0020.png',
                        'landmine_explosion_small_0021.png',
                        'landmine_explosion_small_0022.png',
                        'landmine_explosion_small_0023.png',
                        'landmine_explosion_small_0024.png',
                        'landmine_explosion_small_0025.png',
                        'landmine_explosion_small_0026.png',
                        'landmine_explosion_small_0027.png',
                        'landmine_explosion_small_0028.png',
                        'landmine_explosion_small_0029.png',
                    ]
                }
            }
        }
    }
};
;'use strict';

Plan10.Prefab.Laser = {
    name: "plan10.laser",
    components: {
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'plan10.projectile': {
            damage: 50,
            velocity: 100000,
            fireSound: 'assets/kent/fx/FX-pew.mp3',
            explosionPrefab: 'plan10.laserImpact',
            timeToLive: 6000
        },
        'rigidbody2d': {
            height: 3,
            width: 20,
            density: 0.0,
            damping: 0.0,
            angularDamping: 0.0
        },
        'spriteAnimator': {
            animations: {
                'default': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'chaingun_projectile_0000.png',
                        'chaingun_projectile_0001.png',
                        'chaingun_projectile_0002.png',
                        'chaingun_projectile_0003.png',
                        'chaingun_projectile_0004.png',
                        'chaingun_projectile_0005.png',
                        'chaingun_projectile_0006.png',
                        'chaingun_projectile_0007.png'
                    ]
                }
            }
        }
    }
};
;'use strict';

Plan10.Prefab.LaserImpact = {
    name: "plan10.laserImpact",
    components: {
        'plan10.detonation': {
            detonationSound: 'assets/kent/fx/FX-bomb.mp3',
        },
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'spriteAnimator': {
            animations: {
                'explode': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'chaingun_impact_0000.png',
                        'chaingun_impact_0001.png',
                        'chaingun_impact_0002.png',
                        'chaingun_impact_0003.png',
                        'chaingun_impact_0004.png',
                        'chaingun_impact_0005.png',
                        'chaingun_impact_0006.png',
                        'chaingun_impact_0007.png',
                        'chaingun_impact_0008.png',
                        'chaingun_impact_0009.png',
                        'chaingun_impact_0010.png',
                        'chaingun_impact_0011.png',
                        'chaingun_impact_0012.png',
                        'chaingun_impact_0013.png',
                        'chaingun_impact_0014.png',
                        'chaingun_impact_0015.png',
                        'chaingun_impact_0016.png',
                        'chaingun_impact_0017.png',
                        'chaingun_impact_0018.png',
                        'chaingun_impact_0019.png',
                        'chaingun_impact_0020.png',
                        'chaingun_impact_0021.png',
                        'chaingun_impact_0022.png',
                        'chaingun_impact_0023.png',
                        'chaingun_impact_0024.png',
                        'chaingun_impact_0025.png',
                        'chaingun_impact_0026.png',
                        'chaingun_impact_0027.png',
                        'chaingun_impact_0028.png',
                        'chaingun_impact_0029.png',
                    ]
                }
            }
        }
    }
};
;'use strict';

Plan10.Prefab.Player = {
    name: "plan10.player",
    layer: 'default',
    components: {
        'audioListener': {},
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'plan10.shipController': {
            bombPrefab: 'plan10.bomb',
            blackHolePrefab: 'plan10.blackHole',
            thrustForce: 10000,
            rotationForce: 100000,
            fireDelay: 500,
            detonateDelay: 500,
            thrustSound: 'assets/kent/fx/FX-thruster.mp3'
        },
        'plan10.teleport': {},
        'sprite': {
            imagePath: 'assets/ship.png'
        },
        'plan10.health': {
            maxHealth: 400,
            currentHealth: 400,
            collisionDamage: 50,
            deathPrefab: 'plan10.shipExplosion'
        },
        'rigidbody2d': {
            radius: 40,
            density: 0.0001,
            restitution: 0.0,
            friction: 0.0,
            damping: 0.8,
            angularDamping: 1
        },
        'transform2d': {
            position: {
                x: 100,
                y: 300
            }
        }
    }
};
;'use strict';

Plan10.Prefab.ShipExplosion = {
    name: "plan10.shipExplosion",
    components: {
        'plan10.detonation': {
            detonationForce: 9999000,
            detonationRadius: 150,
            detonationSound: 'assets/kent/fx/FX-shipblow.mp3',
            implode: false
        },
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'spriteAnimator': {
            animations: {
                'explode': {
                    atlasPath: 'assets/grits/grits_effects.atlas.json',
                    frames: [
                        'landmine_explosion_large_0000.png',
                        'landmine_explosion_large_0001.png',
                        'landmine_explosion_large_0002.png',
                        'landmine_explosion_large_0003.png',
                        'landmine_explosion_large_0004.png',
                        'landmine_explosion_large_0005.png',
                        'landmine_explosion_large_0006.png',
                        'landmine_explosion_large_0007.png',
                        'landmine_explosion_large_0008.png',
                        'landmine_explosion_large_0009.png',
                        'landmine_explosion_large_0010.png',
                        'landmine_explosion_large_0011.png',
                        'landmine_explosion_large_0012.png',
                        'landmine_explosion_large_0013.png',
                        'landmine_explosion_large_0014.png',
                        'landmine_explosion_large_0015.png',
                        'landmine_explosion_large_0016.png',
                        'landmine_explosion_large_0017.png',
                        'landmine_explosion_large_0018.png',
                        'landmine_explosion_large_0019.png',
                        'landmine_explosion_large_0020.png',
                        'landmine_explosion_large_0021.png',
                        'landmine_explosion_large_0022.png',
                        'landmine_explosion_large_0023.png',
                        'landmine_explosion_large_0024.png',
                        'landmine_explosion_large_0025.png',
                        'landmine_explosion_large_0026.png',
                        'landmine_explosion_large_0027.png',
                        'landmine_explosion_large_0028.png',
                        'landmine_explosion_large_0029.png',
                    ]
                }
            }
        }
    }
};
;'use strict';

Plan10.Prefab.Turret = {
    name: "plan10.turret",
    components: {
        'audioEmitter': {
            spatial: false,
            volume: 0.8
        },
        'sprite': {
            atlasPath: 'assets/grits/grits_effects.atlas.json',
            imagePath: 'turret.png'
        },
        'plan10.health': {
            maxHealth: 200,
            currentHealth: 200,
            collisionDamage: 50,
            deathPrefab: 'plan10.bombExplosion'
        },
        'plan10.turretController': {
            energyPerShot: 5,
            maxEnergy: 100,
            currentEnergy: 100,
            fireRate: 500,
            laserPrefab: 'plan10.laser',
            driftForce: 10000,
            driftAngle: 180
        },
        'rigidbody2d': {
            radius: 20,
            density: 1.0,
            restitution: 0.0,
            friction: 0.0,
            damping: 1,
            angularDamping: 0.2,
            fixedRotation: true
        }
    },
    children: [
        {
            name: 'sensor',
            components: {
                'plan10.proximitySensor': {
                    
                },
                'rigidbody2d': {
                    radius: 100, //radius for the proximity sensor
                    trigger: true
                }
            }
        }
    ]
};
;'use strict';

Plan10.Prefab.TurretManager = {
    name: 'plan10.turretManager',
    components: {
        'plan10.turretManager': {
            spawnY: 150,
            spawnX: 800,
            spawnDelay: 3000,
            maxTurrets: 3,
            turretPrefab: 'plan10.turret'
        }
    }
};
;'use strict';

Plan10.Scene.Intro = {
    name: "plan10.intro",
    objects: [
        {
            name: "Monologue",
            components: {
                'plan10.monologue': { 
                    dataFile: 'assets/monologue_intro.json'
                },
                'audioEmitter': {
                    spatial: false
                }
            }
        }
    ]
};
;'use strict';

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
;'use strict';

Plan10.Scene.Main = {
    name: "plan10.main",
    preLoad: [
        'assets/grits/grits_effects.atlas.json',
        'asteroid.png'
    ],
    objects: [
        'plan10.player',            //in src/prefabs/Player.js
        'plan10.turretManager',     //in src/prefabs/TurretManager.js
        {
            fromPrefab: 'plan10.asteroid',
            components: {
                'transform2d': {
                    position: {
                        x: 300,
                        y: 300
                    }
                }
            }
        },
        {
            name: 'background',
            layer: 'background',
            components: { 'plan10.background': {} }
        },
        {
            name: 'timer',
            components: { 
                'plan10.timer': {
                    totalTime: 300
                }
            }
        }
    ]
};
;'use strict';

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
;
    if (typeof module !== 'undefined') {
        // export for node
        module.exports = Plan10;
    } else {
        // assign to window
        this.Plan10 = Plan10;
    }
}).apply(this);
