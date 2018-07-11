#!/bin/bash

ENV=

if [ -n "$1" ]; then
	ENV=$(echo $1 | cut -c1-3)
else if [ -n "NODE_ENV" ]; then
	ENV=$(echo $NODE_ENV | cut -c1-3)
fi fi

if [ -n "$ENV" ]; then
	if [ "$ENV" = "dev" ]; then
		npm run start:dev
	else if [ "$ENV" = "pro" ]; then
		npm run start:prod
	else
		echo Unknown env $ENV
	fi fi
else
	node src/startup.js
fi
