const axios = require("axios");
require("dotenv").config();

const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

async function sendWhatsAppMessage(to, message) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("WhatsApp send error:", error.response?.data || error.message);
    throw error;
  }
}

async function sendWhatsAppMedia(to, mediaType, mediaUrl, caption = "") {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: mediaType,
        [mediaType]: {
          link: mediaUrl,
          caption: caption
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("WhatsApp media send error:", error.response?.data || error.message);
    throw error;
  }
}

function parseWhatsAppWebhook(webhookData) {
  try {
    const entry = webhookData.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages) return null;

    const message = value.messages[0];
    const contact = value.contacts?.[0];

    return {
      messageId: message.id,
      from: message.from,
      senderName: contact?.profile?.name || "Unknown",
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      type: message.type,
      text: message.text?.body || "",
      mediaUrl: message.image?.id || message.video?.id || message.audio?.id || null,
      caption: message.image?.caption || message.video?.caption || ""
    };
  } catch (error) {
    console.error("WhatsApp webhook parse error:", error.message);
    return null;
  }
}

async function verifyWhatsAppWebhook(mode, token, challenge) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return challenge;
  }
  return null;
}

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppMedia,
  parseWhatsAppWebhook,
  verifyWhatsAppWebhook
};
