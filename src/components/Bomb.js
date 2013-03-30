'use strict';

Plan10.Component.Bomb = function(gameObject, component) {
    component.damage = 10;
    component.radius = 10;
    component.explosionPrefab = null;
    
    component.detonate = function() {
        //instantiate explosion prefab
        //apply an explosion force and damage in the area
        
        //the explosion force thing might actually get rather nasty and complicated
        //so don't worry about this for a while
        //It will probably involve getting an array of all the rigidbody components
        //in the scene and checking the distances, then applying damage / and force based on the distance,
        //this part maybe should be moved into a separate component as well, I dunno
    };
    
    component.$on('engine.create', function() {
        //set the sprite image for the bomb
    });
    
    component.$on('engine.update', function(deltaTime) {
        //check to see if user has detonated the bomb by pressing the 'fire' input again
    });
    
    component.$on('box2d.collision.enter', function() {
        //if the bomb collides with anything, detonate it
    });
};
Plan10.Component.Bomb.alias = 'plan10.bomb';
Plan10.Component.Bomb.requires = [
    'sprite'
//    ,'rigidbody2d'
//    ,'audioEmitter'
];
