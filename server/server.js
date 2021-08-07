'use strict';

const express = require('express');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./userDAO'); // module for accessing the users in the DB
const surveyDao = require('./surveyDAO');

const port = 3001;

passport.use(new LocalStrategy(
  function (username, password, done) {
      userDao.getUser(username, password).then((user) => {
          if (!user)
              done(null, false, { message: 'Incorrect username/password' });
          done(null, user);
      }).catch((err) => console.error(err));
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
      .then(user => {
          done(null, user); // this will be available in req.user
      }).catch(err => {
          done(err, null);
      });
});

const app = express();
app.use(express.json());

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
      return next();
  return res.status(401).json({ error: 'not authenticated' });
};

// set up the session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

// login
app.post('/api/login', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
      if (err)
          return next(err);
      if (!user) {
          // display wrong login messages
          return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
          if (err)
              return next(err);

          // req.user contains the authenticated user, we send all the user info back
          // this is coming from userDao.getUser()
          return res.json(req.user);
      });
  })(req, res, next);
});

app.delete('/api/logout/current', (req, res) => {
  req.logout();
  res.end();
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/login/current', (req, res) => {
  if (req.isAuthenticated()) {
      res.status(200).json(req.user);
  }
  else
      res.status(401)/*.json({ error: 'Unauthenticated user!' })*/;
});

app.get('/api/getSurveys', async (req, res) => {
  const list = await surveyDao.getSurveysWithQuestions();
  if(list === false)
    res.status(500).json({err: "error"});
  else
    res.status(200).json(list);
});

app.get('/api/getUserSurvey', isLoggedIn, async (req, res) => {
  const list = await surveyDao.getSurveysWithQuestionsAuth(req.user.id);
  if(list === false)
    res.status(500);
  else
    res.status(200).json(list);
});

app.post('/api/createSurvey', isLoggedIn, async (req, res) => {
  try {
    await surveyDao.insertSurveyAndQuestions(req.body.survey, req.user.id, req.body.questions, req.user.name);
    res.status(201).end();
  } catch (err) {
    res.status(503).json({error: "error in the communication with the db"});
  }
});

app.post('/api/createResponse', (req, res) => {
  let responses = req.body.response;
  surveyDao.insertResponse(responses).then(() => res.status(200).end()).catch((err) => res.status(503).json({error: "error in the communication with the db"}));
});

app.get('/api/getResponses', isLoggedIn, (req, res) => {
  surveyDao.getResponses(req.user.id).then((rows) => res.status(200).json(rows)).catch((err) => res.status(503).json({error: "error in the communication with the db"}));
});

app.get('/api/getNextSurveyId', isLoggedIn, (req, res) => {
  let max = 0;
  surveyDao.getSurveyId().then((rows) => {
    let id;
    if(rows.length === 0)
      id = 1;
    else {
      rows.map((v) => parseInt(v.id)).forEach(element => {
        if(element > max)
          max = element;
      });
      id = max + 1;
    }
    res.status(200).json({id: id});
  }).catch((err) => res.status(503).json({error: "error in the communication with the db"}));
})

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});