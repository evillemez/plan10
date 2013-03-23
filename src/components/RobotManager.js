'use strict';

//just to experiment with creating multiple game objects
Plan10.Component.RobotManager = function(gameObject, component) {
    //public api w/ default values
    component.maxRobots = 100;
    component.createDelay = 10;
    component.destroyDelay = 10;
    component.robotPrefab = null;
    
    //private
    var lastTimeCreated = 0;
    var lastTimeDestroyed = 0;
    var robots = [];
    var y = 0;
    var x = 0;
    var creating = true;
    var numCreated = 0;
    
    component.$on('engine.create', function() {
        console.log("Manager created!");
    });
    
    //behavior
    component.$on('engine.update', function(deltaTime) {
        var time = gameObject.engine.time;
        
        //create a new robot
        if (creating && time >= lastTimeCreated + component.createDelay) {

            if (robots.length < component.maxRobots && creating) {
                lastTimeCreated = time;
                var robot = gameObject.engine.instantiate(component.robotPrefab);
                var t = robot.getComponent('transform2d');
                robots.push(robot);
                numCreated++;
                if (numCreated >= 10) {
                    numCreated = 0;
                    x += 100;
                    y = 0;
                }
                t.position.x = x;
                t.position.y = y;

                y += 65;
                
                if (robots.length >= component.maxRobots) {
                    creating = false;
                }
            }
        }
        
        //or destroy a robot
        if (!creating && time >= lastTimeDestroyed + component.destroyDelay && robots.length <= component.maxRobots) {
            y = 0;
            x = 0;
            lastTimeDestroyed = time;
            var deleted = robots.splice(0, 1);
            deleted[0].destroy();
            
            if (!robots.length) {
                creating = true;
            }
        }
    });

};
Plan10.Component.RobotManager.alias = "plan10.robot_manager";
