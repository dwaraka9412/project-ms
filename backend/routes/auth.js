const express = require("express");
const router = express.Router();
const fs = require("fs");
const nodemailer = require("nodemailer");

function readDB() {
  return JSON.parse(fs.readFileSync("database.json"));
}

function writeDB(data) {
  fs.writeFileSync("database.json", JSON.stringify(data, null, 2));
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dwarakaprakash9412@gmail.com",
    pass: "rxtj gmyi oeec tkiv"
  }
});

router.post("/login", (req, res) => {

  const db = readDB();

  const { email, password } = req.body;

  const user = db.users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  db.otp.push({ email, otp });

  writeDB(db);

  transporter.sendMail({
    from: "dwarakaprakash9412@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`
  });

  res.json({ message: "OTP sent to email" });

});

router.post("/verify", (req, res) => {

  const db = readDB();
  const { email, otp } = req.body;

  const record = db.otp.find(o => o.email === email && o.otp == otp);

  if(!record){
    return res.json({ message: "Invalid OTP" });
  }

  // Check if already exists
  const exists = db.users.find(u => u.email === email);

  if(!exists){
    db.users.push({
      email: record.email,
      password: record.password
    });
  }

  db.otp = db.otp.filter(o => o.email !== email);

  writeDB(db);

  res.json({ message: "Verified" });

});
router.post("/register", async (req, res) => {

  const db = readDB();
  const { email, password } = req.body;

  const existingUser = db.users.find(u => u.email === email);

  if(existingUser){
    return res.json({ message: "User already exists" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  db.otp.push({ email, otp, password });
  writeDB(db);

  await sendOTP(email, otp);

  res.json({ message: "OTP sent for registration" });

});
module.exports = router;