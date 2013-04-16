(function() {

;'use strict';

//setup main namespace
var Javelin = Javelin || {};

//setup sub namespaces for categories of objects
//included with Javelin
Javelin.Plugin = {};
Javelin.Component = {};
Javelin.Prefab = {};
Javelin.Scene = {};
Javelin.Env = {};
Javelin.Asset = {};

//during initialize, whether to automatically register all objects included
//with this build of Javelin (probably should leave as true unless you really
//have a good reason not to)
Javelin.AUTO_REGISTER_SELF = true;

//used a lot for converting degrees to radians
Javelin.PI_OVER_180 = Math.PI / 180;
Javelin._180_OVER_PI = 180 / Math.PI;

//registry for stuff used in the engine, don't manipulate these
Javelin.__componentHandlers = {};
Javelin.__componentRequirements = {};
Javelin.__pluginHandlers = {};
Javelin.__prefabs = {};
Javelin.__scenes = {};

//mostly for testing and internal use; generally, don't call this from your own code
Javelin.reset = function() {
    Javelin.__componentHandlers = {};
    Javelin.__componentRequirements = {};
    Javelin.__pluginHandlers = {};
    Javelin.__prefabs = {};
    Javelin.__scenes = {};
};

/* utility methods: note that these are for checking LITERALS only, as they are used internally
quite a bit, and have an expected format, there may be edge cases where these don't give the
expected result */

Javelin.isString = function(value) {
    return typeof value === 'string';
};

Javelin.isEmpty = function(item) {
    for (var key in item) {
        return false;
    }
    
    return true;
};

Javelin.isFunction = function(value) {
    return typeof value === 'function';
};

Javelin.isObject = function(value) {
    return value != null && !Javelin.isArray(value) && typeof value === 'object';
};

Javelin.isArray = function(value) {
    return Object.prototype.toString.apply(value) === '[object Array]';
};

/* Registry methods */

//register a GameObject Component handler function
Javelin.registerComponent = function(handler) {
    if (!Javelin.isFunction(handler)) {
        throw new Error("Components must be functions.");
    }
    
    if (!handler.alias) {
        throw new Error("Components must specify their alias.");
    }
    
    if (handler.requires && !Javelin.isArray(handler.requires)) {
        throw new Error("Component.requires must be an array in " + handler.alias + ".");
    }
    
    if (handler.inherits && !Javelin.isString(handler.inherits)) {
        throw new Error("Component.inherits should be a reference to another component alias string in (" + handler.alias + ").");
    }
    
    if (handler.inherits && handler.requires && -1 !== handler.requires.indexOf(handler.inherits)) {
        throw new Error("Component cannot both require and inherit the same component, must be one or the other.");
    }
    
    Javelin.__componentHandlers[handler.alias] = handler;
};

Javelin.registerPrefab = function(obj) {
    if (!Javelin.isObject(obj)) {
        throw new Error("Prefabs must be object literals.");
    }
    
    if (!obj.name || !Javelin.isString(obj.name)) {
        throw new Error("Prefabs must specify a string name property!");
    }

    Javelin.__prefabs[obj.name] = obj;
};

Javelin.registerScene = function(obj) {
    if (!Javelin.isObject(obj)) {
        throw new Error("Scenes must be object literals.");
    }
    
    if (!obj.name || !Javelin.isString(obj.name)) {
        throw new Error("Scenes must specify a string name property!");
    }
        
    Javelin.__scenes[obj.name] = obj;
};

Javelin.registerPlugin = function(handler) {
    
    if (!Javelin.isFunction(handler)) {
        throw new Error("Engine plugins must be functions");
    }
    
    if (!handler.alias || !Javelin.isString(handler.alias)) {
        throw new Error("Engine plugins must specify a string alias.");
    }
    
    this.__pluginHandlers[handler.alias] = handler;
};

Javelin.getPrefab = function(name) {
    return Javelin.__prefabs[name] || false;
};


Javelin.getScene = function(name) {
    return Javelin.__scenes[name] || false;
};

Javelin.getComponentHandler = function(alias) {
    return Javelin.__componentHandlers[alias] || false;
};

Javelin.getPluginHandler = function(alias) {
    return Javelin.__pluginHandlers[alias] || false;
};

Javelin.getComponentRequirements = function(alias) {
    return Javelin.__componentRequirements[alias] || [];
};

Javelin.buildComponentRequirements = function(handler) {
    var reqs = [];
    
    var getRequirements = function(alias) {
        var handler = Javelin.getComponentHandler(alias);
        if (!handler) {
            throw new Error("Missing component for requirement ["+alias+"]!");
        }
        if (handler.requires) {
            for (var i = 0; i < handler.requires.length; i++) {
                var exists = false;
                for (var j = 0; j < reqs.length; j++) {
                    if (reqs[j].alias === handler.requires[i]) {
                        exists = true;
                    }
                }

                if (!exists) {
                    getRequirements(handler.requires[i]);
                    reqs.push(Javelin.getComponentHandler(handler.requires[i]));
                }
            }
        }
    };
    
    getRequirements(handler.alias);
    
    this.__componentRequirements[handler.alias] = reqs;
};

//converts string references inside prefab definitions to
//in-memory objects, so no extra logic is required during
//actual instantiation
Javelin.unpackPrefabDefinitions = function() {
    var unpackPrefab = function(prefab) {
        if (prefab.children) {
            var unpackedChildren = [];
            for (var i in prefab.children) {
                var child = prefab.children[i];

                if (Javelin.isString(child)) {
                    unpackPrefab(Javelin.getPrefab(child));
                    unpackedChildren.push(Javelin.getPrefab(child));
                } else {
                    unpackPrefab(child);
                    unpackedChildren.push(child);
                }

            }

            prefab.children = unpackedChildren;
            Javelin.registerPrefab(prefab);
        }
    };
    
    for (var alias in Javelin.__prefabs) {
        unpackPrefab(Javelin.getPrefab(alias));
    }
};

//figure out all component inheritence and requirements
Javelin.initialize = function() {
    if (Javelin.AUTO_REGISTER_SELF) {
        var key;
        for (key in Javelin.Component) {
            Javelin.registerComponent(Javelin.Component[key]);
        }
        for (key in Javelin.Plugin) {
            Javelin.registerPlugin(Javelin.Plugin[key]);
        }
        for (key in Javelin.Prefab) {
            Javelin.registerPrefab(Javelin.Prefab[key]);
        }
        for (key in Javelin.Scene) {
            Javelin.registerScene(Javelin.Scene[key]);
        }
    }
    
    //resolve component hierarchies/dependencies
    for (var alias in Javelin.__componentHandlers) {
                
        //build requirements
        Javelin.buildComponentRequirements(Javelin.__componentHandlers[alias]);
    }
    
    //expand all prefab definitions for quick instantiation
    Javelin.unpackPrefabDefinitions();
};
;'use strict';

/**
 * This class represents a specific image in a sprite sheet exported from TexturePacker.  This is used internally
 * in the TexturePackerAtlas class.  The values here assume that the data was exported by TexturePacker in
 * the "json(hash)" format
 */
Javelin.Asset.AtlasImage = function(data, image) {
    this.image = image;
    this.x = data.frame.x;
    this.y = data.frame.y;
    this.height = data.frame.h;
    this.width = data.frame.w;

    if (data.trimmed) {
        this.cx = data.spriteSourceSize.x - data.sourceSize.w * 0.5;
        this.cy = data.spriteSourceSize.y - data.sourceSize.h * 0.5;
    } else {
        this.cx = -this.width * 0.5;
        this.cy = -this.height * 0.5;
    }
};
;'use strict';

Javelin.Asset.TexturePackerAtlas = function(json, image) {
    this.image = image;
    this.imageMeta = json.meta;
    this.images = {};
    
    var c = 0;
    for (var name in json.frames) {
        var img = new Javelin.Asset.AtlasImage(json.frames[name], this.image);
        this.images[name] = img;
        c++;
    }
    
    this.count = c;
};
;'use strict';

Javelin.Asset.TiledMap = function(data, images) {
    //TODO
};
;'use strict';

Javelin.Component.AudioEmitter = function(gameObject, component) {
    var audio = null, transform = null, outputNode = null;
    var filterNodes = {};
    
    //public config values
    component.spatial = true; //if true, culling and filters can be applied - if not true, it connects directly to the audio plugins masterVolumeNode
    component.range = 50;
    component.volume = 100;
    component.getAudioNode = function() {};
    
    var activeLoops = {};
    
    /**
     * Play a sound continually, given the path to the sound.
     * 
     * @param {String} path Path to audio file asset
     * @param {Boolean} cull Flag to NOT play the sound if won't actually be heard by the audioListener.  By default is `false` - generally should only be used for short-lived sounds like gunshots or explosions.
     */    
    component.playLoop = function(path, cull) {
        cull = cull || false;
        
        if (!activeLoops[path]) {
            activeLoops[path] = true;
            //start playing a sound and loop it
            audio.playSound(path, component, transform, true, cull);
        }
    };
    
    /**
     * Play a sound one time, given the path to the sound.
     * 
     * @param {String} path Path to audio file asset
     * @param {Boolean} cull Flag to NOT play the sound if won't actually be heard by the audioListener.  By default is `false` - generally should only be used for short-lived sounds like gunshots or explosions.
     */    
    component.playOnce = function(path, cull) {
        cull = cull || false;

        //play sound once, no loop
        audio.playSound(path, component, transform, false, cull);
    };
    
    /**
     * Stop playing a sound (or all sounds) started from this emitter.
     * 
     * @param {String} path Optional path of sound to stop playing.
     */    
    component.stopSound = function (path) {
        path = path || false;
        audio.stopSound(gameObject.id, path);
        
        if (activeLoops[path]) {
            activeLoops[path] = false;
        }
        //TODO: tell audio plugin to stop playing a specific sound, or
        //all sounds started from this emitter's gameObject
    };
    
    //store reference to audio plugin and transform component
    component.$on('engine.create', function() {
        audio = gameObject.engine.getPlugin('audio');
        transform = gameObject.getComponent('transform2d');
    });

    //stop all sounds from this emitter
    component.$on('engine.destroy', function() {
        audio.clearActive(gameObject.id);
    });
};
Javelin.Component.AudioEmitter.alias = 'audioEmitter';
Javelin.Component.AudioEmitter.requires = ['transform2d'];
;'use strict';

Javelin.Component.AudioListener = function(gameObject, component) {
    component.range = 100;
    component.dropoff = 50;
    
    component.getAudioNode = function() {};
    //TODO: filters
};
Javelin.Component.AudioListener.alias = 'audioListener';
Javelin.Component.AudioListener.requires = ['transform2d'];
;/*global Box2D:true */

'use strict';

/**
 * The `rigidbody2d` component provides a wrapper for methods in the Box2D API.
 * 
 * @author Evan Villemez
 */
Javelin.Component.Rigidbody2d = function(gameObject, component) {
    var box2d = gameObject.engine.getPlugin('box2d');
    //the gameObject's transform
    var transform = gameObject.getComponent('transform2d');
    var debug = gameObject.engine.debug;
    
    //box2d stuff used internally
    var bodyDef = null;
    var fixtureDef = null;
    var body = null;
    var fixture = null;    
    
    //these values are applied to the box2d fixture definition
    component.trigger = false;
    component.static = false;
    component.bullet = false;
    component.density = 1.0;
    component.friction = 0.0;
    component.restitution = 0.0;
    component.damping = 0.2;
    component.angularDamping = 0.3;
    component.fixedRotation = false;
    component.radius = null;
    component.shape = null; //array of custom shape points
    component.height = null;
    component.width = null;
    
    component.applyForce = function(degrees, power) {
        body.ApplyForce(new box2d.Vec2(Math.cos(degrees * Javelin.PI_OVER_180) * power, Math.sin(degrees * Javelin.PI_OVER_180) * power), body.GetWorldCenter());
    };

    component.applyForceForward = function(amount) {
        component.applyForce(transform.rotation, amount);
    };

    component.applyForceBackward = function(amount) {
        component.applyForce((transform.rotation + 180 % 360), amount);
    };

    component.applyForceLeft = function(amount) {
        component.applyForce((transform.rotation - 90 % 360), amount);
    };

    component.applyForceRight = function(amount) {
        component.applyForce((transform.rotation + 90 % 360), amount);
    };

    component.applyImpulse = function(degrees, power) {
        body.ApplyImpulse(new box2d.Vec2(Math.cos(degrees * Javelin.PI_OVER_180) * power, Math.sin(degrees * Javelin.PI_OVER_180) * power), body.GetWorldCenter());
    };

    component.applyImpulseForward = function(amount) {
        component.applyImpulse(transform.rotation, amount);
    };

    component.applyImpulseBackward = function(amount) {
        component.applyImpulse((transform.rotation + 180 % 360), amount);
    };

    component.applyImpulseLeft = function(amount) {
        component.applyImpulse((transform.rotation - 90 % 360), amount);
    };

    component.applyImpulseRight = function(amount) {
        component.applyImpulse((transform.rotation + 90 % 360), amount);
    };
    
    component.applyRotationForce = function(force) {
        body.ApplyTorque(force);
    };
    
    component.applyRotationImpulse = function(force) {
        //TODO - is this available?
    };

    component.setVelocity = function(degrees, amount) {
        body.SetLinearVelocity(new box2d.Vec2(Math.cos(degrees * Javelin.PI_OVER_180) * amount, Math.sin(degrees * Javelin.PI_OVER_180) * amount));
    };
    
    component.setVelocityForward = function(amount) {
        component.setVelocity(transform.rotation, amount);
    };
    component.setVelocityBackward = function(amount) {
        component.setVelocity((transform.rotation + 180 % 360), amount);
    };
    component.setVelocityLeft = function(amount) {
        component.setVelocity((transform.rotation - 90 % 360), amount);
    };
    component.setVelocityRight = function(amount) {
        component.setVelocity((transform.rotation + 90 % 360), amount);
    };
    
    component.getVelocity = function() {
        return body.GetLinearVelocity();
    };

    //TODO: fill in API
    component.setAngularVelocity = function() {};
    component.getAngularVelocity = function() {};
    component.getInertia = function() {};
    component.teleport = function() {};
    
    component.reset = function() {
        //take into account potentially modified
        //component values - meaning change the fixture/body
        //reset mass data etc...
    };
    
    component.createBodyDefinition = function() {
        //create body definition
        bodyDef = new box2d.BodyDef();
        bodyDef.type = (component.static) ? box2d.Body.b2_staticBody : box2d.Body.b2_dynamicBody;
        bodyDef.position.x = transform.position.y;
        bodyDef.position.y = transform.position.y;
        bodyDef.angle = transform.rotation;
        bodyDef.linearDamping = component.damping;
        bodyDef.angularDamping = component.angularDamping;
        bodyDef.fixedRotation = component.fixedRotation;
        bodyDef.bullet = component.bullet;
        bodyDef.userData = gameObject;
        
        return bodyDef;
    };
    
    component.createFixtureDefinition = function() {
        //create fixture definition
        fixtureDef = new box2d.FixtureDef();
        fixtureDef.density = component.density;
        fixtureDef.restitution = component.restitution;
        fixtureDef.friction = component.friction;
        if (component.trigger) {
            fixtureDef.isSensor = true;
        }
//        fixtureDef.mass = component.mass;

        //set the fixture's shape - oooh boy.
        fixtureDef.shape = component.createFixtureShape();
        
        return fixtureDef;
    };
    
    //this mostly taken from gritsgame source - thanks!
    component.createFixtureShape = function() {
        //TODO: take into account scaling
        var shape;
        
        if (component.radius) {
            shape = new box2d.CircleShape(component.radius);
            return shape;
        } else if (component.shape) {
            var points = component.shape;
            var vecs = [];
            for (var i = 0; i < points.length; i++) {
              var vec = new box2d.Vec2();
              vec.Set(points[i].x, points[i].y);
              vecs[i] = vec;
            }
            shape = new box2d.PolygonShape();
            shape.SetAsArray(vecs, vecs.length);
            return shape;
        } else {
            if (component.height && component.width) {
                shape = new box2d.PolygonShape();
                shape.SetAsBox(component.width * 0.5, component.height * 0.5);
                return shape;
            } else if (gameObject.hasComponent('sprite')) {
                var img = gameObject.getComponent('sprite').image;
                if (img) {
                    shape = new box2d.PolygonShape();
                    shape.SetAsBox(img.width * 0.5, img.height * 0.5);
                    return shape;
                } else {
                    throw new Error("Cannot create rigidbody shape.");
                }
            } else {
                throw new Error("Cannot create rigidbody shape.");
            }
        }
    };
    
    component.setBody = function(newBody) {
        body = newBody;
    };
    
    component.getBody = function() {
        return body;
    };
    
    component.setFixture = function(newFixture) {
        fixture = newFixture;
    };
    
    component.getFixture = function() {
        return fixture;
    };
    
    component.updateLocation = function() {
        var pos = body.GetPosition();
        transform.position.x = pos.x;
        transform.position.y = pos.y;
        if (!component.fixedRotation) {
            transform.rotation = body.GetAngle();
        }
    };
    
    component.$on('engine.create', function() {
        //get references to stuff
        transform = gameObject.getComponent('transform2d');
        box2d = gameObject.engine.getPlugin('box2d');
        body.SetPosition(new box2d.Vec2(transform.position.x, transform.position.y));
        body.SetAngle(transform.rotation);
        body.ResetMassData();
    });
    
    component.$on('box2d.lateUpdate', function(deltaTime) {
        component.updateLocation();
    });
    
    if (debug) {
        component.$on('canvas2d.draw', function(context, camera) {
            context.save();
            context.translate(transform.position.x, transform.position.y);
            context.rotate(transform.rotation * Javelin.PI_OVER_180);
            context.strokeStyle = component.trigger ? '#FF0' : '#0F0';

            //draw center of transform
            context.beginPath();
            context.arc(0, 0, 3, 0, 2 * Math.PI, true);
            context.closePath();
            context.stroke();

            //draw sprite image bounding box
            if (component.image) {
                var img = component.image;
                var topLeftX = 0 - (img.width * 0.5);
                var topLeftY = 0 - (img.height * 0.5);
                var height = img.height;
                var width = img.width;
        
                context.strokeRect(topLeftX, topLeftY, width, height);
            }
            
            if (component.radius) {                
                context.beginPath();
                context.arc(0, 0, component.radius, 0, 2 * Math.PI, true);
                context.closePath();
                context.stroke();
            } else if (component.height && component.width) {
                context.strokeRect(
                    -component.width * 0.5,
                    -component.height * 0.5,
                    component.width,
                    component.height
                );
            } else if (component.shape) {
                //TODO
            }
            
            context.restore();
        });
    }
    
};
Javelin.Component.Rigidbody2d.alias = 'rigidbody2d';
Javelin.Component.Rigidbody2d.requires = ['transform2d'];
;'use strict';

/**
 * The `sprite` component will let you associate an image asset with a gameObject.  The `image` property can be
 * either an `Image` instance, or an instance of `Javelin.Asset.AtlasImage`.  Images can also specify a scale.
 *
 * @class Javelin.Component.Sprite
 * @javelinComponent sprite
 * @author Evan Villemez
 */
Javelin.Component.Sprite = function(gameObject, component) {
    
    component.imagePath = null;
    component.atlasPath = null;
    
    //can be Image or Javelin.Asset.AtlasImage
    component.image = null;
    component.visible = true;

    //how much to scale the image in x and y directions
    component.scale = {
        x: 1.0,
        y: 1.0
    };
    
    var debug = false;
    var transform = null;
    
    component.$on('engine.create', function() {
        if (gameObject.engine && gameObject.engine.debug) {
            debug = true;
        }
        
        transform = gameObject.getComponent('transform2d');
        
        //load image if specified
        if (component.imagePath) {
            gameObject.disable();
            if (component.atlasPath) {
                gameObject.engine.loadAsset(component.atlasPath, function(atlas) {
                    component.image = atlas.images[component.imagePath];
                    gameObject.enable();
                });
            } else {
                gameObject.engine.loadAsset(component.imagePath, function(image) {
                    component.image = image;
                    gameObject.enable();
                });
            }
        }
    });
    
    //actually draw the designated image on the canvas - the image could either be a regular image, or
    //an instance of Javelin.Asset.AtlasImage
    component.$on('canvas2d.draw', function(context, camera) {
        if (component.image) {
            var pos = transform.position;
            var rot = transform.getWorldRotation();
        
            context.save();

            //TODO: take into account camera position and return if sprite is not visible, set visible to false
            //move canvas to draw the image in proper location
            context.translate(
                pos.x,
                pos.y
            );
            
            //convert degrees to radians and rotate the canvas
            context.rotate(rot * Javelin.PI_OVER_180);

            var scale = component.scale;

            if (component.image instanceof Javelin.Asset.AtlasImage) {
                var spr = component.image;

                //draw the image fo' reals
                context.drawImage(
                    spr.image,
                    spr.x,
                    spr.y,
                    spr.width,
                    spr.height,
                    +spr.cx * scale.x,
                    +spr.cy * scale.y,
                    spr.width * scale.x,
                    spr.height * scale.y
                );
            } else {
                var cx, cy;
                
                //TODO: would be good to do this
                //once when it loads - or when set
                //in the sprite component
                cx = component.image.height * 0.5;
                cy = component.image.width * 0.5;
                
                var h = component.image.height * component.scale.y;
                var w = component.image.width * component.scale.x;
                context.drawImage(
                    component.image,
                    -cx * component.scale.x,
                    -cy * component.scale.y,
                    w,
                    h
                );
            }
            
            //draw debug center and bounding boxes
            if (debug) {
                context.strokeStyle = '#F00';

                //draw center of transform
                context.beginPath();
                context.arc(0, 0, 3, 0, 2 * Math.PI, true);
                context.closePath();
                context.stroke();
    
                //draw sprite image bounding box
                if (component.image) {
                    var img = component.image;
                    var topLeftX = 0 - (img.width * 0.5) * scale.x;
                    var topLeftY = 0 - (img.height * 0.5) * scale.y;
                    var height = img.height * scale.x;
                    var width = img.width * scale.y;
            
                    context.strokeRect(topLeftX, topLeftY, width, height);
                }
            }
            
            context.restore();
        }
    });
    
};
Javelin.Component.Sprite.alias = "sprite";
Javelin.Component.Sprite.requires = ['transform2d'];
;'use strict';

/**
 * This component is used to define sprite animations.  You can define many animations and reference them by
 * by name.  Every frame, the animator will pick the set the appropriate image to be rendered on the sprite
 * component.
 *
 * @author Evan Villemez
 */
Javelin.Component.SpriteAnimator = function(gameObject, component) {
    component.animations = null;
    component.defaultAnimation = null;
    
    //private
    var sprite = gameObject.getComponent('sprite');
    var animations = {};
    var currentFrame = 0;
    var currentAnimation = null;
    var animating = true;
    var playOnce = true;
    var playOnceCallback = null;
    
    //public api
    component.getCurrentAnimation = function() {
        return currentAnimation;
    };
    
    //TODO: flesh out defining animations a little more, there are other options that
    //should be supported
    component.define = function(name, images) {
        animations[name] = images;
        
        if (!component.defaultAnimation) {
            component.defaultAnimation = name;
        }

        //also, allow a time in ms to be set per animation
        //then update can figure out when to switch frames
    };
    
    component.getCurrentAnimation = function() {
        return currentAnimation;
    };

    //start, if not already playing
    component.play = function(name) {
        animating = true;
        playOnce = false;
        currentFrame = 0;
        currentAnimation = name;
    };
    
    component.playOnce = function(name, callback) {
        animating = true;
        playOnce = true;
        currentAnimation = name;
        playOnceCallback = callback;
    };
    
    //start from beginning
    component.start = function(name) {
        animating = true;
        
    };
    
    //once
    component.startOnce = function(name) {
        animating = true;
        
    };
    
    //stop playing
    component.stop = function() {
        animating = false;
    };
    
    //set default
    component.setDefaultAnimation = function(name) {
        
    };
    
    //if component.animations is defined, automatically load
    //and define the animations
    component.$on('engine.create', function() {
        if (component.animations) {
            var numLoaded = 0;
            var numTotal = 0;
            sprite.visible = false;
            
            for (var name in component.animations) {
                numTotal++;
                if (component.animations[name].atlasPath) {
                    gameObject.engine.loadAsset(component.animations[name].atlasPath, function(atlas) {
                        var imgs = [];
                        for (var index in component.animations[name].frames) {
                            imgs.push(atlas.images[component.animations[name].frames[index]]);
                        }
                        
                        component.define(name, imgs);
                        numLoaded++;
                       
                       if (numLoaded === numTotal) {
                           gameObject.enable();
                           sprite.visible = true;
                       }
                    });
                } else {
                    gameObject.engine.loadAssets(component.animations[name].frames, function(images) {
                        component.define(name, images);
                        numLoaded++;
                        if (numLoaded === numTotal) {
                            gameObject.enable();
                            sprite.visible = true;
                        }
                    });
                }
            }
        }
    });
    
    //each frame, figure out which image to draw
    component.$on('engine.update', function(deltaTime) {
        if (sprite.visible && animating) {
            var current = currentAnimation || component.defaultAnimation;
            var anim = animations[current];
            
            //TODO: write proper logic
            
            //play the current animation by switching
            //to the appropriate sprite
            sprite.image = anim[currentFrame];
            
            //increment frames
            currentFrame = (currentFrame + 1) % anim.length;
            
            //check if this is a play once, call any given callbacks if so
            if (currentFrame === 0 && playOnce) {
                playOnce = false;
                if (playOnceCallback) {
                    currentAnimation = component.defaultAnimation;
                    playOnceCallback();
                }
            }
        }
    });
};
Javelin.Component.SpriteAnimator.alias = "spriteAnimator";
Javelin.Component.SpriteAnimator.requires = ['sprite'];
;'use strict';

/**
 * The `transform2d` component contains 2d position and rotation information.  It also contains helper methods
 * for adjusting those values.  For example, during an update frame, to easily move an object forward, relative
 * to its rotation, you could get this component and call `transformForward`: 
 * 
 *  gameOjbect.getComponent('transform2d').transformForward(50 * deltaTime);
 * 
 * @class Javelin.Component.Transform2d
 * @javelinComponent transform2d
 * @author Evan Villemez
 */
Javelin.Component.Transform2d = function(gameObject, component) {
    //private reference to parent transform
    var parentTransform;
    
    /**
     * An object containing the position x and y values.  It can be set directly:
     * 
     *  gameObject.getComponent('transform2d').position = {x: 50, y: 50};
     * 
     * @property {Object} X and Y coordinate position values
     */    
    component.position =  {
        x: 0.0,
        y: 0.0
    };
    
    /**
     * @property {Number} Rotation value in degrees.
     */    
    component.rotation = 0.0;
    
    //absolute world coordinates
    component.getWorldX = function() {
        return (parentTransform) ? parentTransform.position.x + component.position.x : component.position.x;
    };
    
    component.getWorldY = function() {
        return (parentTransform) ? parentTransform.position.y + component.position.y : component.position.y;
    };
    
    component.getWorldRotation = function() {
        return (parentTransform) ? parentTransform.rotation + component.rotation : component.rotation;
    };

    /**
     * Move the gameObject by adjusting the X and Y position values.
     *
     * @param {Number} X The amount to increment or decrement the position.x value
     * @param {Number} Y The amount to increment or decrement the position.y value
     */    
    component.translate = function(x, y) {
        x = x || 0.0;
        y = y || 0.0;
        
        component.position.x += x;
        component.position.y += y;
    };
    
    /**
     * Rotate the gameObject a certain number of degrees.
     *
     * @param {Number} degrees The number of degrees to rotate the object
     */    
    component.rotate = function(degrees) {
        degrees = degrees || 0.0;
        
        component.rotation = component.rotation + degrees % 360;
    };

    /**
     * Translate the gameObject forward according to its rotation.
     * 
     * @param {Number} amount The amount to move the gameObject
     */    
    component.translateForward = function(amount) {
        var radians = component.rotation * Javelin.PI_OVER_180;
        var x = Math.cos(radians) * amount;
        var y = Math.sin(radians) * amount;
        component.translate(x, y);
    };
    
    /**
     * Translate the gameObject backward according to its rotation.
     * 
     * @param {Number} amount The amount to move the gameObject
     */    
    component.translateBackward = function(amount) {
        var radians = component.rotation * Javelin.PI_OVER_180;
        var x = -Math.cos(radians) * amount;
        var y = -Math.sin(radians) * amount;
        component.translate(x, y);
    };
    
    component.translateRight = function(amount) {
        //TODO
    };
    
    component.translateLeft = function(amount) {
        //TODO
    };
    
    /**
     * Rotate the gameObject a certain number of degrees.
     *
     * @param {Number} degrees The number of degrees to rotate the object
     */    
    component.rotate = function(degrees) {
        degrees = degrees || 0.0;
        
        component.rotation = component.rotation + degrees % 360;
    };
    
    component.$on('engine.create', function() {
        //if there's a parent, cache it's transform
        parentTransform = (gameObject.parent) ? gameObject.parent.getComponent('transform2d') : false;
    });
};
Javelin.Component.Transform2d.alias = 'transform2d';
;'use strict';

/**
 * The AssetLoader returns objects based on string filepaths.  The object is loaded
 * by a function mapped to the file extension.
 *
 * Note: This implementation is likely to drastically change - it kinda sucks as it is, and is going
 * to get increasingly messy.
 * 
 * Ultimately, how an asset is loaded should be determined by the "environment".  So, a lot of this
 * functinoality will probably move or be implemented differently.  However, the API for actual
 * games creaters is probably correct, so that should stay as it is.
 */
Javelin.AssetLoader = function(basePath) {
    this.assets = {};
    this.baseAssetPath = basePath;
    
    //generic image loader
    var imageLoader = function(loader, relPath, absPath, callback) {
        var img = new Image();
        img.onabort =
        img.onerror =
        img.onload = function() {
            loader.register(relPath, img);
            callback(img);
        };
        img.src = absPath;
    };
    
    //image atlas loader
    var imageAtlasLoader = function(loader, relPath, absPath, callback) {
        var json, img, imgPath;
        var rp = relPath;
        imgPath = rp.substring(0, rp.lastIndexOf("/"));

        var createAtlas = function() {
            var atlas = new Javelin.Asset.TexturePackerAtlas(json, img);
            loader.register(relPath, atlas);
            callback(atlas);
        };

        var loadJsonCallback = function(item) {
            json = item;            
            var imagePath = imgPath + "/" + json.meta.image;
            loader.loadAsset(imagePath, loadImageCallback);
        };
                
        var loadImageCallback = function(item) {
            img = item;
            createAtlas();
        };
        
        //start by loading the json, will trigger series of callbacks
        loader.loadAssetAsType(relPath, 'json', loadJsonCallback);
    };
    
    var tiledMapLoader = function(loader, relPath, absPath, callback) {
        throw new Error("Tiled map loading not yet implemented.");
    };
    
    //generic json file loader
    var jsonLoader = function(loader, relPath, absPath, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", absPath, true);
        xhr.onload = function() {
            var json = JSON.parse(this.responseText);
            loader.register(relPath, json);
            callback(json);
        };
        xhr.send();
    };
    
    //generic file loader
    var soundLoader = function(loader, relPath, absPath, callback) {
        console.log(relPath);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", absPath, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            loader.register(relPath, xhr.response);
            callback(xhr.response);
        };
        xhr.send();
    };
    
    //map loader functions to types, note more specific extensions
    //should be declared before more general, otherwise
    //they will never be matched because they are checked
    //in the order defined
    this.loaders = {
        'png': imageLoader,
        'jpg': imageLoader,
        'atlas.json': imageAtlasLoader,
        'map.json': tiledMapLoader,
        'json': jsonLoader,
        'ogg': soundLoader,
        'mp3': soundLoader
    };
};

/**
 * Load an individual asset by path.  Your call back will be called with the loaded
 * object once completed.
 * 
 * @param {string} path Relative path to asset
 * @param {function} callback Callback function to call with the requested asset object
 */
Javelin.AssetLoader.prototype.loadAsset = function(path, callback) {
    var cached = this.assets[path] || false;
    if (cached) {
        callback(cached);
    }
    
    this.getLoaderForPath(path)(this, path, this.baseAssetPath + path, callback);
};

/**
 * Load an asset as if it were an explicitly defined type.  This means it won't
 * dynamically choose how to load the asset based on the filename.
 *
 * @param {String} path Relative path to asset
 * @param {String} type Type to use for loader, generally a file extension
 * @param {Function} callback Callback to call once loading is complete
 */
Javelin.AssetLoader.prototype.loadAssetAsType = function(path, type, callback) {
    if(!this.loaders[type]) {
        throw new Error("Unknown asset loader type.");
    }
    
    this.loaders[type](this, path, this.baseAssetPath + path, callback);
};

/**
 * Load an array of assets by path.  The given callback will be called with the array
 * of loaded assets in the same order as the requested paths.
 * 
 * @param {array} arr Array of string paths (relative)
 * @param {function} callback Callback function to call with the array of loaded assets
 */
Javelin.AssetLoader.prototype.loadAssets = function(arr, callback) {
    var assets = this.assets;
    var expected = arr.length;
    var loaded = 0;
    
    //register function keeps loaded assets in the order
    //they were requested
    var register = function(relPath, obj) {
        loaded++;
        assets[arr.indexOf(relPath)] = obj;
        
        //if everything has loaded, call the user's callback
        if (loaded === expected && callback) {
            var sorted = [];
            for (var i in arr) {
                sorted.push(assets[arr[i]]);
            }
            
            callback(sorted);
        }
    };
    
    //load individual asset, calling custom register function when done
    for (var i in arr) {

        //warning: yes, I'm creating a function in a loop, and jshint tells
        //me it's bad, feel free to refactor :)
        this.loadAsset(arr[i], function(obj) {
            register(arr[i], obj);
        });
    }
};

/**
 * Explicitly register an object to an asset path.  Any requests for an asset at that path
 * will return the registered object.
 * 
 * @param {string} path The path to register
 * @param {Object} obj The object to register
 */
Javelin.AssetLoader.prototype.register = function(relPath, obj) {
    this.assets[relPath] = obj;
};

/**
 * Unload an asset from memory, any subsequent request will have to reload it.
 * 
 * @param {String} relPath Path of the asset to unload
 */
Javelin.AssetLoader.prototype.unload = function(relPath) {
    this.assets[relPath] = null;
};

/**
 * Will return the function used for loading an asset of the given type, based on file extension.
 * 
 * @param {String} path Path to asset file
 * @returns The function that should be called to load the file of the given type
 * @type Function
 */
Javelin.AssetLoader.prototype.getLoaderForPath = function(path) {
    for (var key in this.loaders) {
        if (path.substring(path.length - key.length) === key) {
            return this.loaders[key];
        }
    }

    throw new Error("No applicable loader for path [" + path + "] found!");
};
;'use strict';

Javelin.Dispatcher = function() {
    this.listeners = {};
};

Javelin.Dispatcher.prototype.on = function(name, listener) {
    this.listeners[name] = this.listeners[name] || [];
    
    this.listeners[name].push(listener);
};

Javelin.Dispatcher.prototype.dispatch = function(name, data) {
    var cbs = this.listeners[name] || [];
    var l = cbs.length;

    for (var i = 0; i < l; i++) {
        if (false === cbs[i](data)) {
            return false;
        }
    }

    return true;
};
;/*global Javelin:true */

'use strict';

Javelin.Engine = function(environment, config) {
    //this should persist
    this.config = config;
    this.debug = config.debug || false;
    this.targetFps = config.stepsPerSecond || 1000/30;
    this.environment = environment;
    this.environment.engine = this;
    this.initialized = false;
    this.dispatcher = new Javelin.Dispatcher();
    
    //everything else can be reset
    this.reset();
};

//constant flags
Javelin.Engine.PRE_UPDATE = 0;
Javelin.Engine.POST_UPDATE = 1;

Javelin.Engine.prototype.reset = function() {
    //general state
    this.running = false;
    this.loading = false;
    this.updating = false;
    this.isRunningSlowly = false;
    this.currentFps = 0.0;
    this.lastUpdateTimeTaken = 0.0;

    //game object
    this.gos = [];
    this.lastGoId = 0;
    this.createdGos = [];
    this.destroyedGos = [];

    //timing
    this.stepId = 0;
    this.time = new Date().getTime();
    this.prevTime = 0.0;
    this.deltaTime = 0.0;

    //scene
    this.sceneDefinition = {};
    this.plugins = {};
    this.currentScene = false;

    //configure the loader
    //TODO: think of better way to do this, possibly require it
    //via the environment
    if (this.config.loader) {
        this.loader = new Javelin.AssetLoader(this.config.loader.assetUrl || '');
        if (this.config.preLoad) {
            this.loader.loadAssets(this.config.preLoad);
        }
    }
    
};

/* Managing Game Objects */

Javelin.Engine.prototype.getGameObjectById = function(id) {
    var l = this.gos.length;
    for (var i = 0; i < l; i++) {
        if (this.gos[i].id === id) {
            return this.gos[i];
        }
    }

    return false;
};

Javelin.Engine.prototype.instantiate = function(mixed) {
    if (Javelin.isString(mixed)) {
        return this.instantiatePrefab(mixed);
    }
    
    return this.instantiateObject(mixed);
};

//takes a string
Javelin.Engine.prototype.instantiatePrefab = function(name) {
    if (!Javelin.__prefabs[name]) {
        throw new Error("Tried instantiating unknown prefab: " + name);
    }
    
    return this.instantiateObject(Javelin.__prefabs[name]);
};

Javelin.Engine.prototype.instantiateObject = function(def, isNestedCall) {
    var go;
    
    //instantiate game object
    if (def.fromPrefab) {
        //it's not really nested, but we say it is to avoid this call
        //adding dupliate copies of the object
        go = this.instantiateObject(Javelin.__prefabs[def.fromPrefab], true);
    } else {
        go = new Javelin.GameObject();
        go.layer = def.layer || 'default';
        go.name = def.name || 'Anonymous';
        go.tags = def.tags || [];
    }

    go.setId(++this.lastGoId);
    go.engine = this;
    
    //add required components w/ values
    if (def.components) {
        for (var key in def.components) {
            var c = this.addComponentToGameObject(go, key);
            c.$unserialize(def.components[key]);
        }
    }
    
    //instantiate children
    if (def.children) {
        for (var i in def.children) {
            go.addChild(this.instantiateObject(def.children[i], true));
        }
    }
    
    if (!isNestedCall) {
        this.__addGameObject(go);
    }
    
    return go;
};

Javelin.Engine.prototype.addComponentToGameObject = function(go, alias) {
    if (go.hasComponent(alias)) {
        return go.getComponent(alias);
    }
        
    //add any required components first
    var reqs = Javelin.getComponentRequirements(alias);
    var l = reqs.length;
    for (var i = 0; i < l; i++) {
        this.addComponentToGameObject(go, reqs[i].alias);
    }
    
    var handler = Javelin.getComponentHandler(alias);
    if (!handler) {
        throw new Error("Unknown component [" + alias + "] requested");
    }

    var comp = new Javelin.GameObjectComponent();
    comp.$id = go.id;
    comp.$go = go;
    comp.$alias = handler.alias;

    handler(go, comp);

    go.setComponent(alias, comp);
    
    return comp;
};

Javelin.Engine.prototype.__addGameObject = function(go) {
    if (this.updating && go.isRoot()) {
        this.createdGos.push(go);
    } else {
        this.gos.push(go);

        this.pluginsOnGameObjectCreate(go);
        
        if (go.children.length) {
            for (var i in go.children) {
                this.__addGameObject(go.children[i]);
            }
        }

        if (go.isRoot()) {
            go.enable();
            
            this.pluginsOnPrefabCreate(go);

            var cbs = go.getCallbacks('engine.create', true) || [];
            for (var j = 0; j < cbs.length; j++) {
                cbs[j]();
            }
        }
    }
};

//destroy an object (if the engine is updating, it will be destroyed after the update is done)
Javelin.Engine.prototype.destroy = function(go, destroyingNested) {
    if (this.updating) {
        this.destroyedGos.push(go);
    } else {
        var i;
        
        if (!destroyingNested) {
            //notify destroy callbacks
            var cbs = go.getCallbacks('engine.destroy', true);
            for (i = 0; i < cbs.length; i++) {
                cbs[i]();
            }
            
            this.pluginsOnPrefabDestroy(go);
        }
        
        //destroy children first
        if(go.children) {
            //copy into separate array so we can abandon now
            var children = [];
            for (i in go.children) {
                children.push(go.children[i]);
            }
            go.abandonChildren();

            //destroy children
            for (i in children) {
                this.destroy(children[i], true);
            }
        }

        //notify plugins
        this.pluginsOnGameObjectDestroy(go);
        
        //make sure this object is detached from any parents, 
        //because we abandoned and deleted children already,
        //this should only be the case if this go is a child of
        //another object that is NOT being deleted
        if (go.parent) {
            go.parent.removeChild(go);
        }

        //remove references
        go.setId(-1);
        go.engine = null;
        
        //remove from engine
        var index = this.gos.indexOf(go);
        this.gos.splice(index, 1);
    }
};

/* Game Loop & State */

//This must be called before loading and running scenes
Javelin.Engine.prototype.initialize = function() {
    var func;
    var obj;
    
    if (this.config.autoregisterPlugins) {
        for (func in this.config.autoregisterPlugins) {
            Javelin.registerPlugin(this.config.autoregisterPlugins[func]);
        }
    }
    
    if (this.config.autoregisterComponents) {
        for (func in this.config.autoregisterComponents) {
            Javelin.registerComponent(this.config.autoregisterComponents[func]);
        }
    }
    
    if (this.config.autoregisterPrefabs) {
        for (obj in this.config.autoregisterPrefabs) {
            Javelin.registerPrefab(this.config.autoregisterPrefabs[obj]);
        }
    }
    
    if (this.config.autoregisterScenes) {
        for (obj in this.config.autoregisterScenes) {
            Javelin.registerScene(this.config.autoregisterScenes[obj]);
        }
    }

    //build up maps of component dependencies and whatever else
    Javelin.initialize();
    
    //TODO: load required assets
    
    this.initialized = true;
};

Javelin.Engine.prototype.run = function() {
    this.running = true;
    this.environment.run(this.targetFps);
};

Javelin.Engine.prototype.stop = function(callback) {
    this.environment.stop(callback);
    this.running = false;
};

Javelin.Engine.prototype.step = function() {
    this.updating = true;
    this.stepId++;
    this.prevStepTime = this.time;
    this.time = new Date().getTime();
    this.deltaTime = (this.time - this.prevStepTime) * 0.001;
    
    //some plugins process before GO udpates
    this.updatePlugins(Javelin.Engine.PRE_UPDATE, this.deltaTime);
    
    this.updateGameObjects(this.deltaTime);
    
    //some process after
    this.updatePlugins(Javelin.Engine.POST_UPDATE, this.deltaTime);
    this.updating = false;

    //clean now, so next step contains the modifications
    //from this step
    this.cleanupStep();

    this.lastUpdateTimeTaken = new Date().getTime() - this.time;
    
    if(this.lastUpdateTimeTaken > this.targetFps) {
        this.isRunningSlowly = true;
    } else {
        this.isRunningSlowly = false;
    }
    
};

Javelin.Engine.prototype.stats = function() {
    console.log("Updated  " + this.gos.length + ' gos in ' + this.lastUpdateTimeTaken + 'ms, targeting ' + Math.floor(this.targetFps) + ' fps; DT: ' + this.deltaTime + ' seconds.');
};

Javelin.Engine.prototype.updateGameObjects = function(deltaTime) {
    var l = this.gos.length;
    for (var i = 0; i < l; i++) {

        //TODO: only process root level objects,
        //the callbacks can be retrieved recursively
        //for nested hierarchies, which will allow
        //for efficient caching
        if (this.gos[i].enabled) {
            var cbs = this.gos[i].getCallbacks('engine.update', false);
            for (var j = 0; j < cbs.length; j++) {
                cbs[j](deltaTime);
            }
        }
    }
};

Javelin.Engine.prototype.updatePlugins = function(which, deltaTime) {
    for (var i in this.plugins) {
        if (this.plugins[i].$active) {
            if (Javelin.Engine.PRE_UPDATE === which) {
                this.plugins[i].$onPreUpdateStep(deltaTime);
            }
            
            if (Javelin.Engine.POST_UPDATE === which) {
                this.plugins[i].$onPostUpdateStep(deltaTime);
            }
        }
    }
};

Javelin.Engine.prototype.cleanupStep = function() {
    var lc = this.createdGos.length;
    var ld = this.destroyedGos.length;
    var i;

    if (lc) {
        for (i = 0; i < lc; i++) {
            this.__addGameObject(this.createdGos[i]);
        }
    }
    
    if (ld) {
        for (i = 0; i < ld; i++) {
            this.destroy(this.destroyedGos[i]);
        }
    }
    
    this.createdGos = [];
    this.destroyedGos = [];
};

Javelin.Engine.prototype.pluginsOnGameObjectCreate = function(go) {
    for (var i in this.plugins) {
        this.plugins[i].$onGameObjectCreate(go);
    }
};

Javelin.Engine.prototype.pluginsOnGameObjectDestroy = function(go) {
    for (var i in this.plugins) {
        this.plugins[i].$onGameObjectDestroy(go);
    }
};

Javelin.Engine.prototype.pluginsOnPrefabCreate = function(go) {
    for (var i in this.plugins) {
        this.plugins[i].$onPrefabCreate(go);
    }
};

Javelin.Engine.prototype.pluginsOnPrefabDestroy = function(go) {
    for (var i in this.plugins) {
        this.plugins[i].$onPrefabDestroy(go);
    }
};

/* Scene management */

Javelin.Engine.prototype.getCurrentScene = function() {
    return this.currentScene;
};

Javelin.Engine.prototype.loadScene = function(name, callback) {
    //don't load a scene if it's still running - shutdown first
    if (this.running) {
        var engine = this;
        this.stop(function() {
            engine.unloadScene();
            engine.loadScene(name, callback);
        });
        
        return;
    }
    this.loading = true;
    
    this.reset();
    
    if(!this.initialized) {
        this.initialize();
    }
    
    var scene = Javelin.getScene(name);
    
    if(!scene) {
        throw new Error("Tried loading unregistered scene: " + name);
    }

    this.sceneDefinition = scene;
    this.currentScene = name;
    
    //load plugins defined in scene - otherwise, check main config
    var alias;
    if (scene.plugins) {
        for (alias in scene.plugins) {
            var config = !Javelin.isEmpty(scene.plugins[alias]) ? scene.plugins[alias] : {};
            this.loadPlugin(alias, config);
        }
    } else {
        for (alias in this.config.plugins) {
            this.loadPlugin(alias, {});
        }
    }

    var engine = this;
    if (scene.preLoad) {
        this.loadAssets(scene.preLoad, function(assets) {
            engine.loading = false;
            for (var i = 0; i < scene.objects.length; i++) {
                engine.instantiate(scene.objects[i]);
            }
            if (callback) {
                callback();
            } else {
                engine.run();
            }
        });
    } else {
        engine.loading = false;
        for (var i = 0; i < scene.objects.length; i++) {
            this.instantiate(scene.objects[i]);
        }
        if (callback) {
            callback();
        } else {
            this.run();
        }
    }
};

Javelin.Engine.prototype.unloadScene = function() {
    this.unloadPlugins();
    this.reset();
};

/* Asset management */

Javelin.Engine.prototype.loadAsset = function(path, callback) {
    return this.loader.loadAsset(path, callback);
};

Javelin.Engine.prototype.loadAssets = function(arr, callback) {
    return this.loader.loadAssets(arr, callback);
};

/* Plugin Management */
Javelin.Engine.prototype.loadPlugin = function(alias, config) {
    if (this.plugins[alias]) {
        return;
    }
    
    var handler = Javelin.getPluginHandler(alias);
    if (!handler) {
        throw new Error("Required plugin [" + alias + "] not registered.");
    }
    
    if (Javelin.isEmpty(config)) {
        if (this.config && this.config.plugins && this.config.plugins[alias]) {
            config = this.config.plugins[alias];
        } else {
            config = handler.defaults || {};
        }
    }
    
    var plugin = new Javelin.EnginePlugin();
    plugin.$alias = handler.alias;
    plugin.$engine = this;
    
    handler(plugin, config);
    plugin.$onLoad();
    plugin.$active = true;
    this.plugins[plugin.$alias] = plugin;
};

Javelin.Engine.prototype.unloadPlugin = function(name) {
    var p = this.getPlugin(name);
    if(p) {
        p.$active = false;
        p.$onUnload();
        this.plugins[name] = null;
    }
};

Javelin.Engine.prototype.unloadPlugins = function() {
    for (var alias in this.plugins) {
        this.unloadPlugin(alias);
    }
};

Javelin.Engine.prototype.getPlugin = function(alias) {
    return this.plugins[alias] || false;
};

Javelin.Engine.prototype.on = function(event, callback) {
    this.dispatcher.on(event, callback);
};

Javelin.Engine.prototype.emit = function(event, data) {
    //just dispatch own events
    return this.dispatcher.dispatch(event, data);
};

Javelin.Engine.prototype.broadcast = function(event, data) {
    //dispatch own events first
    if(!this.dispatcher.dispatch(event, data)) {
        return false;
    }

    //then broadcast to root game objects
    for (var i in this.gos) {
        if (this.gos[i].isRoot()) {
            if (!this.gos[i].broadcast(event, data)) {
                return false;
            }
        }
    }
    
    return true;
};
;"use strict";

Javelin.EnginePlugin = function() {
    this.$alias = '';
    this.$active = false;
    this.$engine = null;
};

Javelin.EnginePlugin.prototype.$onLoad = function() {};

Javelin.EnginePlugin.prototype.$onUnload = function() {};

//TODO: implement & test this
Javelin.EnginePlugin.prototype.$onSceneLoaded = function() {};

/* GameObject Lifecycle */
Javelin.EnginePlugin.prototype.$onPreUpdateStep = function(deltaTime) {};

Javelin.EnginePlugin.prototype.$onPostUpdateStep = function(deltaTime) {};

Javelin.EnginePlugin.prototype.$onGameObjectDestroy = function(gameObject) {};

Javelin.EnginePlugin.prototype.$onGameObjectCreate = function(gameObject) {};

Javelin.EnginePlugin.prototype.$onPrefabCreate = function(gameObject) {};

Javelin.EnginePlugin.prototype.$onPrefabDestroy = function(gameObject) {};
;/*global Javelin:true */

/*
An interface (or something) for functionality that must be implemented in an environment-specific
manner.
*/


'use strict';

Javelin.Environment = function() {
    
};

Javelin.Environment.prototype.initialize = function() {};

Javelin.Environment.prototype.validatePlugin = function(plugin) {};

Javelin.Environment.prototype.run = function(stepsPerSecond) {};

Javelin.Environment.prototype.stop = function(callback) {};
;/*global Javelin:true */

'use strict';

Javelin.GameObject = function () {
    this.id = -1;                                   //UID assigned by engine
    this.name = "Anonymous";                        //human-readable name (for eventual editor)
    this.engine = null;                             //reference to engine
    this.enabled = false;                           //active flag
    this.components = {};                           //component instances
    this.children = [];                             //child gameobject instances
    this.parent = null;                             //parent gameobject instance
    this.dispatcher = new Javelin.Dispatcher();     //for emit/broadcast functionality
    this.root = null;                               //TODO: implement, if in a hierarchy, reference to root object in hierarcy
    this.modified = false;                          //whether or not the hierarchy or components have been modified
    this.ownCallbackCache = {};                     //cached callbacks from own components
    this.allCallbackCache = {};                     //cached callbacks from all children
    this.tags = [];                                 //string tags for categorizing objects
    this.layer = 'default';                         //for assigning groups of objects to specific layers (may be removed)
};

/* Lifecycle */

Javelin.GameObject.prototype.destroy = function() {
    if (this.engine) {
        this.engine.destroy(this);
    }
};

Javelin.GameObject.prototype.setId = function(id) {
    this.id = id;
    
    for (var alias in this.components) {
        this.components[alias].$id = id;
    }
};

Javelin.GameObject.prototype.enable = function() {
    this.enabled = true;

    if (this.children) {
        for (var index in this.children) {
            this.children[index].enable();
        }
    } else {
        //set modified bubbles up, so we only need to call it
        //if we don't have children
        this.setModified();
    }
};

Javelin.GameObject.prototype.disable = function() {
    this.enabled = false;
    
    if (this.children) {
        for (var index in this.children) {
            this.children[index].disable();
        }
    } else {
        //set modified bubbles up, so we only need to call it
        //if we don't have children
        this.setModified();
    }
};

/* Component management */

//explicitly set a component instance
Javelin.GameObject.prototype.setComponent = function(alias, component) {    
    component.$alias = alias;
    component.$id = this.id;
    this.components[alias] = component;

    this.setModified();
};

//micro optimization to set multiple components without having to call setModified() every time
Javelin.GameObject.prototype.setComponents = function(arr) {
    for (var i in arr) {
        var comp = arr[i];
        comp.$id = this.id;
        this.components[comp.$alias] = comp;
    }

    this.setModified();
};

Javelin.GameObject.prototype.getComponent = function(name) {
    return this.components[name] || false;
};

Javelin.GameObject.prototype.hasComponent = function(name) {
    if (this.components[name]) {
        return true;
    }
    
    return false;
};

Javelin.GameObject.prototype.getComponentsInChildren = function(name) {
    var components = [];
    
    for (var i = 0; i < this.children.length; i++) {
        var c = this.children[i];
        
        //check nested children recursively
        if (c.children) {
            var comps = c.getComponentsInChildren(name);
            for (var j = 0; j < comps.length; j++) {
                components.push(comps[j]);
            }
        }
        
        //get component of child
        var component = c.getComponent(name);
        if (component) {
            components.push(component);
        }
    }
        
    return components;
};

/* tag management */

Javelin.GameObject.prototype.hasTag = function(name) {
    return (-1 !== this.tags.indexOf(name));
};

Javelin.GameObject.prototype.addTag = function(name) {
    if (!this.hasTag(name)) {
        this.tags.push(name);
    }
};

Javelin.GameObject.prototype.removeTag = function(name) {
    if (this.hasTag(name)) {
        this.tags.splice(this.tags.indexOf(name), 1);
    }
};

Javelin.GameObject.prototype.getTags = function() {
    return this.tags;
};

Javelin.GameObject.prototype.getChildrenByTag = function(name, recursive) {
    var children = [];
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].hasTag(name)) {
            children.push(this.children[i]);
        }
        
        if (recursive) {
            var nested = this.children[i].getChildrenByTag(name, true);
            if (nested) {
                for (var j in nested) {
                    children.push(nested[j]);
                }
            }
        }
    }
    
    return children;
};


