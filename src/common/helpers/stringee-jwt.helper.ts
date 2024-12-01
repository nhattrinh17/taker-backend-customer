import * as jwt from 'jsonwebtoken';

const generateAccessToken = () => {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = {
    typ: 'JWT',
    alg: 'HS256',
    cty: 'stringee-api;v=1',
  };

  const payload = {
    jti: process.env.STRINGEE_SID + '-' + now, //JWT ID
    iss: process.env.STRINGEE_SID, //API key sid
    exp: exp,
    rest_api: true,
  };

  const accessToken = jwt.sign(payload, process.env.STRINGEE_KEY, {
    algorithm: 'HS256',
    header: header,
  });

  return accessToken;
};

export { generateAccessToken };
