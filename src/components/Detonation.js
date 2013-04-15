'use strict';

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
