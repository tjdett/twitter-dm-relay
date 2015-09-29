# uptimerobot-twitter-relay

Define your Twitter settings as environment variables:

```
TWITTER_KEY=<consumer_key>
TWITTER_SECRET=<consumer_secret>
TWITTER_TOKEN=<access_token_key>
TWITTER_TOKEN_SECRET=<access_token_secret>
```

Define an endpoint secret:

```
ENDPOINT_SECRET=a5ddd55c03263770e4f9fc4b81742c3328bb768ed5c926ad15dee690807f4994
```

All webhook posts to `/uptime-robot/<ENDPOINT_SECRET>` will tweet.
