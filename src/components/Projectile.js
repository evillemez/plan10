'use strict';

Plan10.Component.Projectile = function(gameObject, component) {
    component.damage = 100;
    component.radius = 100;
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
    
    component.$on('box2d.collision.enter', function(gameObject) {
        component.detonate();
    });
};
Plan10.Component.Projectile.alias = 'plan10.projectile';
Plan10.Component.Projectile.requires = [
    'spriteAnimator'
    ,'rigidbody2d'
    ,'audioEmitter'
];
