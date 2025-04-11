const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from test.env
dotenv.config({ path: path.resolve(__dirname, "../test.env") });

console.log("Test environment variables loaded from test.env");

// You can add other test setup code here if needed
