// server.js
require("dotenv").config(); // ✅ Load environment variables first

const app = require("./src/app");
const connectToDB = require("./src/db/db");

app.listen(3000, () => {
  console.log("Server started on port 3000");
  connectToDB();
});
