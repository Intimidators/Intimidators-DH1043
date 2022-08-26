const bcrypt = require("bcrypt");
const keys = {
  upperCase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowerCase: "abcdefghijklmnopqrstuvwxyz",
  number: "0123456789",
  symbol: "!@#$%&*",
};

// method to generate a secure hashed password from a raw string of password
const generateHashedPassword = (rawPassword) => {
  return bcrypt.hashSync(rawPassword, 10);
};

// method to check if raw password (coming from login page) matches the hashed password (password stored in DB)
const checkPassword = (rawPassword, hashedPassword) => {
  return bcrypt.compareSync(rawPassword, hashedPassword);
};

const generateRandomPassword = () => {
  const getKey = [
    function upperCase() {
      return keys.upperCase[Math.floor(Math.random() * keys.upperCase.length)];
    },
    function lowerCase() {
      return keys.lowerCase[Math.floor(Math.random() * keys.lowerCase.length)];
    },
    function number() {
      return keys.number[Math.floor(Math.random() * keys.number.length)];
    },
    function symbol() {
      return keys.symbol[Math.floor(Math.random() * keys.symbol.length)];
    },
  ];

  const passwordLength = Math.floor(Math.random() * (32 - 24) + 24);
  let password = "";

  while (password.length < passwordLength) {
    let keyToAdd = getKey[Math.floor(Math.random() * getKey.length)];
    password += keyToAdd();
  }

  return password;
};

module.exports = {
  generateHashedPassword,
  checkPassword,
  generateRandomPassword,
};
