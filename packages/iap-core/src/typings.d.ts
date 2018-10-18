import { VerifyCallback, VerifyOptions } from 'jsonwebtoken'

type Callback = (err: null | Error, key?: string | Buffer) => void
type secretOrPublicKeyCallback = (header: object, callback: Callback) => void

declare module 'jsonwebtoken' {
  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer | secretOrPublicKeyCallback,
    options?: VerifyOptions,
    callback?: VerifyCallback
  ): void
}

declare module 'crypto' {
  export function generateKeyPair(
    type: string,
    opts: any,
    callback: (err: Error | null, key: { publicKey: string, privateKey: string }) => void
  ): void
}
