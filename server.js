// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");          // <-- THÊM DÒNG NÀY
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const rankingRoutes = require("./routes/rankingRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// LOG TẤT CẢ REQUEST RA CONSOLE -> Render Logs sẽ thấy
app.use(morgan("combined"));              // <-- THÊM DÒNG NÀY

// routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/rankings", rankingRoutes);

// test
app.get("/", (req, res) => {
  console.log("Hit GET / at", new Date().toISOString());  // <-- log test
  res.json({ message: "Quizz API is running" });
});

// connect DB & start server
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