/* GO Hierarchy management */

Javelin.GameObject.prototype.isRoot = function() {
    return (null === this.root);
};

Javelin.GameObject.prototype.getRoot = function() {
    return (this.isRoot()) ? this : this.root;
};

Javelin.GameObject.prototype.setRoot = function(go) {
    this.root = go;
    for (var i in this.children) {
        this.children[i].setRoot(go);
    }
};

Javelin.GameObject.prototype.addChild = function(child) {
    //don't allow an object to be a child of more
    //that one parent
    if (child.parent) {
        child.parent.removeChild(child);
    }
    
    this.setModified();
    child.setModified();
    child.parent = this;
    child.setRoot(this.getRoot());
    this.children.push(child);
};

Javelin.GameObject.prototype.setParent = function(parent) {
    parent.addChild(this);
};

Javelin.GameObject.prototype.removeChild = function(child) {
    child.setModified();
    this.setModified();
    child.parent = null;
    this.children.splice(this.children.indexOf(child), 1);
};

Javelin.GameObject.prototype.leaveParent = function() {
    if (this.parent) {
        this.parent.removeChild(this);
    }
};

Javelin.GameObject.prototype.abandonChildren = function() {
    for (var i = 0; i < this.children.length; i++) {
        this.removeChild(this.children[i]);
    }
};

