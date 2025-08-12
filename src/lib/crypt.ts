async function initializeEncryptionKey(): Promise<CryptoKey | null> {
  if (!process.env.ENCRYPTION_KEY) {
    console.error("No ENCRYPTION_KEY found in environment variables");
    return null;
  }

  try {
    const keyData = Uint8Array.from(atob(process.env.ENCRYPTION_KEY), (c) =>
      c.charCodeAt(0)
    );

    if (keyData.length !== 32) {
      console.error(
        `Invalid key length: ${keyData.length} bytes (expected 32)`
      );
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-CBC" },
      false,
      ["encrypt", "decrypt"]
    );

    return key;
  } catch (error) {
    console.error("Failed to decode ENCRYPTION_KEY:", error);
    return null;
  }
}

let ENCRYPTION_KEY: CryptoKey | null = null;

(async () => {
  ENCRYPTION_KEY = await initializeEncryptionKey();
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY must be a 32-byte Base64-encoded string");
  }
})();

const IV_LENGTH = 16;

function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function uint8ArrayToString(arr: Uint8Array): string {
  return new TextDecoder().decode(arr);
}

function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function concatUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length + b.length);
  result.set(a);
  result.set(b, a.length);
  return result;
}

export const encrypt = async (text: string): Promise<string> => {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key not initialized");
  }

  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const textData = stringToUint8Array(text);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    ENCRYPTION_KEY,
    textData
  );

  const combined = concatUint8Arrays(iv, new Uint8Array(encryptedBuffer));

  return arrayBufferToBase64(combined.buffer);
};

export const decrypt = async (encryptedText: string): Promise<string> => {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key not initialized");
  }

  const buffer = new Uint8Array(base64ToArrayBuffer(encryptedText));

  const iv = buffer.slice(0, IV_LENGTH);
  const encryptedData = buffer.slice(IV_LENGTH);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    ENCRYPTION_KEY,
    encryptedData
  );

  return uint8ArrayToString(new Uint8Array(decryptedBuffer));
};

export const encryptFile = async (buffer: Uint8Array): Promise<string> => {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key not initialized");
  }

  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    ENCRYPTION_KEY,
    buffer
  );

  const combined = concatUint8Arrays(iv, new Uint8Array(encryptedBuffer));

  return arrayBufferToBase64(combined.buffer);
};

export const decryptFile = async (
  encryptedData: string
): Promise<Uint8Array> => {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key not initialized");
  }

  const buffer = new Uint8Array(base64ToArrayBuffer(encryptedData));

  const iv = buffer.slice(0, IV_LENGTH);
  const encrypted = buffer.slice(IV_LENGTH);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    ENCRYPTION_KEY,
    encrypted
  );

  return new Uint8Array(decryptedBuffer);
};
