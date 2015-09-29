var _ = require('lodash'),
  Twitter = require('twitter'),
  express = require('express'),
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

function postStatus(q, callback) {
  var data = _.extend({}, q, { upOrDown: (q.alertType == "1" ? 'DOWN' : 'UP') });
  var msg = _.template("<%=monitorFriendlyName%>: <%= upOrDown %> <%=monitorURL%>")(data);
  client.post('statuses/update', {status: msg}, callback);
}

app.post('/uptime-robot/:secret', function(req, res) {
  if (endpointSecret == req.params.secret) {
    postStatus(req.query, function (error, twitterRes) {
      if (error) {
        res.status(500).json(error);
      } else {
        console.log("[%s] %s", twitterRes.created_at, twitterRes.text);
        res.json(twitterRes);
      }
    });
  } else {
    res.status(404).send("");
  }
});

if (process.env.PORT) {
  app.listen(process.env.PORT);
} else {
  console.log("Environment variable PORT must be set");
  process.exit(1);
}