Javelin.GameObject.prototype.hasChildren = function() {
    return (this.children.length > 0);
};

Javelin.GameObject.prototype.hasParent = function() {
    return this.parent ? true : false;
};


/* Messaging */

Javelin.GameObject.prototype.on = function(name, listener) {
    this.dispatcher.on(name, listener);
};


Javelin.GameObject.prototype.emit = function(name, data) {
    if (this.dispatcher.dispatch(name, data)) {
        if (this.parent) {
            this.parent.emit(name, data);
        }
        if (this.isRoot() && this.engine) {
            this.engine.emit(name, data);
        }
    }
};

Javelin.GameObject.prototype.broadcast = function(name, data) {
    if (this.dispatcher.dispatch(name, data)) {
        if (this.children) {
            for (var i = 0; i < this.children.length; i++) {
                if (!this.children[i].broadcast(name, data)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    return false;
};

Javelin.GameObject.prototype.getCallbacks = function(eventName, recursive) {
    if (this.modified) {
        this.rebuildCallbackCache();
        this.modified = false;
    }
    
    return (recursive) ? this.allCallbackCache[eventName] || [] : this.ownCallbackCache[eventName] || [];
};

Javelin.GameObject.prototype.rebuildCallbackCache = function() {
    var key, cb, i, ownCallbacks = {};
    for (var comp in this.components) {
        for (key in this.components[comp].$callbacks) {
            ownCallbacks[key] = ownCallbacks[key] || [];
            ownCallbacks[key].push(this.components[comp].$callbacks[key]);
        }
    }
    
    this.ownCallbackCache = ownCallbacks;
    
    //clone own callbacks into new object
    var allCallbacks = {};
    for (key in ownCallbacks) {
        allCallbacks[key] = allCallbacks[key] || [];
        for (i in ownCallbacks[key]) {
            allCallbacks[key].push(ownCallbacks[key][i]);
        }
    }
    
    //now add all callbacks from children
    for (i in this.children) {
        var child = this.children[i];
        
        if (child.modified) {
            child.rebuildCallbackCache();
            child.modified = false;
        }
        
        for (var eventName in child.allCallbackCache) {
            allCallbacks[eventName] = allCallbacks[eventName] || [];
            
            for (i in child.allCallbackCache[eventName]) {
                allCallbacks[eventName].push(child.allCallbackCache[eventName][i]);
            }
        }
    }
    
    this.allCallbackCache = allCallbacks;
};

Javelin.GameObject.prototype.setModified = function() {
    this.modified = true;
    if (this.parent) {
        this.parent.setModified();
    }
};

/* Data Serialization Helpers */

Javelin.GameObject.prototype.export = function() {
    var serialized = {
        name: this.name,
        layer: this.layer,
        tags: this.tags,
        components: {}
    };
    
    for (var alias in this.components) {
        serialized.components[alias] = this.components[alias].$serialize();
    }
    
    if (this.children.length > 0) {
        serialized.children = [];
        for (var index in this.children) {
            serialized.children.push(this.children[index].export());
        }
    }
    
    return serialized;
};
;/*global Javelin:true */

/*
A GameObjectComponent is a glorified map of callbacks + a public API for other components to use.
Components are processed by user-defined
functions that compose the objects internally.  Each user function receives a new blank component
instance.  Callbacks can be regisered on the component to be processed by the Engine plugins.  Properties and
methods can be added to the component instance in the function as well.  The properties and methods added
to the instance constitute the public "api" of that component.

Callbacks are called directly by whoever processes them - so the exact signature of a given
callback is determined by the part of the engine that is calling it.
*/


'use strict';

Javelin.GameObjectComponent = function() {
    this.$callbacks = {};
    this.$go = null;
    this.$id = -1;
    this.$alias = '';
    this.$inheritedAliases = [];
};

Javelin.GameObjectComponent.prototype.$on = function(name, callback) {
    callback.$id = this.$id;
    this.$callbacks[name] = callback;
    if (this.$go) {
        this.$go.setModified();
    }
};

Javelin.GameObjectComponent.prototype.$instanceOf = function(alias) {
    return (-1 !== this.$inheritedAliases.indexOf(alias));
};

Javelin.GameObjectComponent.prototype.$getCallback = function(name) {
    return this.$callbacks[name] || false;
};

Javelin.GameObjectComponent.prototype.$serialize = function() {
    var data = {};
    
    //export non-function component properties, excluding the builtins ($)
    for (var key in this) {
        if (typeof(this[key]) !== 'function' && key.charAt(0) !== '$') {
            data[key] = this[key];
        }
    }
    
    return data;
};

Javelin.GameObjectComponent.prototype.$unserialize = function(data) {
    for (var key in data) {
        this[key] = data[key];
    }
};
;/*global Javelin:true alert:true */

/*
An interface (or something) for functionality that must be implemented in an environment-specific
manner.
*/

'use strict';

Javelin.Env.Browser = function(config) {
    this.config = config;
    this.engine = null;
    this.intervalId = null;
};

Javelin.Env.Browser.prototype = new Javelin.Environment();

//NOTE: yes - I know I should be using requestAnimationFrame
Javelin.Env.Browser.prototype.run = function(stepsPerSecond) {
    var engine = this.engine;
    this.intervalId = setInterval(function() {
        try {
            engine.step();
        } catch (e) {
            console.log(e);

            if (engine.debug) {
                alert(e);
            }
        }
    }, stepsPerSecond);
};

Javelin.Env.Browser.prototype.stop = function(callback) {
    clearInterval(this.intervalId);
    setTimeout(callback, 1);
};
;/*global Javelin:true */

'use strict';

Javelin.Env.Server = function() {
    this.engine = {};
};

Javelin.Env.Server.prototype = new Javelin.Environment();

Javelin.Env.Server.prototype.run = function() {
    //TODO:
};
;/*global webkitAudioContext: true */

'use strict';

//TODO: spatial audio w/ filters and what not is not implemented
Javelin.Plugin.Audio = function(plugin, config) {
    
    plugin.$onLoad = function() {
        if (window) {
            plugin.listener = null;
            plugin.audioContext = null;
            plugin.masterVolumeNode = null;
            plugin.loader = null;
            plugin.callbacks = {};

            //map of decoded audio buffers
            plugin.buffers = {};

            //sounds currenctly being played
            plugin.active = {};
            
            plugin.audioContext = new webkitAudioContext();
            //create and connect master volume node - playing sounds are chanelled through
            //that
            plugin.masterVolumeNode = plugin.audioContext.createGainNode(1);
            plugin.masterVolumeNode.connect(plugin.audioContext.destination);
            plugin.loader = plugin.$engine.loader;
        } else {
            plugin.$active = false;
        }
    };
    
    plugin.$onUnload = function() {
        for (var id in plugin.active) {
            plugin.stopSound(id);
        }
    };
    
    //internal use only
    plugin.loadSound = function(path, callback) {
        //use the engine's loader to get the audio arraybuffer
        plugin.loader.loadAsset(path, function(arraybuffer) {
            //try decoding it
            plugin.audioContext.decodeAudioData(arraybuffer, function(audioBuffer) {                
                //store decoded audio buffers
                plugin.buffers[path] = audioBuffer;
                callback();
            }, function() {
                console.log("Failed decoding audio from " + path);
            });
        });
    };
    
    //play a sound (called internally by the emitter)
    plugin.playSound = function(path, emitter, transform, loop, cull) {
        //load the sound if it isn't loaded
        if (!plugin.buffers[path]) {
            plugin.loadSound(path, function() {
                plugin.playSound(path, emitter, transform, loop, cull);
            });
            return;
        }
        
        //get source for sound, and configure based on emitter
        var source = plugin.audioContext.createBufferSource();
        source.buffer = plugin.buffers[path];
        var id = emitter.$id;
        plugin.active[id] = plugin.active[id] || {};
        var ind;
        
        //set looping
        if (loop) {
            source.loop = true;
        }

        //if the emitter is not spatial, we connect directly to master volume
        if (!emitter.spatial) {
            //connect to master volume node
            source.connect(plugin.masterVolumeNode);

            //store in active sounds (to be processed every frame)
            plugin.active[id][path] = {
                source: source,
                path: path,
                goId: emitter.$id,
                emitter: emitter,
                transform: transform,
                startTime: Date.now(),
                duration: source.buffer.duration,
                loop: false,
                finished: false
            };
        } else {
            //TODO: figure out cull - if the player can't even hear the sound based on the
            //positions, then don't bother actually playing it or doing any other
            //logic associated with it - generally this is only something that should be used
            //for very short-lived sounds like gunshots/explosions
            cull = false;
            if (!cull) {
        
                //now configure based on listener
            
                //connect to master volume node
                source.connect(plugin.masterVolumeNode);

                //store in active sounds (to be processed every frame)
                plugin.active[id][path] = {
                    source: source,
                    path: path,
                    goId: emitter.$id,
                    emitter: emitter,
                    transform: transform,
                    startTime: Date.now(),
                    duration: source.buffer.duration,
                    finished: false,
                    filterNodes: {
                        //TODO: ... store filter nodes here, to
                        //allow changing filter values while the
                        //sound is playing
                    }
                };
            }
        }

        //start actually playing the sound
        source.noteOn(0);
    };
    
    //stop a specific sound, or all sounds for a given gameObject
    plugin.stopSound = function(id, path) {
        path = path || false;
        var p;
        
        if (plugin.active[id]) {
            if (path) {
                if (plugin.active[id][path]) {
                    for (p in plugin.active[id]) {
                        if (p === path) {
                            plugin.active[id][p].source.noteOff(0);
                            plugin.active[id][p].source.disconnect(0);
                            plugin.active[id][p] = null;
                        }
                    }
                }
            } else {
                for (p in plugin.active[id]) {
                    if (null !== plugin.active[id][p]) {
                        plugin.active[id][p].source.noteOff(0);
                        plugin.active[id][p].source.disconnect(0);
                    }
                }

                plugin.active[id] = null;
            }
        }
    };
    
    plugin.clearActive = function(id) {
        plugin.active[id] = null;
    };
        
    plugin.$onGameObjectCreate = function(gameObject) {
        //check for the audio listener
        var listener = gameObject.getComponent('audioListener');
        if (listener) {
            plugin.listener = gameObject;
        }
        
        //check for audio resolve callbacks
        var cbs = gameObject.getCallbacks('audio.resolve');
        if (cbs) {
            plugin.callbacks[gameObject.id] = cbs;
        }
    };
    
    plugin.$onGameObjectDestroy = function(gameObject) {
        if (plugin.callbacks[gameObject.id]) {
            plugin.callbacks[gameObject.id] = null;
        }
        
        plugin.stopSound(gameObject.id);
    };
    
    plugin.$onPostUpdateStep = function() {
        if (plugin.listener) {
            var listenerPosition = plugin.listener.getComponent('transform2d').position;

            //calculate some node values for each active sound
            for (var id in plugin.active) {
                for (var path in plugin.active[id]) {
                    //calculate volumes and set
                    
                }
            }
            
            //TODO: for each active sound, go call any
            //`audio.resolve` callbacks from components
        }
    };
};
Javelin.Plugin.Audio.alias = 'audio';
;/*global Box2D:true */

'use strict';

Javelin.Plugin.Box2d = function(plugin, config) {
    //internal config w/ defaults
    var velocityIterations = config.velocityIterations || 10;
    var positionIterations = config.positionIterations || 10;
    var stepHZ = config.stepHZ || 1.0 / 30.0;
    var clearForces = config.clearForces || false;
    var stepHz = 1.0 / (config.stepsPerSecond || 1000/30);
    var stepsPerSecond = config.stepsPerSecond || 1000/30;
    var gravityX = config.gravityX || 0.0;
    var gravityY = config.gravityY || 0.0;
    var lastTimeStepped = Date.now();
    var allowSleep = config.allowSleep || false;
    
    if (Box2D) {
        //assign shortcut references to Box2D stuff
        plugin.Vec2 = Box2D.Common.Math.b2Vec2;
        plugin.BodyDef =  Box2D.Dynamics.b2BodyDef;
        plugin.Body =  Box2D.Dynamics.b2Body;
        plugin.FixtureDef =  Box2D.Dynamics.b2FixtureDef;
        plugin.Fixture =  Box2D.Dynamics.b2Fixture;
        plugin.World =  Box2D.Dynamics.b2World;
        plugin.MassData = Box2D.Collision.Shapes.b2MassData;
        plugin.PolygonShape =  Box2D.Collision.Shapes.b2PolygonShape;
        plugin.CircleShape = Box2D.Collision.Shapes.b2CircleShape;
        plugin.DebugDraw =  Box2D.Dynamics.b2DebugDraw;
        plugin.RevoluteJointDef =  Box2D.Dynamics.Joints.b2RevoluteJointDef;

        plugin.worldInstance = null;
        plugin.bodies = {};

        //TODO: explosion/implosion forces
        plugin.applyRadialForce = function(x, y, impulse, radius, implode, callback) {
            var center = new plugin.Vec2(x, y);
            var aa = new plugin.Vec2(x - radius, y - radius);
            var bb = new plugin.Vec2(x + radius, y + radius);
            var aabb = new Box2D.Collision.b2AABB();
            aabb.upperBound = bb;
            aabb.lowerBound = aa;
            
            plugin.worldInstance.QueryAABB(function(fixture) {
                var body = fixture.GetBody();
                var go = body.GetUserData();
                var targetPos = body.GetPosition();
                
                //ignore sensors
                if (fixture.IsSensor()) {
                    return true;
                }
                
                //check actual radius
                var distance = Box2D.Common.Math.b2Math.Distance(center, body.GetPosition());
                if (distance >= radius) {
                    return true;
                }
                
                //figure out force
                var amount = radius - distance;
                var strength = amount / radius;
                var force = impulse * strength;
                
                //figure out angle to apply force (depends on whether or not this is exploding or imploding)
                var angle;
                if (implode) {
                    angle = Math.atan2(center.y - targetPos.y, center.x - targetPos.x);
                } else {
                    angle = Math.atan2(targetPos.y - center.y, targetPos.x - center.x);
                }
                body.ApplyForce(new plugin.Vec2(Math.cos(angle) * force, Math.sin(angle) * force), body.GetPosition());

                if (callback) {
                    callback(go);
                }

                return true;
                
            }, aabb);
        };

        plugin.raycast = function() {
            
        };

        plugin.$onLoad = function() {
            //setup world
            plugin.worldInstance = null;
            plugin.worldInstance = new plugin.World(new plugin.Vec2(gravityX, gravityY), allowSleep);
            
            
            //setup contact listener
            var contactListener = new Box2D.Dynamics.b2ContactListener();
            contactListener.PreSolve = function(contact, manifold) {
                //does anything need to happen here?
            };
            contactListener.BeginContact = function(contact) {
                var goA = contact.GetFixtureA().GetBody().GetUserData();
                var goB = contact.GetFixtureB().GetBody().GetUserData();
                var isTrigger = (goA.getComponent('rigidbody2d').trigger || goB.getComponent('rigidbody2d').trigger);
                var event = (isTrigger) ? 'box2d.trigger.enter' : 'box2d.collision.enter';
                plugin.callGoCallbacks(event, goA, goB, contact);
                plugin.callGoCallbacks(event, goB, goA, contact);
            };

            contactListener.EndContact = function(contact) {
                var goA = contact.GetFixtureA().GetBody().GetUserData();
                var goB = contact.GetFixtureB().GetBody().GetUserData();
                var isTrigger = (goA.getComponent('rigidbody2d').trigger || goB.getComponent('rigidbody2d').trigger);
                var event = (isTrigger) ? 'box2d.trigger.exit' : 'box2d.collision.exit';
                plugin.callGoCallbacks(event, goA, goB, contact);
                plugin.callGoCallbacks(event, goB, goA, contact);
            };

            contactListener.PostSolve = function(contact, manifold) {
                //do anything?
            };
            
            plugin.worldInstance.SetContactListener(contactListener);
            
            if (plugin.$engine && plugin.$engine.debug) {
                var debugDraw = new Box2D.Dynamics.b2DebugDraw();
                debugDraw.SetSprite(plugin.$engine.getPlugin('canvas2d').context);
            }
        };
        
        plugin.callGoCallbacks = function(name, goA, goB, contact) {
            var cbs = goA.getCallbacks(name);
            if (cbs.length) {
                for (var i in cbs) {
                    cbs[i](goB, contact);
                }
            }
        };
        
        plugin.$onPostUpdateStep = function(deltaTime) {
            var i, j, cbs;
            var gos = plugin.$engine.gos;
            for (i in gos) {
                if (gos[i].enabled) {
                    cbs = gos[i].getCallbacks('box2d.update');
                    if (cbs) {
                        for (j in cbs) {
                            cbs[j](lastTimeStepped);
                        }
                    }
                }
            }
            
            if (plugin.$engine.time - lastTimeStepped >= stepsPerSecond) {
                plugin.worldInstance.Step(stepHZ, velocityIterations, positionIterations);
                
                if (clearForces) {
                    plugin.worldInstance.ClearForces();
                }
                
                lastTimeStepped = Date.now();
            }

            for (i in gos) {
                if (gos[i].enabled) {
                    cbs = gos[i].getCallbacks('box2d.lateUpdate');
                    if (cbs) {
                        for (j in cbs) {
                            cbs[j](lastTimeStepped);
                        }
                    }
                }
            }
        };
        
        plugin.$onGameObjectCreate = function(gameObject) {
            var rigidbody = gameObject.getComponent('rigidbody2d');
            if (rigidbody) {
                var bodyDef = rigidbody.createBodyDefinition();
                var body = plugin.worldInstance.CreateBody(bodyDef);
                var fixtureDef = rigidbody.createFixtureDefinition();

                //TODO: set collision layer stuff on the fixtureDef.filter                

                var fixture = body.CreateFixture(fixtureDef);
                rigidbody.setFixture(fixture);
                rigidbody.setBody(body);
                                
                //storing references to all bodies (for now)
                plugin.bodies[gameObject.id] = body;
            }
        };
        
        plugin.$onGameObjectDestroy = function(gameObject) {
            var rigidbody = gameObject.getComponent('rigidbody2d');
            if (rigidbody) {
                plugin.worldInstance.DestroyBody(rigidbody.getBody());
            }
            
            //remove reference to body
            plugin.bodies[gameObject.id] = null;
        };
    }
};
Javelin.Plugin.Box2d.alias = 'box2d';
;/*global Javelin:true */

'use strict';

/**
 * Canvas2d draws sprite components for 2d scenes.
 */
Javelin.Plugin.Canvas2d = function(plugin, config) {
    plugin.config = config;
    
    plugin.renderTarget = null;
    plugin.cameras = {};
    plugin.contexts = {};
    plugin.canvases = {};
    
    plugin.$onLoad = function() {
        if (document) {
            
            plugin.fps = plugin.config.framesPerSecond || plugin.$engine.stepsPerSecond;
            plugin.lastTimeRendered = 0.0;        
            var target = document.getElementById(plugin.config.renderTargetId);
            plugin.renderTarget = target;
            var top = target.offsetTop;
            var left = target.offsetLeft;
            
            if (!target) {
                throw new Error("No render target defined!");
            }
            
            if (!plugin.config.layers) {
                plugin.config.layers = ['default'];
            }
            
            //create and stack canvas layers
            var z = 0;
            for (var i in plugin.config.layers) {
                z++;
                var layer = plugin.config.layers[i];
                var canvas = document.createElement('canvas');
                canvas.height = plugin.config.height;
                canvas.width = plugin.config.width;
                canvas.style.zIndex = z;
                canvas.id = 'javelin-layer-' + layer;
                
                plugin.canvases[layer] = canvas;
                plugin.contexts[layer] = canvas.getContext('2d');
                plugin.cameras[layer] = {
                    x: 0,
                    y: 0,
                    height: 0,
                    width: 0
                };
                
                target.appendChild(canvas);
            }
        } else {
            plugin.$active = false;
        }
    };
    
    plugin.$onUnload = function() {
        for (var i in plugin.canvases) {
            plugin.renderTarget.removeChild(plugin.canvases[i]);
        }
    };
    
    plugin.$onPostUpdateStep = function(deltaTime) {
        if (plugin.$engine.time - plugin.lastTimeRendered >= plugin.fps && !plugin.$engine.isRunningSlowly) {
            var i, j, ctx, canvas, camera;
            
            //clear all canvases
            for (i in plugin.canvases) {
                plugin.contexts[i].clearRect(0, 0, plugin.canvases[i].width, plugin.canvases[i].height);
            }

            //execute `canvas2d.draw` callbacks on all root game objects (by layer)
            //NOTE: right now, the layer of the root game object filters to children
            var gos = plugin.$engine.gos;
            var l = gos.length;
            for (i = 0; i < l; i++) {
                if (gos[i].enabled && gos[i].isRoot()) {
                    //get layer
                    ctx = plugin.contexts[gos[i].layer];
                    camera = plugin.cameras[gos[i].layer];
                    //check for a draw callbacks to run
                    var cbs = gos[i].getCallbacks('canvas2d.draw', true);
                    for (j in cbs) {
                        cbs[j](ctx, camera);
                    }
                }
            }
            
            plugin.lastTimeRendered = plugin.$engine.time;
        }
    };
};
Javelin.Plugin.Canvas2d.alias = "canvas2d";
;'use strict';

/**
 * This callback can be executed by registering a listener for the
 * `input.resolve` event in any component.  This will allow user code
 * to override or modify user input values.
 * 
 * @param {Object} plugin The instance of the `input` plugin
 * @callback
 */

/**
 * This plugin processes and stores user input.  It uses separate handlers to listen for 
 * and process the raw input values.  These handlers are loaded and unloaded automatically
 * based on the configuration passed to the plugin.
 * 
 * @class Javelin.Plugin.Input
 * @author Evan Villemez
 */
Javelin.Plugin.Input = function (plugin, config) {
	plugin.config = config;
    plugin.handlers = {};
    plugin.callbacks = {};
    plugin.input = {};
	
    //process config and setup relevant listeners
	plugin.$onLoad = function() {
        
		//setup keyboard controls
        if (plugin.config.keyboard) {
            var kb = plugin.handlers['keyboard'] = new Javelin.Plugin.Input.Handler.Keyboard(plugin, plugin.config.keyboard);
            if ('undefined' !== typeof window) {
                kb.registerListeners();
            }
        }
        
        //TODO: setup mouse controls
        //TODO: setup gamepad controls        
        //TODO: setup touch controls
	};
    
    plugin.$onUnload = function() {
        if (plugin.handlers['keyboard']) {
            plugin.handlers['keyboard'].unregisterListeners();
        }
    };
	
	plugin.$onPreUpdateStep = function(deltaTime) {
        var i, j, currTime, lastTime;
        
        currTime = plugin.$engine.time;
        lastTime = plugin.$engine.prevTime;
        
		//all configured handlers process their own input
        for (i in plugin.handlers) {
            plugin.handlers[i].processInputEvents(currTime, lastTime, deltaTime);
        }
        
        //call any registered `input.resolve` callbacks
        for (i in plugin.callbacks) {
            if (plugin.callbacks[i]) {
                for (j in plugin.callbacks[i]) {
                    plugin.callbacks[i][j](plugin);
                }
            }
        }
	};
    
    plugin.$onPostUpdateStep = function(deltaTime) {
        //TODO: clear anything?
    };
    
    plugin.$onGameObjectCreate = function(gameObject) {
        var cbs = gameObject.getCallbacks('input.resolve');
        if (cbs.length) {
            plugin.callbacks[gameObject.id] = cbs;
        }
    };
    
    plugin.$onGameObjectDestroy = function(gameObject) {
        if (plugin.callbacks[gameObject.id]) {
            plugin.callbacks[gameObject.id] = null;
        }
    };

    //generic GET by name - will internally decide which input to call, so you need
    //to already know what type of value will be returned
    plugin.getInput = function (name) {
        if (!this.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return this.input[name] || false;
    };
    
    /**
     * Get value of a button control, will be between 0 and 1
     * 
     * @param {String} name The name of the control to get
     * @returns {Number} A number in the range of 0 to 1
     */    
	plugin.getButton = function(name) {
        if (!this.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return this.input[name].val || 0;
	};
	
    /**
     * Get whether or not a button was pressed down during the last frame.
     * 
     * @param {String} name The name of the control to get
     * @returns {Boolean}
     */    
	plugin.getButtonDown = function(name) {
        if (!this.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return this.input[name].down || false;
	};
	
    /**
     * Get whether or not a button was released during the last frame.
     * 
     * @param {String} name The name of the control to get
     * @returns {Boolean}
     */    
	plugin.getButtonUp = function(name) {
        if (!this.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return this.input[name].up || false;
	};
	
    /**
     * Get the value for an axis control, will be between -1 and 1
     * 
     * @param {String} name The name of the control to get
     * @returns {Number} A number in the range of -1 to 1
     */    
	plugin.getAxis = function(name) {
        if (!this.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return this.input[name] || 0;
	};
	
    plugin.getMousePosition = function() {
        //if not present will return null values
    };
    
    plugin.getMouseButton = function(index) {};
    
    plugin.getMouseButtonUp = function(index) {};
    
    plugin.getMouseButtonDown = function(index) {};
    
    plugin.getTouch = function (index) {};
    plugin.getTouches = function () {};
    //plugin.getGesture(); abstract common gestures or something?
    
    plugin.getHandler = function(key) {
        return this.handlers[key] || false;
    };
    
    plugin.defineButton = function(name) {
        this.input[name] = {
            up: false,
            down: false,
            val: 0
        };
    };
    
    plugin.setButton = function(name, val) {
        this.input[name].val = val;
    };
    
    plugin.setButtonUp = function(name, val) {
        this.input[name].up = val;
    };
    
    plugin.setButtonDown = function(name, val) {
        this.input[name].down = val;
    };
    
    plugin.setAxis = function(name, val) {
        this.input[name] = val;
    };
};
Javelin.Plugin.Input.alias = 'input';

//declare subnamespce for specific input implementations
Javelin.Plugin.Input.Handler = Javelin.Plugin.Input.Handler || {};

/* 

//Example config:

var config = {
    //joystick, same as gamepad?
	joystick: {},
    //how best to map 'input' to hammer.js gestures?
    touch: {
        input: {
            'move left': 'swipe left'
        }
    },
	mouse: {
        captureTarget: 'game',
        requireCapture: true,   //will request mouse-lock on browsers that support it
        buttons: {
            'fire': 0,      //button indices
            'alt-fire': 1
        }
    },
	keyboard: {
		buttons: {
			'fire': 'space'
		},
		axes: {
			'move-horiz': {
				positive: 'd',
				negative: 'a',
				snap: true,
				ramp: 2
			},
			'move-vert': {
				positive: 'w',
				negative: 's',
				snap: true,
				ramp: 2
			}
		}
	},
	gamepad: {
		buttons: {
			'fire': 'A'
		},
		axes: {
			'move-horiz': {},
			'move-vert': {}
		}
	},
};
*/
;'use strict';

/**
 * Keyboard input handler.  The input plugin uses this for processing raw keyboard
 * input.
 * 
 * @author Evan Villemez
 */
Javelin.Plugin.Input.Handler.Keyboard = function(plugin, config) {
    this.raw = {};
    this.plugin = plugin;
    this.MAP = {
        'a': 65,
        'b': 66,
        'c': 67,
        'd': 68,
        'e': 69,
        'f': 70,
        'g': 71,
        'h': 72,
        'i': 73,
        'j': 74,
        'k': 75,
        'l': 76,
        'm': 77,
        'n': 78,
        'o': 79,
        'p': 80,
        'q': 81,
        'r': 82,
        's': 83,
        't': 84,
        'u': 85,
        'v': 86,
        'w': 87,
        'x': 88,
        'y': 89,
        'z': 90,
        'space':        32,
        'enter':        13,
        'control':      17,
        'alt':          18,
        'delete':       46, 
        'backspace':    8 ,
        'shift':        16,
        'escape':       27,
        'uparrow':      38,
        'downarrow':    40,
        'leftarrow':    37,
        'rightarrow':   39
    };

    if (config) {
        this.processConfig(config);
    }
    
    var kb = this;
    
    this.keyUpListener = function(e) {
        kb.handleKeyUp(e);
    };
    
    this.keyDownListener = function(e) {
        kb.handleKeyDown(e);
    };
        
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.registerListeners = function() {
    window.addEventListener('keyup', this.keyUpListener);
    window.addEventListener('keydown', this.keyDownListener);    
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.unregisterListeners = function() {
    window.removeEventListener('keyup', this.keyUpListener);
    window.removeEventListener('keydown', this.keyDownListener);
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.processInputEvents = function(currTime, lastTime, deltaTime) {

    for (var code in this.raw) {
        var raw = this.raw[code];
        
        //process buttons
        if (!raw.axis) {

            if (raw.up) {
                this.plugin.setButtonUp(raw.control, true);
                this.plugin.setButtonDown(raw.control, false);
                this.plugin.setButton(raw.control, 0);
            }
            
            if (raw.down) {
                this.plugin.setButtonUp(raw.control, false);
                this.plugin.setButtonDown(raw.control, true);
                this.plugin.setButton(raw.control, 1);
            }
            
        } else {
            //TODO: process axis
        }
    }
};


Javelin.Plugin.Input.Handler.Keyboard.prototype.processConfig = function(config) {
    this.config = config;
    this.raw = {};
    
    var control;
    
    //buttons
    if (config.buttons) {
        for (control in config.buttons) {
            if (this.MAP[config.buttons[control]]) {

                //tells plugin to create spot for final values
                this.plugin.defineButton(control);
                
                //create internal raw storage spot for later processing
                this.raw[this.MAP[config.buttons[control]]] = {
                    up: false,
                    down: false,
                    time: Date.now(),
                    axis: false,
                    control: control
                };
            }
        }
    }
    
    //axes
    if (config.axes) {
        for (control in config.axes) {
            //TODO:
        }
    }
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.getKeyId = function(event) {
    var codes = [];
    if (event.keyCode) {
        codes.push(event.keyCode);
    }

    if (event.altKey) {
        codes.push(18);
    }
    
    if (event.ctrlKey) {
        codes.push(17);
    }
    
    if (event.shift) {
        codes.push(16);
    }
    
    return codes;
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.handleKeyDown = function(event) {
    var codes = this.getKeyId(event);
    for (var i in codes) {
        if (this.raw[codes[i]]) {
            event.preventDefault();

            var key = this.raw[codes[i]];
            key.down = true;
            key.up = false;
            key.time = Date.now();
        }
    }
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.handleKeyUp = function(event) {
    var codes = this.getKeyId(event);
    for (var i in codes) {
        if (this.raw[codes[i]]) {
            event.preventDefault();

            var key = this.raw[codes[i]];
            key.down = false;
            key.up = true;
            key.time = Date.now();
        }
    }
};
;
    if (typeof module !== 'undefined') {
        // export for node
        module.exports = Javelin;
    } else {
        // assign to window
        this.Javelin = Javelin;
    }
}).apply(this);
