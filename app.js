const express = require('express');
const cors = require('cors')
// require('dotenv').config();
const session = require('express-session');
const errorHandler = require('./middleware/error')
const notFound = require('./middleware/notFound');

const app = express();


// Routers
let indexRouter = require('./routes/index');

// Serve static files
app.use(express.static('public'))   // 'public' is my static folder.



// Body parser middleware
app.use(express.json());  // submit raw json

app.use(express.urlencoded({ extended: true }));  // This middleware parses this data and makes it available in req.body as a js object. express.urlencoded() is a built-in middleware function in Express that parses incoming requests with URL-encoded payloads. Used when data is submitted from HTML

app.use(cors( {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true     
}));  // enables Cross-Origin Resource Sharing for all incoming requests.




// Session set-up - // initializes sessions with a secure secret, avoids unnecessary saves, and only creates sessions when necessary
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,  // allows sessions without login,
  cookie: { secure: true }
}))


// Adding route-handling code to the request handling chain. This will define particular routes for the different parts of the site
app.use('/', indexRouter)  // mounts indexRouter at the root of application. All routes defined in indexRouter will be relative to this path.



// Catch-all for non-existent routes
app.use(notFound);

// Error handler - order in which functions declare matter - errorhandler is below  the routes
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server listening on PORT 3000')
})