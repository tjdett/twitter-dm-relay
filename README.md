# webhook-tweeter

## Setup

Define your Twitter settings as environment variables:

```
TWITTER_KEY=<consumer_key>
TWITTER_SECRET=<consumer_secret>
TWITTER_TOKEN=<access_token_key>
TWITTER_TOKEN_SECRET=<access_token_secret>
```

Define an endpoint secret the same way:

```
ENDPOINT_SECRET=a5ddd55c03263770e4f9fc4b81742c3328bb768ed5c926ad15dee690807f4994
```

If you're using Heroku, `load_env_from_heroku.sh` may be useful. Remember to use
HTTPS to hide your URL path from world+dog.

## Usage

POST `text/plain` messages to `/raw/<ENDPOINT_SECRET>` to tweet.

Have Uptime Robot POST to `/uptime-robot/<ENDPOINT_SECRET>?` to tweet service
status.
