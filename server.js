const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const configureApp = require("./src/settings/config.js");
const seedAdmin = require("./src/seeders/seedAdmin.js");

// Load the optional local configuration without overriding hosting-platform variables.
dotenv.config({ path: path.resolve(__dirname, ".env") });
process.env.NODE_ENV = process.env.NODE_ENV || "development";
console.log(`Current Environment: ${process.env.NODE_ENV}`);

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3001;

// Trust reverse proxy (Render, Cloudflare, etc.)
app.enable("trust proxy");

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

    await seedAdmin();

    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`App listening on port ${port}`);
    });

    // Graceful shutdown for Docker and container platforms
    const gracefulShutdown = (signal) => {
      console.log(`Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        try {
          await mongoose.connection.close(false);
          console.log("MongoDB connection closed.");
          process.exit(0);
        } catch (err) {
          console.error("Error closing MongoDB connection:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    const safeError = error.message ? error.message.replace(/:([^:@]+)@/, ':***@') : error;
    console.error("Database connection error:", safeError);
    process.exit(1);
  }
}

bootstrap();
