const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bookRoutes = require("./src/routes/bookRoutes");
const userRoutes = require("./src/routes/userRoutes");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Configure middleware
app.use(express.json());
app.use(cors());

// Define a basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Library Management System API" });
});

// Use routes
app.use("/api", bookRoutes);
app.use("/api/users", userRoutes);

// Set port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
