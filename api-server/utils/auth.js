const jwt = require('jsonwebtoken');

const signToken = ({ _id, secret, expireTime }) => {
  return jwt.sign({ _id }, secret, { expiresIn: expireTime });
};

module.exports = { signToken };