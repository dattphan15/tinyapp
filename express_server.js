// FILE FORMATTING ------------------------------------------------------
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { red } = require("chalk");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));
const { urlDatabase, users, checkEmailExists, matchingUser, matchingID, getUserURLS, generateRandomString } = require('./helpers');
// -----------------------------------------------------------------------


// LOGIN
app.get("/login", (req, res) => {
  const currentUser = users[req.session.user_id];
  const templateVars = { currentUser: currentUser };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let pass = req.body.password;
  const user = matchingUser(email);

  if(email==="" || pass === ""){
    res.send("Please enter email and password. They cannot be blank");
  }
  if (!checkEmailExists(email)) {
    res.status(401).send("No user with that username found");
  } else if (checkEmailExists(email)) {
    bcrypt.compare(pass, user.password, (err, result) => {
      if (result) {
        req.session.user_id = user.id;
        res.redirect("/urls"); 
      } else {
        return res.status(401).send("Password incorrect");
      }
    });
  };
});


// LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});


// REGISTER
app.get("/register", (req, res) => {
  const currentUser = users[req.session.user_id];
  const templateVars = { currentUser: currentUser };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  if(email==="" || pass === ""){
    res.send("Please enter email and password. They cannot be blank");
  }
  if(checkEmailExists(email)){
    res.send("Email has already been taken. Please try with another one!");
  } else{
    const randomID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(pass, 10);
    let newUser = {
      id: randomID,
      email: email, 
      password: hashedPassword
    }
    users[randomID] = newUser;
    // assign cookie to new user 
    req.session.user_id = newUser.id;
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
  const currentUser = users[req.session.user_id];
  const currentSession = req.session.user_id;

  if (currentSession === null) {
    res.send("Please login or register")
  } else {
    let userURLS = getUserURLS(urlDatabase, currentSession);
    const templateVars = { urls: userURLS, currentUser: currentUser };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (req.session.user_id) {
  const templateVars = { currentUser: currentUser };
  res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const currentUser = users[req.session.user_id];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, currentUser: currentUser };
  if(!urlDatabase[req.params.shortURL]) {
    res.status(404).send('404 Page not found');
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(403).send('403 Forbidden');
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// POSTS
app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUser = (req.session.user_id);
  if (currentUser) {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
  } else {
    res.status(401).send("Not permitted");
  }
});

app.post("/urls", (req, res) => {  
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL : req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`); 
});

app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    urlDatabase[shortURL].longURL = req.body.editLongURL;
    res.redirect('/urls');
  }
  res.status(401).send("Not permitted");
});