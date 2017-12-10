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

## Exiftool

Server requires exiftool binary installed

Installation Mac OS X:

```
sudo brew update
sudo brew install exiftool
```

Installation Linux:

```
sudo apt-get update
sudo apt-get install libimage-exiftool-perl
```

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

### `/tokens`
Authentication is done using [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token). You can get your token by posting username/password to `/api/tokens/login`. It is valid for 3 days by default, to refresh a token, send a POST to `/api/tokens/refresh`.

### `/users`
Basic CRUD using endpoint `/api/users`. Requires `admin` role.

### `/roles`
Modifying roles requires `admin` role. To assign user a role, POST to `/roles/<rolename>` with `{ username: "<username>" }`.
To remove role from a user, send a DELETE to `/roles/<rolename>` with the same JSON.

### `/lanemaps`

### `/shots`

### `/whitelist`

### `/violations`
