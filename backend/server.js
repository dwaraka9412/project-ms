require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");

const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const session = require("express-session");
const otpGenerator = require("otp-generator");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});
app.use(session({
  secret: "msdhoni",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, "../frontend")));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const otp = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false
  });

  req.session.otp = otp;
  req.session.user = { email, password };

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.send("Error sending OTP");
    }
    res.redirect("/otp.html");
  });
});

app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (otp === req.session.otp) {
    // Save user (for now just confirm)
    return res.send("Registration successful");
  } else {
    return res.send("Invalid OTP");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});