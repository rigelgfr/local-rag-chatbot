"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ChatBubble from "@/components/main/ChatBubble";
import { Message } from "@/types/chat";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteDialog from "@/components/custom-ui/DeleteDialog";
import { Loading } from "@/components/custom-ui/Loading";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  created_at: string;
  type: "human" | "ai" | null;
  content: string | null;
}

interface ChatSessionData {
  session_id: string;
  user_id: string;
  user: User;
  last_online_at: string;
  created_at: string;
  messages: ChatMessage[];
}

export default function Chats() {
  const [chatSessions, setChatSessions] = useState<ChatSessionData[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<ChatSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredChatSessions, setFilteredChatSessions] = useState<
    ChatSessionData[]
  >([]);
  const [selectedChatSessions, setSelectedChatSessions] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchChatSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chat");

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
        setChatSessions(result.data);
        // Set the first (newest) session as selected by default
        if (result.data.length > 0) {
          setSelectedSession(result.data[0]);
        }
      } else {
        throw new Error(result.error || "Failed to fetch chat sessions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`/api/chat/${sessionId}`);

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
        setSelectedSession(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch session messages");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load messages"
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSessionClick = (session: ChatSessionData) => {
    if (session.session_id === selectedSession?.session_id) return;
    fetchSessionMessages(session.session_id);
  };

  useEffect(() => {
    fetchChatSessions();
  }, []);

  useEffect(() => {
    let filtered = chatSessions;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((session) =>
        session.user.name.toLowerCase().includes(query)
      );
    }

    setFilteredChatSessions(filtered);
  }, [chatSessions, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedChatSessions(
        new Set(filteredChatSessions.map((session) => session.session_id))
      );
    } else {
      setSelectedChatSessions(new Set());
    }
  };

  const handleSelectChatSession = (sessionId: string, checked: boolean) => {
    const newSelected = new Set(selectedChatSessions);

    if (checked) {
      newSelected.add(sessionId);
    } else {
      newSelected.delete(sessionId);
    }
    setSelectedChatSessions(newSelected);
  };

  const handleDelete = async (sessionIds: string[]) => {
    if (!sessionIds || sessionIds.length === 0) {
      toast.error("No sessions selected for deletion.");
      return;
    }

    const loadingToast = toast.loading(
      `Deleting ${sessionIds.length} file(s)...`
    );

    try {
      const response = await fetch("/api/chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionIds }),
      });

      const result = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) {
        throw new Error(
          result.error || `Request failed with status ${response.status}`
        );
      }

      if (result.success) {
        toast.success(result.message);

        // Clear selection
        setSelectedChatSessions(new Set());

        setSelectedSession(null);

        fetchChatSessions();

        setDeleteDialogOpen(false);
      } else {
        throw new Error(result.error || "Failed to delete sessions");
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

  // Convert ChatMessage to Message format for ChatBubble
  const convertToMessage = (
    chatMessage: ChatMessage,
    index: number
  ): Message => ({
    id: index.toString(),
    text: chatMessage.content || "",
    sender: chatMessage.type === "human" ? "user" : "bot",
    timestamp: new Date(chatMessage.created_at),
  });

  if (loading) {
    return (
      <div className="flex space-x-4">
        <Skeleton className="h-60 w-1/3" />
        <Skeleton className="h-60 w-2/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex flex-col sm:flex-row gap-4 mb-4">
      {/* Left Sidebar - Sessions List */}
      <div className="flex flex-col w-full sm:w-1/3">
        {/* Search Header */}
        <div className="p-4 pl-0">
          <div className="flex items-center gap-4 mb-2">
            <Checkbox
              id="include-nested"
              checked={
                selectedChatSessions.size === filteredChatSessions.length &&
                filteredChatSessions.length > 0
              }
              onCheckedChange={(checked) => handleSelectAll(!!checked)}
            />
            <div className="relative flex-1 w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button
              onClick={() => setDeleteDialogOpen(true)}
              className="text-white bg-red-500 hover:bg-red-600 flex items-center gap-2"
              disabled={selectedChatSessions.size === 0}>
              <Trash2 className="h-4 w-4" />
              <span className="sm:hidden">({selectedChatSessions.size})</span>
              <span className="hidden xs:inline">
                Delete ({selectedChatSessions.size})
              </span>
            </Button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="overflow-y-auto px-2 h-full">
          {filteredChatSessions.map((session) => (
            <div
              key={session.session_id}
              className={`w-full px-4 py-3 text-left transition-colors border-b ${
                selectedSession?.session_id === session.session_id
                  ? "bg-muted border-1"
                  : "hover:bg-muted"
              }`}>
              <div className="flex items-center gap-4">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0">
                  <Checkbox
                    checked={selectedChatSessions.has(session.session_id)}
                    onCheckedChange={(checked) =>
                      handleSelectChatSession(
                        session.session_id,
                        checked === true
                      )
                    }
                    className="rounded"
                  />
                </div>
                <div
                  className="flex-1 min-w-0 cursor-pointer rounded px-2 py-1 -mx-2 -my-1"
                  onClick={() => handleSessionClick(session)}>
                  <div className="font-medium text-sm truncate">
                    {session.user.name} -{" "}
                    <span className="text-muted-foreground text-xs">
                      {session.session_id}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Last online: {session.last_online_at}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-aquamarine-50 dark:border-aquamarine bg-muted">
              <h2 className="text-xl font-semibold text-foreground">
                {selectedSession.user.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Last online: {selectedSession.last_online_at}
              </p>
            </div>

            {/* Chat Messages */}
            <div className="overflow-y-auto h-full p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-lg">
                    <Loading />
                  </div>
                </div>
              ) : selectedSession.messages.length > 0 ? (
                selectedSession.messages.map((message, index) => (
                  <ChatBubble
                    key={index}
                    message={convertToMessage(message, index)}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">
                    No messages in this session
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <h3 className="text-xl font-medium mb-2">
                Select a chat session
              </h3>
              <p>Choose a session from the left to view the conversation</p>
            </div>
          </div>
        )}
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        title="Delete Chat Session"
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        id={[...selectedChatSessions]}
        itemType="chats"
      />
    </div>
  );
}
