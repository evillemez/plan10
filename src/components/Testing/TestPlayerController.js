'use strict';

Plan10.Component.TestPlayerController = function(gameObject, component) {
    var input, audio, animator, transform;
    var lastFired = 0;
    
    //delay firing to once every 400 ms
    component.fireDelay = 200;
    component.ammo = 50;
    component.moveSpeed = 40;
    
    //initial setup
    component.$on('engine.create', function() {
        //get references to plugins/components we need
        input = gameObject.engine.getPlugin('input');
        audio = gameObject.getComponent('audioEmitter');
        transform = gameObject.getComponent('transform2d');
        animator = gameObject.getComponent('spriteAnimator');

        //start walking
        animator.play('walk');
        
        //start epic theme music
        audio.playLoop('assets/Zarathustra.mp3');
    });
    
    //called when it destroys
    component.$on('engine.destroy', function() {
        audio.stop();
    });
    
    //called every frame
    component.$on('engine.update', function(deltaTime) {
        var radians = transform.rotation * Math.PI / 180;
        var forwardX, forwardY;
        var moving = false;
        
        if (input.getButton('move left')) {
            moving = true;
            transform.rotate(-5);
        }
        if (input.getButton('move right')) {
            moving = true;
            transform.rotate(5);
        }
        if (input.getButton('move up')) {
            moving = true;
            forwardX = Math.cos(radians) * component.moveSpeed * deltaTime;
            forwardY = Math.sin(radians) * component.moveSpeed * deltaTime;
            transform.translate(forwardX, forwardY);
        }
        if (input.getButton('move down')) {
            moving = true;
            forwardX = -Math.cos(radians) * component.moveSpeed * deltaTime;
            forwardY = -Math.sin(radians) * component.moveSpeed * deltaTime;
            transform.translate(forwardX, forwardY);
        }
        if (moving) {
            animator.play('walk');
        } else {
            animator.stop();
        }

        if (input.getButton('fire')) {
            //limit to fire-rate
            if (lastFired + component.fireDelay <= gameObject.engine.time && component.ammo > 0) {
                lastFired = gameObject.engine.time;
                audio.playOnce('assets/BasicProjectile3.mp3');
                component.ammo--;
                
                //if out of ammo, stop playing epic theme music
                if (component.ammo <= 0) {
                    audio.stopSound('assets/Zarathustra.mp3');
                }
            }
        }
    });
    
    //display ammount of ammo
    component.$on('canvas2d.draw', function(context) {
        context.font = "bold 32px sans-serif";
        context.fillText(component.ammo, 50, 50);
    });
};
Plan10.Component.TestPlayerController.alias = "plan10.testPlayerController";
Plan10.Component.TestPlayerController.requires = [
    'plan10.robotAnimation',
    'audioEmitter'
];
