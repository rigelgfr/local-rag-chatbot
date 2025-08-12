"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { encryptFile } from "@/lib/crypt";

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  encryptedData?: string;
  originalSize?: number;
  folderId?: string | null;
}

interface FolderOption {
  id: string;
  name: string;
  displayName: string;
}

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (files: FileItem[]) => void;
  title?: string;
  description?: string;
  folders?: FolderOption[];
  selectedFolderId?: string;
  onFolderChange?: (folderId: string) => void;
}

const getFileIcon = (type: string) => {
  if (type.includes("pdf"))
    return <FileText className="h-5 w-5 text-red-500" />;
  if (type.includes("word") || type.includes("document"))
    return <FileText className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

export default function FileUploadDialog({
  open,
  onOpenChange,
  onUpload,
  title = "Upload Files",
  description = "Drag and drop files here or click to browse. Maximum file size is 250MB.",
  folders = [],
  selectedFolderId = "root",
  onFolderChange,
}: FileUploadDialogProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: FileItem[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        if (file.size > 250 * 1024 * 1024) {
          setError(`File "${file.name}" is too large. Maximum size is 250MB.`);
          continue;
        }

        const exists = files.some(
          (f) => f.name === file.name && f.size === formatFileSize(file.size)
        );
        if (exists) {
          setError(`File "${file.name}" already exists.`);
          continue;
        }

        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
        });
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        setError("");
      }
    },
    [files]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [handleFiles]
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        handleFiles(selectedFiles);
      }
      e.target.value = "";
    },
    [handleFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    setError("");
  }, []);

  const handleUpload = useCallback(async () => {
    if (!onUpload) return;

    const folderId = selectedFolderId === "root" ? null : selectedFolderId;

    try {
      const encryptedFiles = await Promise.all(
        files.map(async (fileItem) => {
          const arrayBuffer = await fileItem.file.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer); // Use Uint8Array instead of Buffer

          const encryptedData = await encryptFile(buffer); // Add await here

          return {
            ...fileItem,
            folderId,
            encryptedData,
            originalSize: buffer.length,
          };
        })
      );

      onUpload(encryptedFiles);

      setFiles([]);
      setError("");
      onOpenChange(false);
    } catch (error) {
      console.error("Encryption failed:", error);
      setError("Failed to encrypt files. Please try again.");
    }
  }, [files, onUpload, onOpenChange, selectedFolderId]);

  const handleCancel = useCallback(() => {
    setFiles([]);
    setError("");
    onOpenChange(false);
  }, [onOpenChange]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setFiles([]);
        setError("");
        setIsDragOver(false);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {folders.length > 0 && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Upload to 📁</label>
            <Select value={selectedFolderId} onValueChange={onFolderChange}>
              <SelectTrigger size="sm" className="bg-background min-w-30">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-4 overflow-hidden">
          {/* File Upload Area */}
          <div
            className={`relative min-h-[200px] rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer overflow-hidden ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
              accept=".pdf,.doc,.docx,.txt"
            />

            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Click to upload</span> or drag
                  and drop
                </div>
                <div className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, TXT 250MB
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center rounded-md bg-muted/50 p-2 min-w-0">
                    <div className="flex items-center space-x-2 flex-1 min-w-0 overflow-hidden">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {file.type} &bull; {file.size}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </div>
          )}
        </div>

        {files.length > 0 && (
          <DialogFooter className="flex-row justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              Upload {files.length} file(s)
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type { FileUploadDialogProps, FolderOption };
