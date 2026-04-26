const EC = require('elliptic').ec;
const BN = require('bn.js');
const crypto = require('crypto');

const ec = new EC('secp256k1');

function generateChallenge() {
  return new BN(crypto.randomBytes(32)).toString('hex');
}

function verifySchnorrResponse({ R, s, c, pub }) {
  try {
    
    const R_point = ec.keyFromPublic(R, 'hex').getPublic();
    const pub_point = ec.keyFromPublic(pub, 'hex').getPublic();

    const sBN = new BN(s, 16);
    const cBN = new BN(c, 16);

    /* computing  sG = R + cY */ 
    const sG = ec.g.mul(sBN);
    const cY = pub_point.mul(cBN);

    const v = sG.add(cY.neg());

    return v.eq(R_point);

  } catch (err) {
    return false;
  }
}

module.exports = {
  generateChallenge,
  verifySchnorrResponse
};
