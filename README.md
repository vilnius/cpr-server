# Car Plate Reader Server

API backend of CPR application, also serves frontend single page application
[cpr-frontend](https://github.com/vilnius/cpr-frontend). 
Built using node.js, express, passport, mongoose (MongoDB).

## Running cpr-server

You need MongoDB installed on local machine: `sudo apt-get install mongodb-server`.
Copy `config.js.template` to `config.js` and update `STATIC_ROOT` to
point to `cpr-frontend`'s `dist` folder, e.g. `export const STATIC_ROOT = path.join(__dirname, '..', 'cpr-frontend', 'dist');`
Build cpr-frontend first and then:
```
npm install
npm run start
```
Application will create default user `admin` with password `admin` on first run.
Navigate to http://localhost:3000 on your browser.
API root is at http://localhost:3000/api.

## MQTT

Server requires running mosquitto broker server on `localhost:1883`. For OS X:
```
brew install mosquitto
```

For Ubuntu mosquitto from official repo does not work, install using these commands:

```
sudo apt-add-repository ppa:mosquitto-dev/mosquitto-ppa
sudo apt-get update
sudo apt-get install mosquitto libmosquitto-dev mosquitto-clients
sudo service mosquitto status  # check to see if it's running
```

As an alternative you can launch MQTT broker server inside docker:
```
docker run -ti -p 1883:1883 -p 9001:9001 toke/mosquitto
```

## API

All cpr-server API endpoints start with `/api`.

### `/auth`
Authentication is session based so far. You can get your session set by posting username/password to `/api/auth/login`.

```
GET / - read `XSRF-TOKEN` cookie and pass it to next requests as `x-xsrf-token`
POST /api/auth/login {"username": "admin", "password": "admin" } - sets user session cookie
POST /api/auth/logout
GET /api/auth/me - get current user information
```

### `/users`
Basic CRUD using endpoint `/api/users`.

### `/lanemaps`

### `/penalties`

### `/whitelist`
