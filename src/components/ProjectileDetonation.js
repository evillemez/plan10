'use strict';

Plan10.Component.Detonation = function(gameObject, component) {
    component.detonationSound = null;
    component.detonationForce = 100;
    component.detonationRadius = 100;
    component.implode = false;
    
    component.$on('engine.create', function() {
        var audio = gameObject.getComponent('audioEmitter');
        var animator = gameObject.getComponent('spriteAnimator');
        var transform = gameObject.getComponent('transform2d');
        
        audio.playOnce(component.detonationSound);
        
        var box = gameObject.engine.getPlugin('box2d');
        
        //apply explosion/implosion force
        box.applyRadialForce(
            transform.position.x,
            transform.position.y,
            component.detonationForce,
            component.detonationRadius,
            component.implode,
            function(gameObject) {
                console.log('Hitting ' + gameObject.id);
            }
        );
        
        animator.playOnce('explode', function() {
            gameObject.destroy();
        });
    });
};
Plan10.Component.Detonation.alias = 'plan10.detonation';
Plan10.Component.Detonation.requires = ['spriteAnimator', 'audioEmitter'];
