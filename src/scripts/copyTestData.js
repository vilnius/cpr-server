var promisify = require('deferred').promisify;
var fs = require("fs");
var path = require("path");

var readdir = promisify(fs.readdir);
var config = require('./config.js');

var testImageDir = 'test_images';

function scanTestImageDirectory() {
    return readdir(testImageDir);
}

function copyFilesToIncomingDir(filePaths) {
    filePaths.forEach(function(filePath) {
        console.log('copying... ' + filePath);
        fs.createReadStream(testImageDir + '/' + filePath)
            .pipe(fs.createWriteStream(config.incomingImagesDir + '/' + filePath));
    });
}

function copyFilesForTesting() {
    scanTestImageDirectory().then(copyFilesToIncomingDir);
}

copyFilesForTesting();


