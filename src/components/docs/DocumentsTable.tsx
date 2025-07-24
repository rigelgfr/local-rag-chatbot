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
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";
import FileUploadDialog from "./FileUploadDialog";

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

interface PathOption {
  id: string;
  path: string;
  displayPath: string;
}

export default function DocumentTable() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredDocuments, setFilteredDocuments] = useState<
    DocumentMetadata[]
  >([]);
  const [selectedPath, setSelectedPath] = useState<string>("all");
  const [uploadPath, setUploadPath] = useState<string>(() => "/");
  const [includeNested, setIncludeNested] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(
    new Set()
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folders, setFolders] = useState<FolderInfo[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/docs");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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
    fetchDocuments();
  }, []);

  // Transform folder paths to match document paths format and create a mapping
  const folderPathMapping = new Map(
    folders.map((folder) => {
      // Convert OneDrive path to DB path format
      const dbPath =
        folder.name === "rag-chatbot"
          ? "/"
          : `/${folder.fullPath.replace("rag-chatbot/", "")}`;
      return [folder.fullPath, dbPath];
    })
  );

  const uniquePaths: PathOption[] = [
    { id: "root", path: "/", displayPath: "/" },
    ...folders
      .filter((folder) => folder.name !== "rag-chatbot") // Exclude root folder since it's already added
      .map((folder) => {
        const dbPath = `/${folder.fullPath.replace("rag-chatbot/", "")}`;
        return {
          id: folder.id,
          path: dbPath,
          displayPath: dbPath,
        };
      }),
  ];

  useEffect(() => {
    let filtered = documents;

    if (selectedPath !== "all") {
      const dbPath = folderPathMapping.get(selectedPath);
      if (dbPath) {
        if (includeNested) {
          filtered = documents.filter((doc) => doc.path?.startsWith(dbPath));
        } else {
          filtered = documents.filter((doc) => doc.path === dbPath);
        }
      }
    }

    setFilteredDocuments(filtered);
    setSelectedDocuments(new Set());
  }, [documents, selectedPath, includeNested, folders]);

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

  const handleTablePathChange = (path: string) => {
    setSelectedPath(path);
    // Convert OneDrive path to DB path for upload
    if (path === "all") {
      setUploadPath("/");
    } else {
      const dbPath = folderPathMapping.get(path);
      setUploadPath(dbPath || "/");
    }
  };

  const handlePathChange = (path: string) => {
    setUploadPath(path);
  };

  const handleUploadClick = () => {
    setDialogOpen(true);
  };

  const handleUpload = (files: any[]) => {
    console.log(`Uploading ${files.length} files:`, files);
    // Handle the uploaded files here
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
        <Skeleton className="h-48" />
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
          <Select value={selectedPath} onValueChange={handleTablePathChange}>
            <SelectTrigger className="bg-background min-w-30">
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              {folders.map((folder) => {
                const dbPath =
                  folder.name === "rag-chatbot"
                    ? "/"
                    : `/${folder.fullPath.replace("rag-chatbot/", "")}`;
                return (
                  <SelectItem key={folder.id} value={folder.fullPath}>
                    {dbPath}
                  </SelectItem>
                );
              })}
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

        <Button
          onClick={handleUploadClick}
          className="bg-aquamarine-50 hover:bg-aquamarine-800 dark:bg-aquamarine dark:hover:bg-aquamarine-50 text-black-2 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {/* Hide on small screens, show from sm+ */}
          <span className="hidden sm:inline">Add Document</span>
        </Button>

        <div className="ml-auto">
          <Button
            className="text-white bg-red-500 hover:bg-red-600 flex items-center gap-2"
            disabled={selectedDocuments.size === 0}>
            <Trash2 className="h-4 w-4" />
            {/* Show only count (x) on mobile, full text on larger screens */}
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
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpload={handleUpload}
        title={`Upload Documents`}
        description="Upload documents to the knowledge base. Maximum file size is 250MB."
        paths={uniquePaths}
        selectedPath={uploadPath}
        onPathChange={handlePathChange}
      />
    </div>
  );
}
