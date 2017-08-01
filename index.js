var http       = require('http')
  , AlexaSkill = require('./AlexaSkill')
  , APP_ID     = 'amzn1.echo-sdk-ams.app.3449f603-1beb-43b1-a0fb-a57684d51b1e';


var url = function(movieId){
  return 'http://api.myapifilms.com/imdb/idIMDB?title=' + movieId + '&token=5c14ef53-661b-40db-8eac-308dde18cbb0';
};

//*** http://api.myapifilms.com/imdb/idIMDB?title=matrix&token=5c14ef53-661b-40db-8eac-308dde18cbb0
var getJsonFromMaf = function(movieId, callback){
  http.get(url(movieId), function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var result = JSON.parse(body);
     callback(result);
    });

  }).on('error', function(e){
    console.log('Error: ' + e);
  });
};

var handleMovieRating = function(intent, session, response){
  getJsonFromMaf(intent.slots.movie.value, function(data){
    if(data.data.movies[0].title){
      var text = data.data.movies[0].rating
      var simplePlot = data.data.movies[0].simplePlot
      var cardText = 'The rating of the movie ' + data.data.movies[0].title + ' is: ' + text + ' imdb: '  + data.data.movies[0].urlIMDB;
    } else {
      var text = 'That rating is not available.'
      var cardText = text;
    }

    var heading = 'The movie rating is: ' + intent.slots.movie.value
    var outputResponse = 'The rating of the movie ' + data.data.movies[0].title + ' is: ' + text + ': plot of the story is: ' + simplePlot;
    response.tellWithCard(outputResponse, heading, cardText);
  });
};

var MovieRating = function(){
  AlexaSkill.call(this, APP_ID);
};

MovieRating.prototype = Object.create(AlexaSkill.prototype);
MovieRating.prototype.constructor = MovieRating;

MovieRating.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session){
  // What happens when the session starts? Optional
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
      + ", sessionId: " + session.sessionId);
};

MovieRating.prototype.eventHandlers.onLaunch = function(launchRequest, session, response){
  // This is when they launch the skill but don't specify what they want. Prompt
  // them for their bus stop
  var output = 'Which movie rating do you like?';

  var reprompt = 'are you looking for a movie rating?';

  response.ask(output, reprompt);

  console.log("onLaunch requestId: " + launchRequest.requestId
      + ", sessionId: " + session.sessionId);
};

MovieRating.prototype.intentHandlers = {
  GetMovieRatingIntent: function(intent, session, response){
    handleMovieRating(intent, session, response);
  },

  HelpIntent: function(intent, session, response){
    var speechOutput = 'Get any hollywood movie rating. ' +
      'Which movie rating would you like?';
    response.ask(speechOutput);
  }
};

exports.handler = function(event, context) {
    var skill = new MovieRating();
    skill.execute(event, context);
};