const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
const { red } = require("chalk");
app.use(cookieParser());
const bcrypt = require('bcrypt');


// GENERATE RANDOM SHORT URL
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

// URL DATABASE (TEMP)
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// shortURL: { longURL: "www.example.com", userID: "id"}

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
  return false;
}
function matchingPassword(pass){
  for (let key in users) {
    if(users[key].password===pass) {
      return true;
    }
  }
  return false;
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
      return users[key].id;
    }
  }
}
function getUserURLS(urlDatabase, id) {
  let userURLS = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) { // userRandomID === (id)
      userURLS[key] = urlDatabase[key]; // adding new url to urldatabase
    }
  }
  return userURLS;
};




// LOGIN
app.post("/login", (req, res) => {
  let email = req.body.email;
  let pass = req.body.password;
  const user = matchingUser(email);
  console.log("pass: ", pass);
  console.log("user.password: ", user.password);
  console.log("user: ", user);

  
  //1. if email doesn't exist
  if (!checkEmailExists(email)) {
    res.status(401).send("No user with that username found");
    //2. If email exists, but password doesnt match
  } else if (checkEmailExists(email)) {
    
    // if (!matchingPassword(pass)) {
    //   console.log("Password does not match for existing user!");
    //   res.status(401).send("Password is incorrect");
    // }
    // // if email exists, and password matches
    // if (matchingPassword(pass)) {
    //   console.log("Success! Email exists, password matches.");
    //   res.cookie("user_id", matchingID(email, pass));
    //   res.redirect("/urls"); 
    // }
    bcrypt.compare(pass, user.password, (err, result) => {
      if (result) {
        res.cookie("user_id", matchingID(email, pass));
        res.redirect("/urls"); 
      } else {
        return res.status(401).send("Password incorrect");
      }
    });

  };
  
});







// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  //1. We need to check whether the email or password is not blank
  const email = req.body.email;
  const pass = req.body.password;
  if(email==="" || pass === ""){
    res.send("Please enter email and password. They cannot be blank");
  }

  //2. We need to make sure the email has not already been taken
  if(checkEmailExists(email)){
    res.send("Email has already been taken. Please try with another one!");
  } else{
    //need to create a new user
    let id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(pass, 10);

    let newUser = {
      id: id,
      email: email, 
      password: hashedPassword
    }
    //assign the new user to the users database
    users[id] = newUser;
    console.log(users);

    //write a cookie 
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

// GET
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const currentUser = (req.cookies["user_id"]);
  if (!currentUser) {
    res.send("Please login or register")
  } else {
    let userURLS = getUserURLS(urlDatabase, currentUser);
  const templateVars = { urls: userURLS, currentUser, };
  res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
  const templateVars = { username: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, username: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.body["username"] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { username: req.body["username"] };
  console.log(req.body);
  res.render("urls_login", templateVars);
});

// DELETE LINK BUTTON
app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUser = (req.cookies["user_id"]);
  if (currentUser) {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
  } else {
    res.status(401).send("Not permitted");
  }
});

// POSTS
app.post("/urls", (req, res) => {  
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL : req.body.longURL, userID: req.cookies['user_id']};
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`); 
});

app.post("/urls/:shortURL/update", (req, res) => {
  const currentUser = (req.cookies["user_id"]);
  if (currentUser) {
    const { shortURL } = req.params;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(401).send("Not permitted");
  }
});



