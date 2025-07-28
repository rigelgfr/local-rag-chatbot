"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Search } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "../../ui/skeleton";
import FileUploadDialog, { FileItem, FolderOption } from "./FileUploadDialog";
import { toast } from "sonner";
import DeleteDialog from "../../custom-ui/DeleteDialog";
import { DeletionFailure } from "@/types/table";
import { Input } from "@/components/ui/input";

interface FolderInfo {
  id: string;
  name: string;
  parentPath: string;
  fullPath: string;
}

interface DocumentMetadata {
  id: string;
  title: string;
  path: string;
  last_modified_by?: string;
  last_modified_at: string;
  created_at: string;
  url?: string;
}

export default function DocumentTable() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredDocuments, setFilteredDocuments] = useState<
    DocumentMetadata[]
  >([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>("all");
  const [includeNested, setIncludeNested] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [folders, setFolders] = useState<FolderInfo[]>([]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/docs");

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {}
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        setDocuments(result.data);
        if (Array.isArray(result.folders)) {
          setFolders(result.folders);
        }
      } else {
        throw new Error(result.error || "Failed to fetch documents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Create folder options for both table and dialog
  const folderOptions: FolderOption[] = [
    { id: "root", name: "root", displayName: "/" },
    ...folders
      .filter((folder) => folder.name !== "rag-chatbot")
      .map((folder) => ({
        id: folder.id,
        name: folder.name,
        displayName: `/${folder.fullPath.replace("rag-chatbot/", "")}`,
      })),
  ];

  // Create a mapping from folder ID to path for filtering documents
  const folderIdToPath = new Map<string, string>([
    ["root", "/"],
    ...folders
      .filter((folder) => folder.name !== "rag-chatbot")
      .map(
        (folder) =>
          [folder.id, `/${folder.fullPath.replace("rag-chatbot/", "")}`] as [
            string,
            string
          ]
      ),
  ]);

  useEffect(() => {
    let filtered = documents;

    if (currentFolderId !== "all") {
      const targetPath = folderIdToPath.get(currentFolderId);
      if (targetPath) {
        if (includeNested) {
          filtered = documents.filter((doc) =>
            doc.path?.startsWith(targetPath)
          );
        } else {
          filtered = documents.filter((doc) => doc.path === targetPath);
        }
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          (doc.last_modified_by &&
            doc.last_modified_by.toLowerCase().includes(query))
      );
    }

    setFilteredDocuments(filtered);
    setSelectedDocuments(new Set());
  }, [documents, currentFolderId, includeNested, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(new Set(filteredDocuments.map((doc) => doc.id)));
    } else {
      setSelectedDocuments(new Set());
    }
  };

  const handleSelectDocument = (docId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocuments);

    if (checked) {
      newSelected.add(docId);
    } else {
      newSelected.delete(docId);
    }
    setSelectedDocuments(newSelected);
  };

  // Get the dialog folder ID - if table shows "all", default to root
  const getDialogFolderId = (): string => {
    return currentFolderId === "all" ? "root" : currentFolderId;
  };

  // Handle folder change from dialog - sync back to table
  const handleDialogFolderChange = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const handleUpload = async (encryptedFiles: FileItem[]) => {
    console.log(`Starting upload of ${encryptedFiles.length} files...`);

    try {
      const loadingToast = toast.loading(
        `Uploading ${encryptedFiles.length} files...`
      );

      const filesToUpload = encryptedFiles.map((file) => ({
        id: file.id,
        name: file.name,
        type: file.type,
        encryptedData: file.encryptedData,
        originalSize: file.originalSize,
      }));

      const response = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: filesToUpload,
          folderId: encryptedFiles[0]?.folderId,
        }),
      });

      const result = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      const { summary } = result;
      let summaryMessage = "";

      if (summary.successful > 0) {
        summaryMessage += `${summary.successful} uploaded`;
      }
      if (summary.skipped > 0) {
        summaryMessage += `${summaryMessage ? ", " : ""}${
          summary.skipped
        } skipped`;
      }
      if (summary.failed > 0) {
        summaryMessage += `${summaryMessage ? ", " : ""}${
          summary.failed
        } failed`;
      }

      if (summary.successful > 0) {
        toast.success(`Upload completed: ${summaryMessage}`);
      } else if (summary.skipped === summary.total) {
        toast.warning(`All files were duplicates: ${summaryMessage}`);
      } else {
        toast.error(`Upload failed: ${summaryMessage}`);
      }

      if (summary.duplicates.length > 0) {
        toast.warning(
          `Duplicate files detected: ${summary.duplicates.join(
            ", "
          )}. Use update feature to replace existing files.`,
          { duration: 8000 }
        );
      }

      if (summary.successful > 0) {
        toast.success(
          "Files sent to server! They are now being processed and indexed. This may take a minute.",
          {
            duration: 8000, // Make it last longer so the user has time to read it
            icon: "⏳", // An hourglass or clock icon can be very effective
          }
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDelete = async (fileIds: string[]) => {
    if (!fileIds || fileIds.length === 0) {
      toast.error("No files selected for deletion.");
      return;
    }

    const loadingToast = toast.loading(`Deleting ${fileIds.length} file(s)...`);

    try {
      const response = await fetch("/api/docs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: fileIds }),
      });

      const result = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) {
        throw new Error(
          result.error || `Request failed with status ${response.status}`
        );
      }

      const { deletedCount, failedCount, failures } = result;

      let reloaded = false;

      if (failedCount > 0 && failures) {
        const failureDetails = (failures as DeletionFailure[])
          .map((f) => `  - File ID ${f.id}: ${f.message}`)
          .join("\n");

        console.error(
          `Failed to delete ${failedCount} file(s):\n${failureDetails}`
        );

        toast.error(
          `Could not delete ${failedCount} file(s). Check the console for details.`,
          { duration: 8000 }
        );
      }

      if (deletedCount > 0) {
        toast.success(`${deletedCount} file(s) deleted successfully.`);

        fetchDocuments();
      }

      if (deletedCount === 0 && failedCount === 0 && !reloaded) {
        toast.info("No files were deleted.");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("An error occurred during deletion:", error);
      toast.error(
        `Deletion failed: ${
          error instanceof Error ? error.message : "An unknown error occurred"
        }`
      );
    }
  };

  const isAllSelected =
    filteredDocuments.length > 0 &&
    selectedDocuments.size === filteredDocuments.length;
  const isIndeterminate =
    selectedDocuments.size > 0 &&
    selectedDocuments.size < filteredDocuments.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        Error loading documents: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div>
          <Select value={currentFolderId} onValueChange={setCurrentFolderId}>
            <SelectTrigger className="bg-background min-w-30">
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              {folderOptions.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-nested"
            checked={includeNested}
            onCheckedChange={(checked) => setIncludeNested(!!checked)}
          />
          <label
            htmlFor="include-nested"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Include nested files
          </label>
        </div>

        <div className="relative flex-1 max-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by title or modifier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          onClick={() => setUploadDialogOpen(true)}
          className="bg-aquamarine-50 hover:bg-aquamarine-800 dark:bg-aquamarine dark:hover:bg-aquamarine-50 text-black-2 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Document</span>
        </Button>

        <div className="ml-auto">
          <Button
            onClick={() => setDeleteDialogOpen(true)}
            className="text-white bg-red-500 hover:bg-red-600 flex items-center gap-2"
            disabled={selectedDocuments.size === 0}>
            <Trash2 className="h-4 w-4" />
            <span className="sm:hidden">({selectedDocuments.size})</span>
            <span className="hidden sm:inline">
              Delete Selected ({selectedDocuments.size})
            </span>
          </Button>
        </div>
      </div>

      <Table className="p-2 rounded-lg">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isIndeterminate ? "indeterminate" : isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
              />
            </TableHead>
            <TableHead>Doc ID</TableHead>
            <TableHead>Doc Name</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Last Modified By</TableHead>
            <TableHead className="text-end">Last Modified At</TableHead>
            <TableHead className="text-end">Created At</TableHead>
            <TableHead className="text-center">URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-8 text-muted-foreground">
                No documents found
              </TableCell>
            </TableRow>
          ) : (
            filteredDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedDocuments.has(doc.id)}
                    onCheckedChange={(checked) =>
                      handleSelectDocument(doc.id, checked === true)
                    }
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{doc.id}</TableCell>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {doc.path || "-"}
                </TableCell>
                <TableCell>{doc.last_modified_by || "-"}</TableCell>
                <TableCell className="text-sm text-end">
                  {doc.last_modified_at || "-"}
                </TableCell>
                <TableCell className="text-sm text-end">
                  {doc.created_at}
                </TableCell>
                <TableCell className="text-center">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline cursor-pointer text-aquamarine-800 dark:text-aquamarine hover:text-green-text">
                      Link
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="text-xs text-muted-foreground">
        Showing {filteredDocuments.length} out of {documents.length} documents
      </div>

      <FileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
        title={`Upload Documents`}
        description="Upload documents to the knowledge base. Maximum file size is 250MB."
        folders={folderOptions}
        selectedFolderId={getDialogFolderId()}
        onFolderChange={handleDialogFolderChange}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        title="Delete Documents"
        id={[...selectedDocuments]}
        itemType="document"
      />
    </div>
  );
}
