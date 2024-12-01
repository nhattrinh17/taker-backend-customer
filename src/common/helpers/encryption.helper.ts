import * as bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid';

export const generateHashedPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

export const validPassword = (password: string, passwordHashed: string) => {
  return bcrypt.compareSync(password, passwordHashed);
};

export const orderId = () => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 20);
  return nanoid();
};

export const generateTripId = () => {
  let now = Date.now().toString(); // '1492341545873'
  // pad with extra random digit
  now += now + Math.floor(Math.random() * 10);
  // format
  return [now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join('-');
};

export const checkIdType = (id: string) => {
  const orderIdPattern = /^[0-9A-Za-z]{20}$/;
  const tripIdPattern = /^[0-9]{4}-[0-9]{6}-[0-9]{4}$/;

  if (orderIdPattern.test(id)) {
    return 'orderId';
  } else if (tripIdPattern.test(id)) {
    return 'tripId';
  } else {
    return 'unknown';
  }
};
