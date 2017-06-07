var r = require('request');
var Promise = require('promise');

var URI = require('./config').URL

var request = r.defaults({ jar: true, uri: URI });  // store cookies

function requestp(options) {
    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (err) {
                reject(err);
            } else if (res.statusCode >= 400) {
                err = new Error('Unexpected status code: ' + res.statusCode);
                err.res = res;
                reject(err);
            }
            resolve(res, body);
        });
    });
}

module.exports = {
    requestp
};
