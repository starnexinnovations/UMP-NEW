const axios = require("axios");
require("dotenv").config();

const INSTAGRAM_API_URL = "https://graph.facebook.com/v18.0";

async function sendInstagramMessage(recipientId, message) {
  try {
    const response = await axios.post(
      `${INSTAGRAM_API_URL}/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text: message }
      },
      {
        params: { access_token: process.env.INSTAGRAM_ACCESS_TOKEN }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Instagram send error:", error.response?.data || error.message);
    throw error;
  }
}

async function sendInstagramMedia(recipientId, mediaType, mediaUrl) {
  try {
    const response = await axios.post(
      `${INSTAGRAM_API_URL}/me/messages`,
      {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: mediaType,
            payload: { url: mediaUrl }
          }
        }
      },
      {
        params: { access_token: process.env.INSTAGRAM_ACCESS_TOKEN }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Instagram media send error:", error.response?.data || error.message);
    throw error;
  }
}

function parseInstagramWebhook(webhookData) {
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
    console.error("Instagram webhook parse error:", error.message);
    return null;
  }
}

async function verifyInstagramWebhook(mode, token, challenge) {
  const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return challenge;
  }
  return null;
}

async function getInstagramUserProfile(userId) {
  try {
    const response = await axios.get(`${INSTAGRAM_API_URL}/${userId}`, {
      params: {
        fields: "name,username,profile_pic",
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN
      }
    });
    return response.data;
  } catch (error) {
    console.error("Instagram user profile error:", error.response?.data || error.message);
    throw error;
  }
}

async function getInstagramMessages() {
  try {
    const response = await axios.get(`${INSTAGRAM_API_URL}/me/conversations`, {
      params: {
        fields: "messages{id,from,to,message,created_time}",
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
        platform: "instagram"
      }
    });

    const messages = [];
    if (response.data && response.data.data) {
      for (const conversation of response.data.data) {
        if (conversation.messages && conversation.messages.data) {
          for (const msg of conversation.messages.data) {
            messages.push({
              messageId: msg.id,
              senderId: msg.from.id,
              timestamp: new Date(msg.created_time),
              text: msg.message || "",
              type: "text"
            });
          }
        }
      }
    }

    return messages;
  } catch (error) {
    console.error("Instagram get messages error:", error.response?.data || error.message);
    return [];
  }
}

module.exports = {
  sendInstagramMessage,
  sendInstagramMedia,
  parseInstagramWebhook,
  verifyInstagramWebhook,
  getInstagramUserProfile,
  getInstagramMessages
};
