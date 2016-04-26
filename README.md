# Car Plate Reader Server

API backend of CPR application, also serves frontend single page application.

## Requirements

Built using node.js, express, passport, mongoose (MongoDB).
Dev server runs on nodemon, to install it: `sudo npm install nodemon -g`.

## Running

```
npm install
npm run start
```

## API

### auth

Authentication is session based so far. You can get your session set by POSTing JSON to /api/auth/login.

```
POST /api/auth/login {"username": "admin", "password": "admin" }
(AUTH) POST /api/auth/logout
(AUTH) GET /api/auth/me - get current user information
```

### users

Basic CRUD using endpoint `/api/users`. Cannot change user's password, yet.

### lanemaps

CRUD of `/api/lanemaps`
