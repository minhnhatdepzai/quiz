const express = require("express");
const Result = require("../models/Result");
const User = require("../models/User");

const router = express.Router();

// Top 10 người chơi có điểm cao nhất
router.get("/", async (req, res) => {
  try {
    const top = await Result.aggregate([
      {
        $group: {
          _id: "$user",
          bestScore: { $max: "$score" },
          totalPlays: { $sum: 1 }
        }
      },
      { $sort: { bestScore: -1, totalPlays: -1 } },
      { $limit: 10 }
    ]);

    const userIds = top.map((t) => t._id);
    const users = await User.find({ _id: { $in: userIds } }).select("username email");
    const userMap = {};
    users.forEach((u) => (userMap[u._id.toString()] = u));

    const result = top.map((t, idx) => ({
      rank: idx + 1,
      userId: t._id,
      username: userMap[t._id.toString()]?.username || "Người chơi",
      bestScore: t.bestScore,
      totalPlays: t.totalPlays
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
