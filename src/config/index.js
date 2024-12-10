const dotEnv = require("dotenv");
if (process.env.NODE_ENV !== "prod") {
  console.log("Uploading developement Env");
  const configFile = `./.env.${process.env.NODE_ENV}`;
  console.log("the configfile is " , configFile)
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI,
}; 