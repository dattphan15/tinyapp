const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
const { red } = require("chalk");
app.use(cookieParser());


// GENERATE RANDOM SHORT URL
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

// URL DATABASE (TEMP)
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
function matchingID(email, pass) {
  for (let key in users) {
    if ((users[key].password === pass) && (users[key].email === email)) {
      return users[key].id;
    }
  }
}


// LOGIN & LOGOUT
app.post("/login", (req, res) => {
   let email = req.body.email;
   let pass = req.body.password;
 
   //1. if email doesn't exist
   if (!checkEmailExists(email)) {
     res.sendStatus(403);
     //2. If email exists, but password doesnt match
   } else if (checkEmailExists(email)) {
      if (!matchingPassword(pass)) {
      console.log("Password does not match for existing user!");
      res.sendStatus(403);
      }
      // if email exists, and password matches
      if (matchingPassword(pass)) {
       console.log("Success! Email exists, password matches.");
       res.cookie("user_id", matchingID(email, pass));
       res.redirect("/urls"); 
      }
    };

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});


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
  const templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.body["username"] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { username: req.body["username"] };
  res.render("urls_login", templateVars);
});

// DELETE LINK BUTTON
app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// POSTS
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/update", (req, res) => {
  const { shortURL } = req.params;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`); //
});



app.post("/register", (req, res) => {
  //1. We need to check whether the email or password is not blank
  let email = req.body.email;
  let pass = req.body.password;
  if(email==="" || pass === ""){
    res.send("Please enter email and password. They cannot be blank");
  }

  //2. We need to make sure the email has not already been taken
  if(checkEmailExists(email)){
    res.send("Email has already been taken. Please try with another one!");
  } else{
    //need to create a new user
    let id = generateRandomString();

    let newUser = {
      id: id,
      email: email, 
      password: pass
    }
    //assign the new user to the users database
    users[id] = newUser;

    //write a cookie 
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

