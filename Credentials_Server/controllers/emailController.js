const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Email configuration
const EMAIL_CONFIG = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "inferadoc@gmail.com",
    pass: process.env.EMAIL_PASS || "olfk lrgz qpzr wblt",
  },
};

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Send channel invitation
async function sendChannelInvite(req, res) {
  try {
    const { channelId, recipientEmail, personalMessage } = req.body;
    const inviterUserId = req.user.id;

    console.log("Received invite request:", {
      channelId,
      recipientEmail,
      inviterUserId,
    });

    // Validate inputs
    if (!channelId || channelId === "currentChannel") {
      return res.status(400).json({ message: "Invalid channel ID provided" });
    }

    // Handle test/general invitations
    if (channelId === "test-channel") {
      // Send general KMRL system invitation with redirect
      const networkIP = "https://credential-5ht0.onrender.com";
      const publicDomain = "https://infera-official.vercel.app";
      const generalInviteLink = `${publicDomain}/signUp.html`;

      const mailOptions = {
        from: `"KMRL Communication System" <${EMAIL_CONFIG.auth.user}>`,
        to: recipientEmail,
        subject: `🚄 KMRL System Invitation | Team Infera`,
        html: `<h2>Welcome to KMRL Communication System</h2>
               <p>You've been invited to join the KMRL Communication System.</p>
               <a href="${generalInviteLink}" style="background: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">Join KMRL System</a>`,
      };

      await transporter.sendMail(mailOptions);
      return res.json({
        success: true,
        message: "General invitation sent successfully",
      });
    }

    if (!recipientEmail) {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    // Get channel and inviter info
    const Channel = require("../models/channelModel");
    const User = require("../models/userModel");

    const channel = await Channel.findById(channelId);
    const inviter = await User.findById(inviterUserId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!inviter) {
      return res.status(404).json({ message: "Inviter not found" });
    }

    // Check if inviter is channel member
    if (!channel.members.includes(inviterUserId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this channel" });
    }

    // Generate invitation token
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store invitation in database
    const Invitation = require("../models/invitationModel");
    const invitation = new Invitation({
      channelId,
      inviterUserId,
      recipientEmail,
      inviteToken,
      expiresAt: inviteExpiry,
      personalMessage: personalMessage || "",
    });

    await invitation.save();

    // Create invitation and homepage links with redirect solution
    const networkIP = "https://credential-5ht0.onrender.com";
    const publicDomain = "https://infera-official.vercel.app";
    const inviteLink = `${publicDomain}/join?token=${inviteToken}&ip=${networkIP}`;
    const homepageLink = `${publicDomain}/index.html`;

    // Professional Email Template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KMRL Channel Invitation</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
          .email-container { max-width: 650px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%); color: white; padding: 40px 30px; text-align: center; position: relative; }
          .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="30" r="1.5" fill="white" opacity="0.1"/><circle cx="40" cy="70" r="1" fill="white" opacity="0.1"/></svg>') repeat; }
          .header-content { position: relative; z-index: 1; }
          .logo { font-size: 2.5em; margin-bottom: 10px; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .header p { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 24px; color: #1976d2; margin-bottom: 20px; font-weight: 600; }
          .invitation-box { background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%); border: 2px solid #1976d2; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
          .channel-name { font-size: 22px; color: #1565c0; font-weight: 700; margin-bottom: 10px; }
          .personal-message { background: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; margin: 25px 0; border-radius: 8px; }
          .personal-message h4 { color: #e65100; margin-bottom: 10px; }
          .invite-button { display: inline-block; background: linear-gradient(135deg, #1976d2, #1565c0); color: white !important; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; margin: 30px 0; box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3); transition: all 0.3s ease; }
          .invite-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4); }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .detail-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1976d2; }
          .detail-label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
          .detail-value { font-size: 16px; color: #333; font-weight: 600; }
          .features { background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 30px 0; }
          .features h3 { color: #1976d2; margin-bottom: 15px; }
          .features ul { list-style: none; }
          .features li { padding: 8px 0; padding-left: 25px; position: relative; }
          .features li::before { content: '✓'; position: absolute; left: 0; color: #4caf50; font-weight: bold; }
          .footer { background: #263238; color: #b0bec5; padding: 30px; text-align: center; }
          .footer-logo { font-size: 20px; margin-bottom: 15px; }
          .footer p { margin: 5px 0; font-size: 14px; }
          .security-note { background: #fff8e1; border: 1px solid #ffcc02; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .security-note strong { color: #f57c00; }
          @media (max-width: 600px) {
            .email-container { margin: 10px; }
            .header, .content, .footer { padding: 20px; }
            .details-grid { grid-template-columns: 1fr; }
            .greeting { font-size: 20px; }
            .channel-name { font-size: 18px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="header-content">
              <div class="logo">🚄</div>
              <h1>KMRL Communication System</h1>
              <p>Kochi Metro Rail Limited - Official Invitation</p>
            </div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello! 👋</div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">You have received an exclusive invitation to join a secure communication channel in the KMRL system.</p>
            
            <div class="invitation-box">
              <div class="channel-name">"${channel.name}"</div>
              <p style="margin: 0; color: #1976d2; font-weight: 500;">Invited by <strong>${
                inviter.fullName
              }</strong></p>
            </div>
            
            ${
              personalMessage
                ? `
              <div class="personal-message">
                <h4>📝 Personal Message from ${inviter.fullName}:</h4>
                <p style="margin: 0; font-style: italic; color: #333;">"${personalMessage}"</p>
              </div>
            `
                : ""
            }
            
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Channel Name</div>
                <div class="detail-value">${channel.name}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Invited By</div>
                <div class="detail-value">${inviter.fullName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Department</div>
                <div class="detail-value">${inviter.department || "KMRL"}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Role</div>
                <div class="detail-value">${inviter.role || "Team Member"}</div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${inviteLink}" class="invite-button">🚀 Join Channel Now</a>
              <br><br>
              <a href="${homepageLink}" style="display: inline-block; background: #f8f9fa; color: #1976d2; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: 600; border: 2px solid #1976d2; margin: 10px;">🏠 Visit KMRL System</a>
            </div>
            
            <div class="security-note">
              <strong>🔒 Security Notice:</strong> This invitation is valid for 7 days and can only be used once. If you don't have a KMRL account, you'll be guided through a secure registration process.
            </div>
            
            <div class="features">
              <h3>🌟 What you'll get access to:</h3>
              <ul>
                <li>Real-time secure messaging with team members</li>
                <li>File sharing and document collaboration</li>
                <li>Job card management and task tracking</li>
                <li>Advanced OCR document processing</li>
                <li>Department-wise organized communication</li>
                <li>Mobile and desktop access</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">If you have any questions about this invitation, please contact ${
              inviter.fullName
            } at ${inviter.email}</p>
          </div>
          
          <div class="footer">
            <div class="footer-logo">🚄 KMRL</div>
            <p><strong>Kochi Metro Rail Limited</strong></p>
            <p>Official Communication System</p>
            <div style="margin: 20px 0; padding: 15px; background: rgba(25, 118, 210, 0.1); border-radius: 8px;">
              <p style="margin: 0; font-weight: 600; color: #1976d2;">💻 Powered by Team Infera</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Advanced Document Intelligence & Communication Solutions</p>
            </div>
            <div style="margin: 20px 0;">
              <a href="${publicDomain}/index.html" style="display: inline-block; background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-size: 14px; margin: 5px;">🏠 KMRL Home</a>
              <a href="${publicDomain}/signUp.html" style="display: inline-block; background: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-size: 14px; margin: 5px;">📝 SignUp</a>
            </div>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">This is an automated message from the KMRL Communication System. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email with professional formatting
    const mailOptions = {
      from: `"KMRL Communication System" <${EMAIL_CONFIG.auth.user}>`,
      to: recipientEmail,
      subject: `🚄 KMRL Channel Invitation Link - Join "${channel.name}" | Team Infera`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Invitation sent successfully",
      inviteToken,
      expiresAt: inviteExpiry,
    });
  } catch (error) {
    console.error("Send invite error:", error);
    res.status(500).json({
      message: "Failed to send invitation",
      error: error.message,
    });
  }
}

// Handle invitation acceptance
async function acceptInvitation(req, res) {
  try {
    const { token } = req.params;

    const Invitation = require("../models/invitationModel");
    const Channel = require("../models/channelModel");
    const User = require("../models/userModel");

    // Find invitation
    const invitation = await Invitation.findOne({
      inviteToken: token,
      expiresAt: { $gt: new Date() },
      used: false,
    });

    if (!invitation) {
      return res.status(404).json({ message: "Invalid or expired invitation" });
    }

    // Check if user exists
    let user = await User.findOne({ email: invitation.recipientEmail });

    if (!user) {
      // Redirect to signup with pre-filled email
      return res.redirect(
        `/signup.html?email=${encodeURIComponent(
          invitation.recipientEmail
        )}&invite=${token}`
      );
    }

    // Add user to channel
    const channel = await Channel.findById(invitation.channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.members.includes(user._id)) {
      channel.members.push(user._id);
      await channel.save();
    }

    // Mark invitation as used
    invitation.used = true;
    invitation.usedAt = new Date();
    await invitation.save();

    // Redirect to messaging with channel selected
    res.redirect(`/messaging.html?channel=${invitation.channelId}`);
  } catch (error) {
    console.error("Accept invitation error:", error);
    res.status(500).json({ message: "Failed to accept invitation" });
  }
}

module.exports = {
  sendChannelInvite,
  acceptInvitation,
};
