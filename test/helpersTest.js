const { assert } = require('chai');

const { matchingID, matchingUser, checkEmailExists } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const pass = "purple-monkey-dinosaur";

describe('matchingID', function() {
  it('should return a user ID with valid email', function() {
    const user = matchingID("user@example.com", pass);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });
});

// const email = "user@example.com";

describe('matchingUser', function() {
  it('should return a user object with valid email', function() {
    const user = matchingUser('user@example.com');
    const expectedOutput = {
      id: 'userRandomID',
      email: 'user@example.com',
      password: 'purple-monkey-dinosaur'
    };
    assert.deepEqual(user, expectedOutput);
  });
});

describe('checkEmailExists', function() {
  it('should return undefined if user email does not exist', function() {
    const user = checkEmailExists("non-existent@hotmail.com")
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});

  describe('checkEmailExists', function() {
    it('should return true if user email exists', function() {
      const user = checkEmailExists("user@example.com")
      const expectedOutput = true;
      assert.strictEqual(user, expectedOutput);
    });
});