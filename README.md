# Car Plate Reader Server

API backend of CPR application, also serves frontend single page application
[cpr-frontend](https://github.com/vilnius/cpr-frontend).

## Requirements

Built using node.js, express, passport, mongoose (MongoDB).
Dev server runs on nodemon, to install it: `sudo npm install nodemon -g`.

## Running

Copy `config.js.template` to `config.js` and update `STATIC_ROOT` to
point to `cpr-frontend`'s `dist` folder.

```
npm install
npm run start
```

## MQTT

Server requires running mosquitto broker server on `localhost:1883`. For OS X:
> brew install mosquitto

For Ubuntu mosquitto from official repo does not work, install using these commands:

> sudo apt-add-repository ppa:mosquitto-dev/mosquitto-ppa
> sudo apt-get update
> sudo apt-get install mosquitto libmosquitto-dev mosquitto-clients
> sudo service mosquitto status  # check to see if it's running

## API

All cpr-server API endpoints start with `/api`.

### `/auth`
Authentication is session based so far. You can get your session set by posting username/password to `/api/auth/login`.

```
POST /api/auth/login {"username": "admin", "password": "admin" } - sets user session cookie
POST /api/auth/logout
GET /api/auth/me - get current user information
```

### `/users`
Basic CRUD using endpoint `/api/users`. Cannot change user's password, yet.

### `/lanemaps`

### `/penalties`

### `/whitelist`
