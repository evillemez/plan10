'use strict';

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
