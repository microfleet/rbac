import { HttpStatusError } from 'common-errors';

export const kNotFound = new HttpStatusError(404, 'not found');
export const kConflict = new HttpStatusError(409, 'resource already exists');
export const kNotSemver = new HttpStatusError(400, '"version" must adhere to semver');
export const kVersionLow = new HttpStatusError(204, 'version too low');
