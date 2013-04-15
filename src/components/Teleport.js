'use strict';

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
Plan10.Component.Teleport.requires = ['rigidbody2d'];