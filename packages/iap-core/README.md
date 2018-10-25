# IAP

Identity Aware Proxy is designed to verify authentication claims provided by a JWT token.
Token can be located in common places (headers, message body) of the message, verify the signature, extract payload of the JWT token and sign the message with own set of RSA keys so that subsequent services can verify validity of claim verifications

## Configuration

```ts
import IAP from '@microfleet/iap-core';

interface IKeyIAP {
  id: string;
  type: 'rsa' | 'ecdsa';
  algorithm?: AlgorithmsECDSA;
  publicKey: string;
  privateKey?: string;
  passphrase?: string;
  audiences: string[];
}

interface ISecretIAP {
  id: string;
  secret: string;
  audiences: string[];
}

type AlgorithmsRSA = 'RS256' | 'RS384' | 'RS512';
type AlgorithmsECDSA = 'ES256' | 'ES384' | 'ES512';
type AlgorithmsShared = 'HS256' | 'HS384' | 'HS512';
type Algorithms = AlgorithmsRSA | AlgorithmsECDSA | AlgorithmsShared;

interface IConfigurationIAP {
  keys: IKeyIAP[];
  secrets: ISecretIAP[];
  algorithms: Algorithms[];
  sign: true | IKeyIAP;
}

const iap = new IAP(configuration: IConfigurationIAP);
```

## Verification Process and APIs

1. find JWT in the passed payload, JWT location must be set via config
2. verify that header includes `kid` or `sid`: use RSA/ECDSA authentication method or secret for verification
4. pass on to jwt.verify
5. in case of success set `x-iap-jwt-assertion`
6. `x-iap-jwt-assertion` must contain stable user id in the `sub` field in the payload
