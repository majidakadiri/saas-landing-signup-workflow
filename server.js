const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const Lead = require("./models/lead");

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log(err));

// Landing route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Sign Up Route
app.post("/signup", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "All fields required" });
  }

  const token = uuidv4();

  const newLead = new Lead({
    name,
    email,
    verificationToken: token
  });

  await newLead.save();

  // Simulated Email Sending
  console.log("📧 Verification Email Sent To:", email);
  console.log("Verify at:", `${process.env.BASE_URL}/verify/${token}`);

  res.json({
    message: "Signup successful! Check console for verification link."
  });
});

// Verify Route
app.get("/verify/:token", async (req, res) => {
  const lead = await Lead.findOne({
    verificationToken: req.params.token
  });

  if (!lead) {
    return res.send("Invalid verification link");
  }

  lead.verified = true;
  await lead.save();

  res.redirect("/thankyou.html");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});