const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const imaps = require("imap-simple");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// App setup
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/mailserver", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Access Denied");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid Token");
    req.user = user;
    next();
  });
};

// Routes

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to the Custom Mail Server");
});

// Register Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send("Error registering user: " + error.message);
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(403).send("Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).send({ token });
  } catch (error) {
    res.status(500).send("Error logging in: " + error.message);
  }
});

// Send Email Route
app.post("/send", authenticateToken, async (req, res) => {
  const { from, to, subject, text, html } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.example.com", // Replace with your SMTP host
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({ from, to, subject, text, html });
    res.status(200).send({ message: "Email sent", info });
  } catch (error) {
    res.status(500).send("Error sending email: " + error.message);
  }
});

// Fetch Emails Route
app.get("/emails", authenticateToken, async (req, res) => {
  try {
    const config = {
      imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASS,
        host: "imap.example.com", // Replace with your IMAP host
        port: 993,
        tls: true,
      },
    };

    const connection = await imaps.connect(config);
    await connection.openBox("INBOX");

    const searchCriteria = ["UNSEEN"];
    const fetchOptions = { bodies: ["HEADER", "TEXT"], markSeen: false };

    const messages = await connection.search(searchCriteria, fetchOptions);
    connection.end();

    res.status(200).send({ messages });
  } catch (error) {
    res.status(500).send("Error fetching emails: " + error.message);
  }
});

// Start the Server
const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server: ", error);
  }
};

start();
