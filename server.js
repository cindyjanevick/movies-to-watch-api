const express = require('express');
const mongodb = require('./data/database');  // This imports the updated database.js
const app = express();
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const dotenv = require('dotenv').config();

const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;

const cors = require('cors');

// CORS configuration
app.use(cors({
  origin: '*', // Allows all origins (you can replace '*' with a specific origin, e.g., 'http://localhost:3000')
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Logging middleware
app.use((req, res, next) => {
  console.log(`Route hit: ${req.method} ${req.url}`);
  next();
});

// Handling uncaught exceptions
process.on('uncaughtException', (err, origin) => {
  console.log(process.stderr.fd, `Caught exception: ${err}\nException origin: ${origin}`);
});

// Import and use routes
app.use('/', require('./routes/index.js'));

// GitHub OAuth setup with Passport
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
},
function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Routes for login and callback
app.get('/', (req, res) => {
    res.send(
      req.session.user !== undefined
        ? `Logged in as ${req.session.user.displayName}`
        : 'Logged out'
    );
});

app.get('/github/callback', passport.authenticate('github', { failureRedirect: '/api-docs', session: true }), (req, res) => {
    console.log("GitHub Authentication Successful");
    console.log("User Data from Passport:", req.user);
    
    req.session.user = req.user;  // Store user in session

    console.log("Session after setting user:", req.session);
    
    res.redirect('/');  // Redirect to home
});

// Initialize MongoDB and start the server
if (process.env.NODE_ENV !== 'test') {
  mongodb.connect()
    .then(() => {
      app.listen(process.env.PORT || 3000, () => {
        console.log(`Server listening on port ${process.env.PORT || 3000}! Connected to MongoDB.`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1); // Exit the process if connection fails
    });
}

module.exports = app;
