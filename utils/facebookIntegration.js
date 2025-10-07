const axios = require("axios");
require("dotenv").config();

const FACEBOOK_API_URL = "https://graph.facebook.com/v18.0";

async function sendFacebookMessage(recipientId, message) {
  try {
    const response = await axios.post(
      `${FACEBOOK_API_URL}/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text: message }
      },
      {
        params: { access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Facebook send error:", error.response?.data || error.message);
    throw error;
  }
}

async function sendFacebookAttachment(recipientId, attachmentType, attachmentUrl) {
  try {
    const response = await axios.post(
      `${FACEBOOK_API_URL}/me/messages`,
      {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: attachmentType,
            payload: { url: attachmentUrl }
          }
        }
      },
      {
        params: { access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Facebook attachment send error:", error.response?.data || error.message);
    throw error;
  }
}

function parseFacebookWebhook(webhookData) {
  try {
    const entry = webhookData.entry?.[0];
    const messaging = entry?.messaging?.[0];

    if (!messaging || !messaging.message) return null;

    const message = messaging.message;

    return {
      messageId: message.mid,
      senderId: messaging.sender.id,
      recipientId: messaging.recipient.id,
      timestamp: new Date(messaging.timestamp),
      type: message.attachments ? message.attachments[0].type : "text",
      text: message.text || "",
      attachments: message.attachments || [],
      mediaUrl: message.attachments?.[0]?.payload?.url || null
    };
  } catch (error) {
    console.error("Facebook webhook parse error:", error.message);
    return null;
  }
}

async function verifyFacebookWebhook(mode, token, challenge) {
  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return challenge;
  }
  return null;
}

async function getFacebookUserProfile(userId) {
  try {
    const response = await axios.get(`${FACEBOOK_API_URL}/${userId}`, {
      params: {
        fields: "first_name,last_name,profile_pic",
        access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
      }
    });
    return response.data;
  } catch (error) {
    console.error("Facebook user profile error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendFacebookMessage,
  sendFacebookAttachment,
  parseFacebookWebhook,
  verifyFacebookWebhook,
  getFacebookUserProfile
};
