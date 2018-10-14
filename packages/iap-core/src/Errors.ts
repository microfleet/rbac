import { HttpStatusError } from 'common-errors';

export const kJWTNotFound = new HttpStatusError(401, 'Authorization Required');
export const kJWTNoUserId = new HttpStatusError(500, 'user id missing');
export const kSecretNotFound = new HttpStatusError(500, 'secret not found');
export const kInvalidTokenFormat = new HttpStatusError(403, 'Invalid Token Format');
export const kJWTAlgMismatch = new HttpStatusError(403, 'key-alg mismatch');
