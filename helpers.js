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
function checkEmailExists(email){
  for(let key in users){
    if(users[key].email===email){
      return true;
    }
  }
  return undefined;
}
function matchingUser(email) {
  for (let key in users) {
    if(users[key].email === email) {
      return users[key];
    }
  }
}
function matchingID(email, pass) {
  for (let key in users) {
    if ((users[key].password === pass) && (users[key].email === email)) {
      // console.log("userskeyid: ", users[key].id);
      return users[key].id;
    }
  }
}
function getUserURLS(urlDatabase, id) {
  let userURLS = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) { // userRandomID === (id)
      userURLS[key] = urlDatabase[key]; // adding new url to urldatabase
      // console.log(userURLS);
    }
  }
  return userURLS;
};

// GENERATE RANDOM SHORT URL/ID
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

module.exports = { urlDatabase, users, checkEmailExists, matchingUser, matchingID, getUserURLS, generateRandomString };