const express = require('express');
const mongodb = require('./data/database');
const app = express();
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const dotenv = require('dotenv').config();

const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy; 


const cors = require('cors');

const port = process.env.PORT || 3000;


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  console.log(`Route hit: ${req.method} ${req.url}`);
  next();
});

app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   next();
// });
// app.use(cors({ methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'] }));
// app.use(cors({ origin: '*' }));

process.on('uncaughtException', (err, origin) => {
  console.log(
    process.stderr.fd,
    `Caught exception: ${err}\n` + `Exception origin: ${origin}`
  );
});

//import and use routes
app.use('/', require('./routes/index.js'));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
function(accessToken, refreshToken, profile, done){
    //User.findOrCreate({githubId: profile.id}, function (err, user){
    return done(null, profile);
    //}});
}
));

passport.serializeUser((user, done)=> {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get('/', (req, res) => {
    res.send(
      req.session.user !== undefined
        ? `Logged in as ${req.session.user.displayName}`
        : 'Logged out'
    );
  });
  
  app.get('/github/callback', passport.authenticate('github', { 
    failureRedirect: '/api-docs', session: true 
}), (req, res) => {
    console.log("GitHub Authentication Successful");
    console.log("User Data from Passport:", req.user);
    
    req.session.user = req.user;  // Store user in session

    console.log("Session after setting user:", req.session);
    
    res.redirect('/');  // Redirect to home
});

mongodb.initDb((err) => {
    if (err){
        console.log(err);
    }
    else {
        app.listen(port, () => {console.log(`Database is listening and node Running on port ${port}`)});
    }
});
