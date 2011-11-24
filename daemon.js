var argv = require('optimist').argv,
    async = require('async'),
    Twitter = require('ntwitter');

var options = {
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token_key: process.env.TWITTER_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
};

for (var k in options) {
  if (options[k] == null) {
    console.log(k+" is "+options[k]);
    process.exit(1);
  }
}
    
var twit = new Twitter(options);

var AsyncJobs = (function() {
    var obj = {};
    var lock = false;
    
    obj.process = function() {
      if (lock)
        return;
      lock = true;
      twit.getDirectMessages({}, function(err, messages) {
          if (messages === undefined)
            return;
          async.forEachSeries(messages.reverse(), handleMessage, function(err) {
              if (err !== undefined) {
                console.log(err.message || err);
              }
              lock = false;
          });
      });
    };
    
    var updateStatus = function(directMessage, updateText, callback) {
      console.log(
        "Updating status with #"+directMessage.id_str+
        " from @"+directMessage.sender.screen_name+
        ": "+updateText);
      twit.updateStatus(updateText, function(err) {
        if (err == null) {
          callback();
        } else {
          if (err.toString().indexOf("duplicate") !== -1) {
            updateStatus(directMessage,
              updateText+" ["+directMessage.created_at+"]",
              callback);
          }
        }
      });
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
            updateStatus(directMessage, directMessage.text, callback);
          },
          function(callback) {
            deleteDirectMessage(directMessage, callback);
          }
      ], asyncDone);
    };
    
    return obj;
})();

setInterval(AsyncJobs.process, argv.interval * 1000 || 60000);
