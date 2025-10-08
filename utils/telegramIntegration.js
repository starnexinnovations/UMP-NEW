const axios = require("axios");
require("dotenv").config();

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendTelegramMessage(chatId, text) {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML"
    });
    return response.data;
  } catch (error) {
    console.error("Telegram send error:", error.response?.data || error.message);
    throw error;
  }
}

async function sendTelegramPhoto(chatId, photoUrl, caption = "") {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendPhoto`, {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption
    });
    return response.data;
  } catch (error) {
    console.error("Telegram photo send error:", error.response?.data || error.message);
    throw error;
  }
}

async function sendTelegramVideo(chatId, videoUrl, caption = "") {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendVideo`, {
      chat_id: chatId,
      video: videoUrl,
      caption: caption
    });
    return response.data;
  } catch (error) {
    console.error("Telegram video send error:", error.response?.data || error.message);
    throw error;
  }
}

async function setTelegramWebhook(webhookUrl) {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/setWebhook`, {
      url: webhookUrl
    });
    return response.data;
  } catch (error) {
    console.error("Telegram webhook setup error:", error.response?.data || error.message);
    throw error;
  }
}

function parseTelegramWebhook(webhookData) {
  try {
    const message = webhookData.message;

    if (!message) return null;

    return {
      messageId: message.message_id,
      chatId: message.chat.id,
      from: message.from.id,
      senderName: message.from.first_name + (message.from.last_name ? ` ${message.from.last_name}` : ""),
      username: message.from.username || "",
      timestamp: new Date(message.date * 1000),
      type: message.photo ? "image" : message.video ? "video" : message.audio ? "audio" : "text",
      text: message.text || message.caption || "",
      mediaUrl: message.photo?.[message.photo.length - 1]?.file_id ||
                message.video?.file_id ||
                message.audio?.file_id ||
                null
    };
  } catch (error) {
    console.error("Telegram webhook parse error:", error.message);
    return null;
  }
}

async function getTelegramFile(fileId) {
  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getFile`, {
      params: { file_id: fileId }
    });
    const filePath = response.data.result.file_path;
    return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
  } catch (error) {
    console.error("Telegram get file error:", error.response?.data || error.message);
    throw error;
  }
}

async function getTelegramMessages(offset = 0) {
  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getUpdates`, {
      params: {
        offset: offset,
        timeout: 0
      }
    });

    const updates = response.data.result || [];
    const messages = [];

    for (const update of updates) {
      if (update.message) {
        const message = update.message;
        messages.push({
          messageId: message.message_id,
          chatId: message.chat.id,
          from: message.from.id,
          senderName: message.from.first_name + (message.from.last_name ? ` ${message.from.last_name}` : ""),
          username: message.from.username || "",
          timestamp: new Date(message.date * 1000),
          type: message.photo ? "image" : message.video ? "video" : message.audio ? "audio" : "text",
          text: message.text || message.caption || "",
          mediaUrl: message.photo?.[message.photo.length - 1]?.file_id ||
                    message.video?.file_id ||
                    message.audio?.file_id ||
                    null,
          updateId: update.update_id
        });
      }
    }

    return {
      messages,
      lastUpdateId: updates.length > 0 ? updates[updates.length - 1].update_id : offset
    };
  } catch (error) {
    console.error("Telegram get messages error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendTelegramMessage,
  sendTelegramPhoto,
  sendTelegramVideo,
  setTelegramWebhook,
  parseTelegramWebhook,
  getTelegramFile,
  getTelegramMessages
};
