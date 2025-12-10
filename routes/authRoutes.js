const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exist = await User.findOne({ $or: [{ email }, { username }] });
    if (exist) {
      return res.status(400).json({ message: "Email hoặc username đã tồn tại" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });

    // tạo token đơn giản
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d"
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Reset password (demo, chỉ echo lại)
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;
  // ở đây bạn có thể làm gửi email thật, tạm thời trả về OK
  res.json({ message: `Nếu email ${email} tồn tại, link reset sẽ được gửi.` });
});

module.exports = router;
