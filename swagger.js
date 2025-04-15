const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Movies to Watch Api",
    description: "Movies to Watch Api",
  },
  host: "final-project-solo.onrender.com",
  schemes: ["https"],
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);