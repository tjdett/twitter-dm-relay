#!/usr/bin/env bash

CMD=`/usr/bin/heroku config | awk '{print "export " $1 "=" "\"" $3 "\"; " }'`
echo $CMD
eval $CMD
