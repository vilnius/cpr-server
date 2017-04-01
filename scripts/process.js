var deferred = require('deferred');

var promisify = deferred.promisify;

var fs = require('fs');

var readdir = promisify(fs.readdir);

var config = require('./config.js');
var utils = require('./utils.js');
var execute = utils.execDeffered;

function start() {
  console.log('starting...');
  return readdir(config.incomingImagesDir).then(runOCR);
}

function generateReport(imageData) {

  //move image
  var newImageLocation = utils.moveProcessedImage(imageData, config.incomingImagesDir, config.reportImageDir);
  if(!newImageLocation) {
    console.log('generate report failed.. wrong destination path');
    return false;
  }

  //map object
  var ocrData  = imageData.results[0];
  var exifData = imageData.exifData;

  var reportObject = {
      localPath : newImageLocation,
    imagePath : config.staticServerUrl + newImageLocation,
    imageCaptured : exifData.FileModifyDate,
    reportCreated : new Date().toISOString(),
    plateName : ocrData.plate,
    plateConfidence : ocrData.confidence,
    coordinates : {
      lat : 0,// exifData.gps.lat?
      lon : 0,// exifData.gps.lon?
    },
    candidates : ocrData.candidates
  };

  sendReport(reportObject);
}

function parseEXIF(ocrObj) {
  return utils.getImageEXIF(ocrObj.imagePath).then(function(exifData) {
    ocrObj.exifData = exifData[0];
    return ocrObj;
  });
}

function runOCR(imagePaths) {
  if(imagePaths) {
    console.log('starting ocr process...');
    console.log(imagePaths);
    imagePaths.forEach(function(imagePath){
      if(checkFileIntegrity(imagePath)) {
        imagePath = config.incomingImagesDir + '/' + imagePath;
        console.log('processing image: ', imagePath);
        execute('alpr -j -c eu "' + imagePath + '"')
            .then(function(data) {
              console.log('parsing ocr data... ');
              var ocrData = JSON.parse(data);
              ocrData.imagePath = imagePath;
              if(ocrData.results.length < 1) {
                console.log('there are no results for image. removing..: ', imagePath);
                fs.unlink(imagePath);
                var def = deferred();
                return def.reject();
              }
              return ocrData;
            })
            .then(parseEXIF)
            .then(generateReport);
      }
    });
  } else {
    console.log('no images found in directory exiting...');
  }

  if(imagePaths.length < 1) {
    console.log('no images to process exiting...');
  }
}

function checkFileIntegrity(imagePath) {
  return true;
}

function sendReport(reportObject) {
    var headers = {};
    utils.requestp({ uri: config.URL })
        .then(response => new Promise(resolve => utils.extractXsrfToken(response, resolve)))
        .then(xsrftoken => headers['x-xsrf-token'] = xsrftoken)
        .then(() => login(headers))
        .then(() => processFile(reportObject.localPath, headers, reportObject))
        .catch(err => console.error('Upload failed', err));

}

function processFile(filename, headers, report) {
    console.log('Uploading', filename);
    return utils.requestp({
        uri: config.IMAGES,
        method: 'POST',
        headers,
        formData: {
            image: fs.createReadStream(filename)
        }
    })
        .then(response => JSON.parse(response.body).filename)
        .then(imageId => createPenalty(imageId, headers, report));
}

function createPenalty(imageId, headers, report) {
    console.log('Creating penalty for imageId', imageId);
    return utils.requestp({
        uri: config.PENALTIES,
        method: 'POST',
        headers,
        body: generatePenalty(imageId, report),
        json: true
    }).then(response => {
        fs.unlink(report.localPath);
        console.log('Penalty created successfully!')
    });
}

function login(headers) {
    return utils.requestp({
        uri: config.LOGIN,
        method: 'POST',
        body: { username: config.USERNAME, password: config.PASSWORD},
        headers,
        json: true
    }).then(() => {
        console.log('Login successful!');
    });
}

function generatePenalty(imageId, report) {
    console.log('generating penalty...');
    var candidates = report.candidates.map(candidate => {
        return {
            plate : candidate.plate,
            probability: candidate.confidence
        }
    });

    return {
        image: imageId,
        plate: report.plateName,
        gps: {
            lat: report.coordinates.lat,
            lon: report.coordinates.lon
        },
        plates: candidates,
        shotAt: report.reportCreated
    };
}

start();
//getDirectoryPath();
