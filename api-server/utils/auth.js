const jwt = require('jsonwebtoken');

const signToken = ({ _id, secret, expireTime }) => {
  return jwt.sign({ _id }, secret, { expiresIn: expireTime });
};

const isAdmin = ({ user }) => {
  return user && user.isAdmin;
};

module.exports = { signToken, isAdmin };