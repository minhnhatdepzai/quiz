const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true }
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    questions: [questionSchema],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // mới thêm: số lần quiz này được làm
    timesPlayed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
