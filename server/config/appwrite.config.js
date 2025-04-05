//// filepath: /Users/kamna/Desktop/socket.io - tutorial/server/config/appwrite.config.js
import { Client, Databases } from "node-appwrite";

const client = new Client();

// Configure with your Appwrite project credentials.
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject("65b89cfb3e156e1b0632")
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

export default databases;