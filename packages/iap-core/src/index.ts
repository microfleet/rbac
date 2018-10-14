import assert = require('assert');
import { promisify } from 'bluebird';
import getValue = require('get-value');
import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import * as Errors from './Errors';

const verifyAsync = promisify(verify);
const signAsync = promisify(sign) as any;
const {
  kInvalidTokenFormat,
  kJWTNotFound,
  kJWTNoUserId,
  kSecretNotFound,
  kJWTAlgMismatch,
} = Errors;

export interface IKeyIAP {
  id: string;
  type: 'rsa' | 'ecdsa';
  publicKey: string;
  algorithm?: AlgorithmsECDSA;
  key?: string;
  passphrase?: string | Buffer;
}

export interface ISecretIAP {
  id: string;
  secret: string | Buffer;
}

export interface IEncodedPayload {
  sub: string;
  [key: string]: any;
}

type AlgorithmsRSA = 'RS256' | 'RS384' | 'RS512';
type AlgorithmsECDSA = 'ES256' | 'ES384' | 'ES512';
type AlgorithmsShared = 'HS256' | 'HS384' | 'HS512';
type Algorithms = AlgorithmsRSA | AlgorithmsECDSA | AlgorithmsShared;

type Callback = (err: null | Error, secret?: string | Buffer) => void;

export interface IObjectLike {
  [key: string]: any;
}

export interface IConfigurationIAP {
  keys: IKeyIAP[];
  secrets: ISecretIAP[];
  assertionField: string;
  idField: string;
  tokenField: string;
  verifyOptions: VerifyOptions & {
    algorithms: Algorithms[],
  };
  signKey: IKeyIAP;
  signOptions: SignOptions;
}

const toTree = (
  tree: { [k: string]: any },
  item: { id: string, [k: string]: any },
) => {
  tree[item.id] = item;
  return tree;
};

export class IAP {
  private readonly config: IConfigurationIAP;
  private readonly keys: {
    [kid: string]: IKeyIAP,
  };
  private readonly secrets: {
    [sid: string]: ISecretIAP,
  };

  constructor(opts: IConfigurationIAP) {
    this.config = opts;
    this.resolveSecret = this.resolveSecret.bind(this);
    this.keys = opts.keys.reduce(toTree, Object.create(null));
    this.secrets = opts.secrets.reduce(toTree, Object.create(null));
  }

  /**
   * Extract JWT token from
   * @param payload - initial request to verify
   * @param opts - verification option overrides
   */
  public async verifyRequest(payload: IObjectLike, opts?: VerifyOptions): Promise<string> {
    const token = getValue(payload, this.config.tokenField);
    assert(typeof token === 'string' && token, kJWTNotFound);
    assert(token.slice(0, 3) === 'JWT', kInvalidTokenFormat);
    const extractedToken = token.slice(4);

    const { verifyOptions, signKey, signOptions } = this.config;
    const decoded = await verifyAsync(extractedToken, this.resolveSecret, {
      ...verifyOptions,
      ...opts,
    });

    const userId = (decoded as any)[this.config.idField];
    assert(typeof userId === 'string' && userId, kJWTNoUserId);

    const assertion = await signAsync({ sub: userId }, signKey, signOptions);
    payload[this.config.assertionField] = assertion;

    return assertion;
  }

  /**
   * Must be used to verify that IAP proxy was used
   * to augment and verify the request
   * @param  payload - augmented data object
   * @param  opts - verification override options
   * @return user id that performed the request
   */
  public async verifyProxy(payload: IObjectLike, opts?: VerifyOptions): Promise<string> {
    const token = payload[this.config.assertionField];
    assert(token, kJWTNotFound);

    const { verifyOptions, signKey } = this.config;
    const decoded = await verifyAsync(token, signKey.publicKey, {
      ...verifyOptions,
      ...opts,
    });

    if (typeof decoded === 'string') {
      throw kJWTNoUserId;
    }

    const sub = (decoded as IEncodedPayload).sub;
    assert(sub && typeof sub === 'string', kJWTNoUserId);

    return sub;
  }

  private resolveAsyncKey(header: any, key: IKeyIAP | void, callback: Callback) {
    if (key === undefined) {
      return callback(kSecretNotFound);
    }

    if (key.algorithm && header.alg !== key.algorithm) {
      return callback(kJWTAlgMismatch);
    }

    return callback(null, key.publicKey);
  }

  private resolveSharedKey(secret: ISecretIAP | void, callback: Callback) {
    if (secret === undefined) {
      return callback(kSecretNotFound);
    }

    return callback(null, secret.secret);
  }

  private resolveSecret(header: any, callback: Callback) {
    if (typeof header.kid === 'string') {
      return this.resolveAsyncKey(header, this.keys[header.kid], callback);
    } else if (typeof header.sid === 'string' && header.alg && header.alg.startsWith('HS')) {
      return this.resolveSharedKey(this.secrets[header.sid], callback);
    }

    return callback(kSecretNotFound);
  }
}

export { Errors };
export default IAP;
