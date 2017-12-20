/*

Sample node.js application to create new shot
based on https://github.com/request/request

*/
var request = require('request');
var fs = require('fs');

var config = require('./config.js');
var requestp = require('./utils').requestp;

function random(low, high) {
    return Math.random() * (high - low) + low;
}

function randomPlate() {
    return "GOV" + Math.floor(random(0, 9.9)) + Math.floor(random(0, 9.9)) + Math.floor(random(0, 9.9));
}

function generateRandomShot(imageId) {
    return {
        image: imageId,
        plate: randomPlate(),
        gps: {
            lat: random(54.39, 54.44),
            lon: random(25.11, 25.19)
        },
        plates: [
            { plate: randomPlate(), probability: Math.random() }
        ],
        shotAt: new Date()
    };
}

function login(headers) {
    return requestp({
        uri: config.LOGIN,
        method: 'POST',
        body: { username: config.USERNAME, password: config.PASSWORD},
        headers,
        json: true
    }).then(data => data.body.token);
}

function processFile(filename, token) {
    console.log('Uploading', filename);
    const headers = {
        Authorization: 'jwt ' + token
    };
    return requestp({
        uri: config.IMAGES,
        method: 'POST',
        headers,
        formData: {
            image: fs.createReadStream(filename)
        }
    })
    .then(response => JSON.parse(response.body).filename)
    .then(imageId => createShot(imageId, headers));
}

function createShot(imageId, headers) {
    console.log('Creating shot for imageId', imageId);
    return requestp({
        uri: config.SHOTS,
        method: 'POST',
        headers,
        body: generateRandomShot(imageId),
        json: true
    })
    .then(response => console.log('Shot created successfully!', response.body));
}

//
// Main application
//
// LOGIN ---> UPLOAD IMAGE ---> CREATE SHOT

console.log(`Start uploading ${config.FILENAME}...`);

login().then(token => processFile(config.FILENAME, token)).catch(err => console.error('Upload failed', err));
