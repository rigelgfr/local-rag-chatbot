import { decrypt } from "@/lib/crypt";

interface FolderInfo {
  id: string;
  name: string;
  parentPath: string;
  fullPath: string;
}

export async function collectAllSubFolders(
  folderId: string,
  parentPath: string,
  decryptedToken: string
): Promise<FolderInfo[]> {
  const url = `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children?$select=id,name,folder,parentReference`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${decryptedToken}`,
    },
  });

  if (!res.ok) {
    console.error(
      `Graph API error fetching children of ${folderId}: ${
        res.status
      } - ${await res.text()}`
    );
    return [];
  }

  const data = await res.json();
  let folders: FolderInfo[] = [];

  for (const item of data.value) {
    if (item.folder) {
      const currentPath = `${parentPath}/${item.name}`;
      folders.push({
        id: item.id,
        name: item.name,
        parentPath: parentPath,
        fullPath: currentPath,
      });
      const subfolders = await collectAllSubFolders(
        item.id,
        currentPath,
        decryptedToken
      );
      folders.push(...subfolders);
    }
  }
  return folders;
}

export async function fetchOneDriveFolders(
  encryptedAccessToken: string
): Promise<FolderInfo[]> {
  const decryptedToken = await decrypt(encryptedAccessToken);

  const targetFolderId =
    process.env.RAG_CHATBOT_FOLDER_ID || "folder-id-placeholder";
  const targetFolderName = process.env.RAG_CHATBOT_FOLDER_NAME || "rag-chatbot";

  if (!targetFolderId) {
    console.error("RAG_CHATBOT_FOLDER_ID environment variable is not set.");
  }

  const allFolders: FolderInfo[] = [
    {
      id: targetFolderId,
      name: targetFolderName,
      parentPath: "",
      fullPath: targetFolderName,
    },
  ];

  const subFolders = await collectAllSubFolders(
    targetFolderId,
    targetFolderName,
    decryptedToken
  );

  allFolders.push(...subFolders);
  return allFolders;
}
