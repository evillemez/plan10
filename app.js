'use strict';

var game; //poluting the global namespace for fun and profit... and debugging!

//use jQuery to do boring DOM stuff when it loads
$(function() {
    $('#game').hide();

    //check for debug flag
    Plan10.config.debug = getParameterByName('debug') || false;
    
    //instantiate Javelin engine with Plan10 game config
    game = new Javelin.Engine(new Javelin.Env.Browser(), Plan10.config);
    
    //listen for event from within game to show the splash screen
    game.on('plan10.splash_screen', function() {
        alert('k');
        game.stop();
        $('#game').hide();
        $('#splash').show();
    });
    
    //set up intro/play buttons on splash screen
    $('#intro').mouseup(function() {
        game.loadScene('plan10.intro', function() {
            $('#splash').hide();
            $('#game').show();
            game.run();
        });
    });

    $('#play').mouseup(function() {
        game.loadScene('plan10.main', function() {
            $('#splash').hide();
            $('#game').show();
            game.run();
        });
    });
});

//thanks stack overflow: http://stackoverflow.com/a/901144
function getParameterByName(name)
{
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if(results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}
