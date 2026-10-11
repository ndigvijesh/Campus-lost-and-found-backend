swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Smart Campus Lost & Found System System",
      version: "0.1.0",
      //! SEE that adding description and contact has a direct impact on documentation website
      description:
        "API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "CB",
        url: "https://imcb.in",
        email: "chandandeep95012@gmail.com",
      },
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || "/",
        description: "Current environment server",
      },
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: "Local development server",
      },
    ],
  },
  apis: [path.join(__dirname, "..", "**/*.js")],
};

const specs = swaggerJsdoc(options);
module.exports = specs;