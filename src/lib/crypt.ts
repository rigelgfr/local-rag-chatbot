import crypto from "crypto";

function initializeEncryptionKey() {
  if (!process.env.ENCRYPTION_KEY) {
    console.error("No ENCRYPTION_KEY found in environment variables");
    return null;
  }

  try {
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
    if (key.length !== 32) {
      console.error(`Invalid key length: ${key.length} bytes (expected 32)`);
      return null;
    }
    return key;
  } catch (error) {
    console.error("Failed to decode ENCRYPTION_KEY:", error);
    return null;
  }
}

const ENCRYPTION_KEY = initializeEncryptionKey();

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte Base64-encoded string");
}

const IV_LENGTH = 16; // CBC uses 16 bytes IV

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, encrypted]).toString("base64");
};

export const decrypt = (encryptedText: string): string => {
  const buffer = Buffer.from(encryptedText, "base64");
  const iv = buffer.subarray(0, IV_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH);
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};

export const encryptFile = (buffer: Buffer): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]).toString("base64");
};

export const decryptFile = (encryptedData: string): Buffer => {
  const buffer = Buffer.from(encryptedData, "base64");
  const iv = buffer.subarray(0, IV_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH);
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};
