const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const configureApp = require("./settings/config.js");
const seedAdmin  = require("./seeders/seedAdmin.js");

// Set the defaul environment
process.env.NODE_ENV = process.env.NODE_ENV || "development";
console.log(`Current Environment: ${process.env.NODE_ENV}`);

// configure dotenv
dotenv.config();
const envFile = `.env.${process.env.NODE_ENV}`;
console.log(`Loading environment variables from: ${envFile}`);
dotenv.config({ path: envFile });

const app = express();
const port = parseInt(process.env.PORT) || 3001;

//  Parsing request body
app.use(express.json());
configureApp(app);

const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
const dbName = process.env.DATABASE_NAME || "campus_lf";

async function bootstrap() {
  try {
    if (!mongoUri) {
      throw new Error("MongoDB connection URI is not defined in environment variables (MONGODB_URI or DATABASE_URL).");
    }

    await mongoose.connect(mongoUri, { dbName });
    console.log("Connected To MongoDB Atlas successfully");

    // Seed default admin user if not exists
    await seedAdmin();

    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });

  } catch (error) {
    // Sanitize any potential connection string secrets from logged errors
    const safeError = error.message ? error.message.replace(/:([^:@]+)@/, ':***@') : error;
    console.error("Database connection error:", safeError);
    process.exit(1);
  }
}

bootstrap();

