var _ = require('lodash'),
  Twitter = require('twitter'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  endpointSecret = process.env.ENDPOINT_SECRET;

var twitterOptions = _.reduce({
    consumer_key: 'TWITTER_KEY',
    consumer_secret: 'TWITTER_SECRET',
    access_token_key: 'TWITTER_TOKEN',
    access_token_secret: 'TWITTER_TOKEN_SECRET'
  }, function(m,v,k) {
    if (process.env[v] == null) {
      console.log("Environment variable %s is not set", v);
      process.exit(1);
    }
    m[k] = process.env[v];
    return m;
  }, {});

var client = new Twitter(twitterOptions);

if (endpointSecret) {
  console.log("Endpoint secret is: %s", endpointSecret);
} else {
  console.log("Environment variable ENDPOINT_SECRET is not set");
  process.exit(1);
}

client.get('account/verify_credentials', function(error, info, response) {
  if (error) {
    console.log(error);
    process.exit(1);
  }
  console.log("Using account: %s (@%s)", info.name, info.screen_name);
});

function uptimeRobotMsg(q) {
  var data = _.extend({}, q, { upOrDown: (q.alertType == "1" ? 'DOWN' : 'UP') });
  return _.template("<%=monitorFriendlyName%>: <%= upOrDown %> <%=monitorURL%>")(data);
}

function postStatus(msg, callback) {
  client.post('statuses/update', {status: msg}, callback);
}

function secretHandler(f) {
  return function(req, res) {
    if (endpointSecret == req.params.secret) {
      var msg = f(req);
      if (msg) {
        postStatus(msg, function (error, twitterRes) {
          if (error) {
            res.status(500).json(error);
          } else {
            console.log("[%s] %s", twitterRes.created_at, twitterRes.text);
            res.json(twitterRes);
          }
        });
      } else {
        res.status(400).type('text').send("Unable to obtain message to tweet");
      }
    } else {
      res.status(404).send("");
    }
  }
}

app.use(bodyParser.text());

app.post('/raw/:secret', secretHandler(function (req) { return req.body; }));

app.post('/uptime-robot/:secret', secretHandler(function (req) {
  return uptimeRobotMsg(req.query);
}));

if (process.env.PORT) {
  app.listen(process.env.PORT);
} else {
  console.log("Environment variable PORT must be set");
  process.exit(1);
}
