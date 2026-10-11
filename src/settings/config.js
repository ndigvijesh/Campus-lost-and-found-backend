const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const authRouter = require("../auth/auth.router.js");
const usersRouter = require("../users/users.router.js");
const itemRouter = require("../items/items.router.js");
const adminRouter = require("../admin/admin.router.js");
const matchRouter = require("../matches/matches.router.js");
const claimRouter = require("../claims/claims.router.js");
const responseFormatter = require("../middleware/responseFormatter.middleware.js");
const { StatusCodes } = require("http-status-codes");
const expressWinstonLogger = require("../middleware/expressWinston.middleware.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger.config.js");

function configureApp(app) {

// Use CORS
// Enabled for all origins
//app.use(cors());
// Only requests from example.com
// app.use(cors(corsOptions));

// Using Morgan for logging
/**
 * File System Module (fs): Used to create a writable stream for the file where logs will be saved.
 * Path Module (path): Helps with handling file paths.
 * Create Write Stream: fs.createWriteStream() is used to create a stream that Morgan will write log data to. The 'a' flag ensures that logs are appended to the file (access.log) instead of overwriting it.
 */



// Determine extra origins from FRONTEND_URL environment variable
const customFrontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((u) => u.trim().replace(/\/$/, ''))
  : [];

// CORS Configuration with Multiple Origins and Regex Support
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  /\.app\.github\.dev$/,    // GitHub Codespaces
  /\.devtunnels\.ms$/,      // VS Code Dev Tunnels
  /\.vercel\.app$/,         // Vercel Deployments
  /\.netlify\.app$/,        // Netlify Deployments
  /\.onrender\.com$/,       // Render Deployments
  ...customFrontendUrls,
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      // Allow all in non-strict development or log warning without throwing unhandled rejection
      console.warn(`[CORS] Origin not in allowed list: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
}));



var accessLogStream = fs.createWriteStream(
  //! The 'path.join' method joins all given path segments together using the platform-specific separator
  // '__dirname' is a Node.js variable that gives the directory name of the current module
  // '..' moves up one directory level from the current directory
  // 'access.log' is the file name we want to access or create in the parent directory
  // ! File is igniored in gitignore by default and need not be sent to git
  path.join(__dirname, "..", "access.log"),
  {
    flags: "a",
  }
);
app.use(morgan("combined", { stream: accessLogStream }));

// Format Response
app.use(responseFormatter);

//  Winston Express Logger Middleware
app.use(expressWinstonLogger);

// Health Check Endpoint (useful for Render, Railway, AWS, Docker health probes)
app.get("/health", (req, res) => {
  res.status(StatusCodes.OK).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Serve static uploads
const uploadsDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Fallback to client uploads directory if present in monorepo
const clientUploadsDir = path.resolve(__dirname, "../../../client/public/uploads");
if (fs.existsSync(clientUploadsDir)) {
  app.use("/uploads", express.static(clientUploadsDir));
}

//  Defining Routes
app.use("/", authRouter);
app.use("/users", usersRouter);
app.use("/", itemRouter);
app.use("/", adminRouter);
app.use("/", matchRouter);
app.use("/", claimRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
console.log(swaggerSpecs);

// send back a 404 error for any unknown api request
// Sequence is important
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json(null);
});

}

module.exports = configureApp;