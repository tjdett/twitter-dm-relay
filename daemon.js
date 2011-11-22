var argv = require('optimist').argv,
    async = require('async'),
    Twitter = require('ntwitter');
    
var twit = new Twitter({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token_key: process.env.TWITTER_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

var AsyncJobs = (function() {
    var obj = {};
    var lock = false;
    
    obj.process = function() {
      if (lock)
        return;
      lock = true;
      twit.getDirectMessages({}, function(err, messages) {
          lock = messages.length;
          async.forEachSeries(messages.reverse(), handleMessage, function(err) {
              if (err !== undefined) {
                console.log(err.message || err);
              }
              lock = false;
          });
      });
    };
    
    var updateStatus = function(directMessage, callback) {
      console.log(
        "Updating status with #"+directMessage.id_str+
        " from @"+directMessage.sender.screen_name+
        ": "+directMessage.text);
      twit.updateStatus(directMessage.text, callback);
    };
    
    var deleteDirectMessage = function(directMessage, callback) {
      console.log("Deleting #"+directMessage.id_str);
      twit.destroyDirectMessage(directMessage.id_str, callback);
    };
    
    var handleMessage = function(directMessage, callback) {
      var asyncDone = function(err, results) {
        callback(err);
      };
      async.series([
          function(callback) {
            updateStatus(directMessage, callback);
          },
          function(callback) {
            deleteDirectMessage(directMessage, callback);
          }
      ], asyncDone);
    };
    
    return obj;
})();

setInterval(AsyncJobs.process, argv.interval * 1000 || 60000);
