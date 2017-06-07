var deferred = require('deferred');
var promisify = deferred.promisify;
var fs = require('fs');
var readdir = promisify(fs.readdir);
var config = require('./config.js');
var utils = require('./utils.js');
var execute = utils.execDeffered;
var _ = require('lodash');


function log() {
    let args, dateInstance,
        day, month, year,
        dateFormatted;

    args = Array.prototype.slice.call(arguments);

    if (!args.length) {
      return;
    }

    dateInstance = new Date();

    [ day, month, year ] =
      dateInstance.toLocaleDateString().split('/');

    dateFormatted =
        [ year, month, day ].join('-') + ' ' + dateInstance.toLocaleTimeString();

    args.unshift(dateFormatted);

    console.log.apply(console, args);
}

function start() {
  log('starting...');
  return readdir(config.incomingImagesDir)
    .then((imagePaths) => {
      imagePaths = imagePaths.filter(isAllowedExtensionFile);

      return runOCR(imagePaths);
    });
}

function isAllowedExtensionFile(filePath) {
  const fileExtension = filePath
    .split('.')
    .pop()
    .toLowerCase();

  return config.allowedImagesExtensions
    .indexOf(fileExtension) !== -1;
}

function convertGPSDataToNumericFormat(str) {
  let [ dd, mm, ss ] = str
      .replace(' deg', '')
      .split(' ')
      .map(num => parseFloat(num, 10));

  return dd + (mm * 60 + ss) / 3600;
}

function generateReport(imageData) {
  // Move image
  var newImageLocation = utils.moveProcessedImage(
    imageData,
    config.incomingImagesDir,
    config.reportImageDir
  );

  if (!newImageLocation) {
    log('generate report failed.. wrong destination path');
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
      lat : _.get(imageData, 'exifData.GPSLatitude', '99 99 99'),
      lon : _.get(imageData, 'exifData.GPSLongitude', '99 99 99'),
    },
    candidates : ocrData.candidates
  };

  sendReport(reportObject);
}

function parseEXIF(ocrObj) {
  return utils
    .getImageEXIF(ocrObj.imagePath)
    .then(exifData => {
      ocrObj.exifData = exifData[0];
      return ocrObj;
  });
}

function runOCR(imagePaths) {
  if (imagePaths && imagePaths.length === 0) {
    log('no images to process exiting...');
    return;
  }

  log('starting ocr process...');
  log(imagePaths);

  imagePaths
    .filter(checkFileIntegrity)
    .forEach((imagePath) => {

      imagePath = config.incomingImagesDir + '/' + imagePath;
      log('processing image: ', imagePath);
      execute(config.OCRCOMMAND + imagePath + '"')
        .then((data) => {
            var ocrData = parseAndPrepareOCROutput(
              data, imagePath
            );

            return ocrData
              ? ocrData
              : deferred.reject();
        })
        .then(parseEXIF)
        .then(generateReport);
  });
}

function parseAndPrepareOCROutput(outputString, imagePath) {
  var ocrData = JSON.parse(outputString),
      results = ocrData.results,
      candidates = _.get(results, '[0].candidates', []);

  candidates = candidates
    .filter(candidate => candidate.matches_template)
    .filter(candidate => candidate.confidence >= config.limitToPlateConfidence)
    .splice(-1 * config.limitToPlateCandidates);

  if (results.length === 0 || candidates.length === 0) {
    log('there are no results for image. removing..: ', imagePath);
    fs.unlinkSync(imagePath);
    return false;
  } else {
    log(`Plate number found: ${candidates[0].plate} (confidence=${candidates[0].confidence}%)`);
  }

  ocrData.results[0].candidates = candidates;
  ocrData.imagePath = imagePath;

  return ocrData;
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
    log('Uploading', filename);
    return utils.requestp({
        uri: config.IMAGES,
        method: 'POST',
        headers,
        formData: {
            image: fs.createReadStream(filename)
        }
      })
      .then(response => JSON.parse(response.body).filename)
      .then(imageId => createShot(imageId, headers, report));
}

function createShot(imageId, headers, report) {
    log('Creating shot for imageId', imageId);
    return utils.requestp({
        uri: config.SHOTS,
        method: 'POST',
        headers,
        body: generateShot(imageId, report),
        json: true
    }).then(response => {
        fs.unlinkSync(report.localPath);
        log('Shot created successfully!')
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
        log('Login successful!');
    });
}

function generateShot(imageId, report) {
    log('Generating shot...');
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
            lat: convertGPSDataToNumericFormat(report.coordinates.lat),
            lon: convertGPSDataToNumericFormat(report.coordinates.lon),
        },
        plates: candidates,
        shotAt: report.reportCreated
    };
}

start();
//getDirectoryPath();
