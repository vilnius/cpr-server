/*

Sample node.js application to create new penalty
based on https://github.com/request/request

*/
var request = require('request');
var fs = require('fs');

var config = require('./config.js');
var request = request.defaults({ jar: true });  // store cookies

function random(low, high) {
    return Math.random() * (high - low) + low;
}

function randomPlate() {
    return "GOV" + Math.floor(random(0, 9.9)) + Math.floor(random(0, 9.9)) + Math.floor(random(0, 9.9));
}

function generateRandomPenalty(imageId) {
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
};

/* LOGIN */
request({
    url: config.LOGIN, 
    method: 'POST',
    body: { username: config.USERNAME, password: config.PASSWORD},
    json: true
}, function (error, response, body) {
    if (error || response.statusCode !== 200) { 
        return console.log('Unable to login!', body);
    }
    /* UPLOAD IMAGE */
    request({
        url: config.IMAGES, 
        method: 'POST',
        formData: {
            image: fs.createReadStream(config.FILENAME)
        }
    }, function (error, response, body) {
        if (error || response.statusCode !== 201) { 
            return console.log('Unable to upload image!', body);
        }
        var imageId = JSON.parse(body).filename
        console.log("Image saved as ", imageId);

        /* CREATE PENALTY */
        request({
            url: config.PENALTIES, 
            method: 'POST',
            body: generateRandomPenalty(imageId),
            json: true
        }, function (error, response, body) {
            if (error || response.statusCode !== 201) { 
                return console.log('Unable to create penalty!', body);
            }
            console.log("Penalty created!", body);
        });
    });
});
