'use strict';

Plan10.Component.Detonation = function(gameObject, component) {
    component.detonationSound = null;
    component.detonationForce = 100;
    component.implode = false;
    
    component.$on('engine.create', function() {
        var audio = gameObject.getComponent('audioEmitter');
        var animator = gameObject.getComponent('spriteAnimator');
        
        audio.playOnce(component.detonationSound);
        
        var box = gameObject.engine.getPlugin('box2d');
        if (component.implode) {
            box.applyImplosionForce();
        } else {
            box.applyExplosionForce();
        }
        
        animator.playOnce('explode', function() {
            gameObject.destroy();
        });
        
    });
};
Plan10.Component.Detonation.alias = 'plan10.detonation';
Plan10.Component.Detonation.requires = ['spriteAnimator', 'audioEmitter'];
