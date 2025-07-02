const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs"); // Use only bcryptjs
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

// SIGN UP (Normal)
router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, city } = req.body;

    if (username.length < 4) {
      return res.status(400).json({ message: "Username should be at least 4 characters" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length <= 5) {
      return res.status(400).json({ message: "Password should contain more characters" });
    }

    const hashpass = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashpass,
      city,
      avatar: "https://example.com/default-avatar.png", // Optional default avatar
    });

    await newUser.save();
    return res.status(200).json({ message: "Signed Up Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GOOGLE SIGN UP
router.post("/google-signup", async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (name.length < 4) {
      return res.status(400).json({ message: "Username should be at least 4 characters" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const randomPass = Math.random().toString(36); // Not used but hashed for model
    const hashpass = await bcrypt.hash(randomPass, 10);

    const newUser = new User({
      username: name,
      email,
      password: hashpass,
      avatar: picture || "https://example.com/default-avatar.png",
    });

    await newUser.save();
    return res.status(200).json({ message: "Signed Up Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// SIGN IN (Normal)
router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (!existingUser) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const authClaims = [
      { name: existingUser.username },
      { role: existingUser.role },
    ];

    const token = jwt.sign({ authClaims }, process.env.JWT_SECRET || "lms123", {
      expiresIn: "2d",
    });

    return res.status(200).json({
      id: existingUser._id,
      role: existingUser.role,
      token,
      icon: existingUser.avatar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GOOGLE LOGIN
router.post("/google-login", async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(400).json({ message: "Invalid credentials" });

    const authClaims = [
      { name: existingUser.username },
      { role: existingUser.role },
    ];

    const token = jwt.sign({ authClaims }, process.env.JWT_SECRET || "lms123", {
      expiresIn: "2d",
    });

    return res.status(200).json({
      id: existingUser._id,
      role: existingUser.role,
      token,
      icon: existingUser.avatar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET USER INFO
router.get("/get-userinfo", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const data = await User.findById(id).select("-password");
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE CITY
router.put("/update-city", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { city } = req.body;
    await User.findByIdAndUpdate(id, { city }, { new: true });
    return res.status(200).json({ message: "Your profile is updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE USERNAME
router.put("/update-username", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { username } = req.body;
    await User.findByIdAndUpdate(id, { username }, { new: true });
    return res.status(200).json({ message: "Your profile is updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
