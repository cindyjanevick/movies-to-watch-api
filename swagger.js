const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Movies to Watch Api",
    description: "Movies to Watch Api",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);