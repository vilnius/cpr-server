import { readFileSync } from 'fs';
import path from 'path';
import { createPrivateKey, createPublicKey } from 'ursa';

import * as config from '../../config';

export const submitPoliceReport = (violation) => new Promise((resolve, reject) => {
  let key, crt;
  try {
    key = createPrivateKey(readFileSync(config.PRIVATE_KEY), config.PRIVATE_KEY_SECRET);
    crt = createPublicKey(readFileSync(config.PUBLIC_CERT));
  } catch(err) {
    console.error('Error reading private keys!', err.toString());
    return reject(err);
  }
  const images = violation.images.map((image) => path.join(config.UPLOAD_PATH, image));
  resolve(true);
});
