var deferred = require('deferred');

var promisify = deferred.promisify;

var fs = require('fs');

var readdir = promisify(fs.readdir);

var config = require('./config.js');
var utils = require('./utils.js');
var execute = utils.execDeffered;

function start() {
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
  console.log('starting ocr process...', imagePaths);
  imagePaths.forEach(function(imagePath){
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
  });

  if(imagePaths.length < 1) {
    console.log('no images to process exiting...');
  }
}

function sendReport(reportObject) {
  console.log(JSON.stringify(reportObject, null, 4));
}

start();
//getDirectoryPath();
