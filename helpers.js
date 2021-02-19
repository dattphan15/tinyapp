// URL DATABASE (TEMP)
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// USER DATABASE (TEMP)
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

// HELPER FUNCTIONS
// Returns true if email exists
function checkEmailExists(email){
  for(let key in users){
    if(users[key].email===email){
      return true;
    }
  }
  return undefined;
}
// Returns entire user object if email matches an existing user
function matchingUser(email) {
  for (let key in users) {
    if(users[key].email === email) {
      return users[key];
    }
  }
}
// Returns matching user ID, based on email and password parameters
function matchingID(email, pass) {
  for (let key in users) {
    if ((users[key].password === pass) && (users[key].email === email)) {
      return users[key].id;
    }
  }
}
// Creates new URLs object list by specific user ID
function getUserURLS(urlDatabase, id) {
  let userURLS = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURLS[key] = urlDatabase[key]; // adding new urls to urldatabase
    }
  }
  return userURLS;
};

// GENERATE RANDOM SHORT URL/ID
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

module.exports = { urlDatabase, users, checkEmailExists, matchingUser, matchingID, getUserURLS, generateRandomString };