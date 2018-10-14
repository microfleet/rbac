import { generateKeyPair, randomBytes } from 'crypto';
import { sign } from 'jsonwebtoken';
import { fingerprint } from 'key-fingerprint';
import { promisify } from 'util';
import IAP, { Errors, IConfigurationIAP, IKeyIAP, IObjectLike, ISecretIAP } from '../src';

const generateKeyPairAsync = promisify(generateKeyPair);
const randomBytesAsync = promisify(randomBytes);
const signAsync = promisify(sign) as any;

let userId: string;
let iap: IAP;
let opts: IConfigurationIAP;
let iapSignKey: IKeyIAP;
let iapServiceKey: IKeyIAP;
let iapSharedSecret: ISecretIAP;
let validJWTToken: string;
let invalidJWTToken: string;
let jwtNoKid: string;
let jwtNoSid: string;
let jwtNonCompliant: string;
let jwtSid: string;

const genPassPhrase = (size = 32, encoding = 'base64') => () => (
  randomBytesAsync(size).then((x) => x.toString(encoding))
);

const genPassPhrase32b = genPassPhrase();

const genRSAKeyPair = (modulus = 2048, passphrase: string) => (
  generateKeyPairAsync('rsa', {
    modulusLength: modulus,
    privateKeyEncoding: {
      cipher: 'aes-256-cbc',
      format: 'pem',
      passphrase,
      type: 'pkcs8',
    },
    publicKeyEncoding: {
      format: 'pem',
      type: 'spki',
    },
  })
);

const genECDSAKeyPair = (modulus = 2048, namedCurve = 'prime256v1', passphrase: string) => (
  generateKeyPairAsync('ec', {
    modulusLength: modulus,
    namedCurve,
    privateKeyEncoding: {
      cipher: 'aes-256-cbc',
      format: 'pem',
      passphrase,
      type: 'pkcs8',
    },
    publicKeyEncoding: {
      format: 'pem',
      type: 'spki',
    },
  })
);

beforeAll(async () => {
  const keySecret = await genPassPhrase32b();
  const [rsaKeyPair, dsaKeyPair] = await Promise.all([
    genRSAKeyPair(2048, keySecret),
    genECDSAKeyPair(2048, 'prime256v1', keySecret),
  ]);

  iapSignKey = {
    id: fingerprint(rsaKeyPair.publicKey),
    key: rsaKeyPair.privateKey,
    passphrase: keySecret,
    publicKey: rsaKeyPair.publicKey,
    type: 'rsa',
  };

  iapServiceKey = {
    id: fingerprint(dsaKeyPair.publicKey),
    key: dsaKeyPair.privateKey,
    passphrase: keySecret,
    publicKey: dsaKeyPair.publicKey,
    type: 'ecdsa',
  };

  iapSharedSecret = {
    id: fingerprint(keySecret),
    secret: keySecret,
  };

  opts = {
    assertionField: 'x-iap-jwt-assertion',
    idField: 'username',
    keys: [iapServiceKey],
    secrets: [{
      id: iapSharedSecret.id,
      secret: Buffer.from(iapSharedSecret.secret as string, 'base64'),
    }],
    signKey: iapSignKey,
    signOptions: {
      algorithm: 'RS256',
      expiresIn: '1h',
      header: {
        kid: iapSignKey.id,
      },
      issuer: 'mf:iap',
    },
    tokenField: 'authorization',
    verifyOptions: {
      algorithms: [
        'RS256', 'RS384', 'RS512',
        'ES256', 'ES384', 'ES512',
        'HS256', 'HS384', 'HS512',
      ],
    },
  };

  iap = new IAP(opts);
});

beforeEach(async () => {
  userId = await genPassPhrase32b();

  validJWTToken = await signAsync({ [opts.idField]: userId }, iapServiceKey, {
    algorithm: opts.signOptions.algorithm,
    keyid: iapServiceKey.id,
  });

  invalidJWTToken = `${validJWTToken}111`;

  jwtNoKid = await signAsync({ [opts.idField]: userId }, iapServiceKey, {
    algorithm: opts.signOptions.algorithm,
  });

  jwtNoSid = await signAsync({ [opts.idField]: userId }, iapSharedSecret.secret);

  jwtSid = await signAsync(
    { [opts.idField]: userId },
    Buffer.from(iapSharedSecret.secret as string, 'base64'),
    {
      algorithm: 'HS512',
      header: {
        sid: iapSharedSecret.id,
      },
    },
  );

  jwtNonCompliant = await signAsync({ crap: 'oops' }, iapServiceKey, {
    algorithm: 'ES384',
    keyid: iapServiceKey.id,
  });
});

test('fails to verify when token cant be found', async () => {
  expect.assertions(1);
  await expect(iap.verifyRequest({ random: `JWT ${validJWTToken}` }))
    .rejects.toThrow(Errors.kJWTNotFound.message);
});

test('rejects to verify invalid JWT token', async () => {
  expect.assertions(1);
  await expect(iap.verifyRequest({ authorization: `JWT ${invalidJWTToken}` }))
    .rejects.toThrow();
});

test('rejects to verify invalid JWT token', async () => {
  expect.assertions(1);
  await expect(iap.verifyRequest({ authorization: `JWT ${jwtNoKid}` }))
    .rejects.toThrow();
});

test('rejects to verify invalid JWT token', async () => {
  expect.assertions(1);
  await expect(iap.verifyRequest({ authorization: `JWT ${jwtNoSid}` }))
    .rejects.toThrow();
});

test('rejects to verify invalid JWT token', async () => {
  expect.assertions(1);
  await expect(iap.verifyRequest({ authorization: `JWT ${jwtNonCompliant}` }))
    .rejects.toThrow();
});

test('rejects to verify invalid JWT token', async () => {
  expect.assertions(1);
  await expect(iap.verifyRequest({ authorization: `JWT ${invalidJWTToken}` }))
    .rejects.toThrow();
});

test('correctly verifies token with sid', async () => {
  const header: IObjectLike = { authorization: `JWT ${jwtSid}` };

  expect.assertions(3);
  await expect(iap.verifyRequest(header)).resolves.toBeDefined();
  expect(header[opts.assertionField]).toBeDefined();
  await expect(iap.verifyProxy(header)).resolves.toEqual(userId);
});

test('correctly verifies token with kid', async () => {
  const header: IObjectLike = { authorization: `JWT ${validJWTToken}` };

  expect.assertions(3);
  await expect(iap.verifyRequest(header)).resolves.toBeDefined();
  expect(header[opts.assertionField]).toBeDefined();
  await expect(iap.verifyProxy(header)).resolves.toEqual(userId);
});
