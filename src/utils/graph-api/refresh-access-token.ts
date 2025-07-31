/**
 * Refresh Microsoft access token using a refresh token.
 * Returns the full token response from Microsoft.
 */

import { decrypt } from "@/lib/crypt";

export interface MicrosoftTokenResponse {
  token_type: string;
  scope: string;
  expires_in: number;
  ext_expires_in?: number;
  access_token: string;
  refresh_token?: string;
  id_token?: string;
}

export async function refreshMicrosoftAccessToken(
  refreshToken: string
): Promise<MicrosoftTokenResponse> {
  const decryptedRefreshToken = await decrypt(refreshToken);
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID || "",
    client_secret: process.env.MICROSOFT_CLIENT_SECRET || "",
    refresh_token: decryptedRefreshToken,
    grant_type: "refresh_token",
    scope: "https://graph.microsoft.com/Files.ReadWrite openid profile email",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to refresh token: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}
