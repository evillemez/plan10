'use strict';

Plan10.Component.FilmGrain = function(gameObject, component) {
    
    component.$on('canvas2d.draw', function(context) {
        //tile a small noise image over the entire canvas
        //but change it's starting x/y coordinates a little
        //bit each frame (or every few frames) to give it
        //the appearance of being dynamic
    });
};
Plan10.Component.FilmGrain.alias = 'plan10.filmGrain';
