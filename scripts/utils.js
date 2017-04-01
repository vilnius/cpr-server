var fs       = require('fs'),
    path     = require('path'),
    deferred = require('deferred'),
    exec     = require('child_process').exec,
    moment   = require('moment'),
    r        = require('request'),
    URI      = require('./config').URL,
    request = r.defaults({ jar: true, uri: URI });

//noinspection JSUnresolvedVariable
module.exports = {
  execDeffered       : execDeffered,
  getImageEXIF       : getImageEXIF,
  moveProcessedImage : moveProcessedImage,
  requestp           : requestp,
  extractXsrfToken   : extractXsrfToken
};

function execDeffered(command) {
  var def = deferred();
  exec(command, function(error, stdout, stderr) {
    if (stdout.length > 0) {
      def.resolve(stdout);
    } else {
      console.error(stderr);
      console.error('error running command: ' + command);
      console.error(error);
      def.reject(arguments);
    }
  });
  return def.promise;
}

function createDir(path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) {
      console.warn('Unable to create directory: ', path);
    }
  }
}

function createDirRecursive(dirpath) {
  var parts = dirpath.split(path.sep);
  for( var i = 1; i <= parts.length; i++ ) {
    createDir( path.join.apply(null, parts.slice(0, i)) );
  }
}

function getDateAsDirectory(dateObj) {
  var year  = dateObj.getFullYear().toString();
  var month = dateObj.getMonth().toString() + 1;
  var day   = dateObj.getDate().toString();

  return '/' + year + '/' + month + '/' + day + '/';
}

function getImageEXIF(imagePath) {
  return execDeffered('exiftool -j -m -q "' + imagePath + '"').then(function(data) {
    return JSON.parse(data);
  });
}

function moveProcessedImage(imageData, targetDir, destinationDir) {
  var imageCapturedAt  = moment(imageData.exifData.FileModifyDate, 'Y:MM:DDD HH:mm:ss').format('Y-MM-DD_HH-mm-ss');
  var imageProcessedAt = moment().format('Y-MM-DD_HH-ss-SSS');

  if(!imageCapturedAt) {
    console.error('FAILED TO PROCESS EXIF DATE ', imageData.exifData.FileModifyDate); //throw error?
    return false;
  }

  //target
  var target = targetDir + '/' + imageData.exifData.FileName;
  //destination
  var newFileName = imageCapturedAt + '__' + imageProcessedAt + '.jpg';
  var destination = getDestinationDirectory(destinationDir) + newFileName;
  fs.rename(target, destination);
  return destination;
}

function getDestinationDirectory(destinationDir) {
  var processedImagesDir = destinationDir + getDateAsDirectory(new Date());
  createDirRecursive(processedImagesDir);
  return processedImagesDir;
}

function requestp(options) {
  console.log('options', options);
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


function extractXsrfToken(response, callback) {
  var cookies = response.headers['set-cookie'].join();
  var match = /XSRF-TOKEN=(.*?);/i.exec(cookies);
  if (match) {
    callback(match[1]);
  } else {
    throw new Error('XSRF Token not found');
  }
}