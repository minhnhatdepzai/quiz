const express = require("express");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");

const router = express.Router();

// LOG TẤT CẢ REQUEST ĐI VÀO /api/quizzes
router.use((req, res, next) => {
  console.log(
    "[QUIZZES]",
    req.method,
    req.originalUrl,
    "- time:",
    new Date().toISOString()
  );
  next();
});

// Lấy tất cả quiz
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/quizzes - get all quizzes");
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    console.error("Error GET /api/quizzes:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// TOP 3 quiz được chơi nhiều nhất
router.get("/top", async (req, res) => {
  try {
    console.log("GET /api/quizzes/top - get top quizzes");
    const quizzes = await Quiz.find().sort({ timesPlayed: -1 }).limit(3);
    res.json(quizzes);
  } catch (err) {
    console.error("Error GET /api/quizzes/top:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Tạo quiz mới
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/quizzes - body:", JSON.stringify(req.body));
    const { title, description, questions, owner } = req.body;
    const quiz = await Quiz.create({ title, description, questions, owner });
    res.status(201).json(quiz);
  } catch (err) {
    console.error("Error POST /api/quizzes:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy chi tiết quiz
router.get("/:id", async (req, res) => {
  try {
    console.log("GET /api/quizzes/" + req.params.id);
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Không tìm thấy quiz" });
    res.json(quiz);
  } catch (err) {
    console.error("Error GET /api/quizzes/:id:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Nộp bài làm quiz, chấm điểm
router.post("/:id/submit", async (req, res) => {
  try {
    console.log("POST /api/quizzes/" + req.params.id + "/submit - body:", req.body);

    const { userId, answers } = req.body; // answers = [0,2,1,...]

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Không tìm thấy quiz" });

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: "Dữ liệu answers không hợp lệ" });
    }

    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correct++;
    });

    // tăng số lần chơi
    quiz.timesPlayed = (quiz.timesPlayed || 0) + 1;
    await quiz.save();

    let result = null;
    if (userId) {
      result = await Result.create({
        user: userId,
        quiz: quiz._id,
        score: correct,
        totalQuestions: quiz.questions.length
      });
    }

    res.json({
      score: correct,
      totalQuestions: quiz.questions.length,
      resultId: result ? result._id : null
    });
  } catch (err) {
    console.error("Error POST /api/quizzes/:id/submit:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
