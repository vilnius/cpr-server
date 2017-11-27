var URL = 'https://cpr.vilnius.lt';

module.exports = {
  incomingImagesDir : 'incoming',
  reportImageDir    : 'processed',
  allowedImagesExtensions: [ 'jpg' ],
  limitToPlateCandidates: 3,
  limitToPlateConfidence: 66.6,
  staticServerUrl   : URL,
  FILENAME: '1.png',
  USERNAME: 'admin',
  PASSWORD: 'admin',
  LOGIN: URL + '/api/tokens/login',
  IMAGES: URL + '/api/images',
  SHOTS: URL + '/api/shots',
  WHITELISTED: URL + '/api/whitelist/search',
  URL : URL,
  OCRCOMMAND: 'docker run -i --rm -v $(pwd):/data:ro openalpr -j -c eu -p lt "'
};
