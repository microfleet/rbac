import { HttpStatusError } from 'common-errors';

export const kNotFound = new HttpStatusError(404, 'not found');
export const kConflict = new HttpStatusError(409, 'resource already exists');
