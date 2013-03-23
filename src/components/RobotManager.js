'use strict';

//just to experiment with creating multiple game objects
Plan10.Component.RobotManager = function(go, comp) {
    //public api w/ default values
    comp.maxRobots = 100;
    comp.createDelay = 10;
    comp.destroyDelay = 10;
    comp.robotPrefab = null;
    
    //private
    var lastTimeCreated = 0;
    var lastTimeDestroyed = 0;
    var robots = [];
    var y = 0;
    var x = 0;
    var creating = true;
    var numCreated = 0;
    
    comp.$on('create', function() {
        console.log("Manager created!");
    });
    
    //behavior
    comp.$on('update', function(deltaTime) {
        var time = go.engine.time;
        
        //create a new robot
        if (creating && time >= lastTimeCreated + comp.createDelay) {

            if (robots.length < comp.maxRobots && creating) {
                lastTimeCreated = time;
                var robot = go.engine.instantiate(comp.robotPrefab);
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
                
                if (robots.length >= comp.maxRobots) {
                    creating = false;
                }
            }
        }
        
        //or destroy a robot
        if (!creating && time >= lastTimeDestroyed + comp.destroyDelay && robots.length <= comp.maxRobots) {
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
