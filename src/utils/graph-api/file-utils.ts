import { UploadFile } from "@/types/upload-doc";

export async function uploadFilesToOneDrive(
  files: UploadFile[],
  folderId: string,
  accessToken: string
) {
  const responses = [];

  for (const file of files) {
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}:/${encodeURIComponent(
      file.originalname
    )}:/content`;

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": file.mimetype || "application/octet-stream",
      },
      body: file.buffer,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Upload failed for "${file.originalname}": ${error}`);
    }

    const data = await res.json();
    responses.push(data);
  }

  return responses;
}

interface BatchDeleteResult {
  successfulIds: string[];
  failedDeletions: { id: string; message: string }[];
}

export async function deleteFilesFromOneDrive(
  fileIds: string[],
  accessToken: string
): Promise<BatchDeleteResult> {
  const BATCH_REQUEST_LIMIT = 20;
  const batchUrl = "https://graph.microsoft.com/v1.0/$batch";

  const successfulIds: string[] = [];
  const failedDeletions: { id: string; message: string }[] = [];

  for (let i = 0; i < fileIds.length; i += BATCH_REQUEST_LIMIT) {
    const fileIdChunk = fileIds.slice(i, i + BATCH_REQUEST_LIMIT);

    const requests = fileIdChunk.map((id, index) => ({
      id: `${index + 1}`,
      method: "DELETE",
      url: `/me/drive/items/${id}`,
    }));

    const batchRequestBody = { requests };

    const res = await fetch(batchUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batchRequestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      for (const id of fileIdChunk) {
        failedDeletions.push({
          id,
          message: `Batch request failed with status ${res.status}: ${errorText}`,
        });
      }
      continue;
    }

    const batchResponse = await res.json();

    for (const response of batchResponse.responses) {
      const originalRequest = requests.find((req) => req.id === response.id);
      const fileId = originalRequest?.url.split("/").pop();

      if (!fileId) continue;

      if (response.status === 204) {
        successfulIds.push(fileId);
      } else {
        failedDeletions.push({
          id: fileId,
          message:
            response.body?.error?.message ||
            `Received status ${response.status}`,
        });
      }
    }
  }

  return { successfulIds, failedDeletions };
}
