const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
require("dotenv").config();

let client = null;
let isClientReady = false;

const API_ID = parseInt(process.env.TELEGRAM_API_ID);
const API_HASH = process.env.TELEGRAM_API_HASH;
const ADMIN_PHONE = process.env.TELEGRAM_ADMIN_PHONE;
const SESSION_STRING = process.env.TELEGRAM_SESSION_STRING || "";

async function initializeTelegramClient() {
  if (isClientReady && client) {
    return client;
  }

  try {
    const stringSession = new StringSession(SESSION_STRING);

    client = new TelegramClient(stringSession, API_ID, API_HASH, {
      connectionRetries: 5,
    });

    console.log("Connecting to Telegram MTProto...");

    await client.start({
      phoneNumber: async () => ADMIN_PHONE,
      password: async () => await input.text("Enter your 2FA password (if enabled): "),
      phoneCode: async () => await input.text("Enter the code you received on Telegram: "),
      onError: (err) => console.error("Telegram Client Error:", err),
    });

    console.log("Telegram Client connected successfully!");
    console.log("Session String (save this to .env as TELEGRAM_SESSION_STRING):");
    console.log(client.session.save());

    isClientReady = true;
    return client;
  } catch (error) {
    console.error("Failed to initialize Telegram Client:", error);
    throw error;
  }
}

async function sendMessageViaClient(phoneNumber, message) {
  try {
    if (!isClientReady) {
      await initializeTelegramClient();
    }

    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;

    console.log(`Sending message to ${formattedPhone} via MTProto...`);

    const result = await client.sendMessage(formattedPhone, { message });

    console.log(`Message sent successfully to ${formattedPhone}`);

    return {
      success: true,
      messageId: result.id,
      date: result.date,
      phoneNumber: formattedPhone
    };
  } catch (error) {
    console.error("Error sending message via Telegram Client:", error);
    throw error;
  }
}

async function getMessagesViaClient(phoneNumber, limit = 50) {
  try {
    if (!isClientReady) {
      await initializeTelegramClient();
    }

    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;

    const messages = await client.getMessages(formattedPhone, { limit });

    return messages.map(msg => ({
      id: msg.id,
      text: msg.message,
      date: msg.date,
      fromId: msg.fromId,
      isOutgoing: msg.out,
      senderId: msg.senderId?.value || null
    }));
  } catch (error) {
    console.error("Error getting messages via Telegram Client:", error);
    throw error;
  }
}

async function resolvePhoneToUser(phoneNumber) {
  try {
    if (!isClientReady) {
      await initializeTelegramClient();
    }

    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;

    const result = await client.invoke(
      new Api.contacts.ResolvePhone({
        phone: formattedPhone
      })
    );

    return result;
  } catch (error) {
    console.error("Error resolving phone to user:", error);
    return null;
  }
}

function isClientInitialized() {
  return isClientReady && client !== null;
}

async function disconnectClient() {
  if (client) {
    await client.disconnect();
    isClientReady = false;
    client = null;
    console.log("Telegram Client disconnected.");
  }
}

module.exports = {
  initializeTelegramClient,
  sendMessageViaClient,
  getMessagesViaClient,
  resolvePhoneToUser,
  isClientInitialized,
  disconnectClient
};
