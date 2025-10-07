const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendVerificationEmail(email, token, username) {
  const verificationLink = `http://localhost:5000/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"UMP Verification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - UMP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to UMP, ${username}!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationLink}"
           style="display: inline-block; padding: 12px 24px; background-color: #4CAF50;
                  color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationLink}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
      </div>
    `
  });
}

async function sendOTP(email, otp) {
  await transporter.sendMail({
    from: `"UMP OTP" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code - UMP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your OTP Code</h2>
        <p>Use this code to verify your identity:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center;
                    font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 12px;">
          This code will expire in 10 minutes. Do not share this code with anyone.
        </p>
      </div>
    `
  });
}

async function sendPasswordResetEmail(email, resetLink) {
  await transporter.sendMail({
    from: `"UMP Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request - UMP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetLink}"
           style="display: inline-block; padding: 12px 24px; background-color: #2196F3;
                  color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetLink}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `
  });
}

module.exports = { sendVerificationEmail, sendOTP, sendPasswordResetEmail };
