//Settin up Express web server

const express = require("express");           // for building the Rest apis
const cors = require("cors");                 // provides Express middleware to enable CORS
const cookieSession = require("cookie-session");  // helps to stores the session data on the client  within a cookie without requiring any database/resources on the server side
// imported express, cookie-session and cors modules




const app = express();            //created an Express app

const dbConfig = require('./config/db.config'); // Adjust the path based on your project structure


var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "thuto-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true
  })
);


// to open mongoose connection

const db = require("./models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

  // initial() function helps us to create 3 important rows in roles collection.
 // Updated initial() function with promises
async function initial() {
  try {
    const count = await Role.countDocuments({});
    
    if (count === 0) {
      await Promise.all([
        new Role({ name: "user" }).save(),
        new Role({ name: "moderator" }).save(),
        new Role({ name: "admin" }).save()
      ]);

      console.log("Roles initialized successfully.");
    }
  } catch (err) {
    console.error("Error initializing roles", err);
  }
}

  

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the thuto platform application." });
});


require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});