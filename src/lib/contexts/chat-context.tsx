"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useChat as useAIChat } from "@ai-sdk/react";
import { Message } from "ai";
import { useFileSystem } from "./file-system-context";
import { setHasAnonWork } from "@/lib/anon-work-tracker";

interface ChatContextProps {
  projectId?: string;
  initialMessages?: Message[];
}

interface ChatContextType {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  projectId,
  initialMessages = [],
}: ChatContextProps & { children: ReactNode }) {
  const { fileSystem, handleToolCall } = useFileSystem();

  // Keep a ref to projectId so the submit callback always sees the latest value
  // without needing to be re-created on every projectId change.
  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: aiHandleSubmit,
    status,
  } = useAIChat({
    api: "/api/chat",
    initialMessages,
    onToolCall: ({ toolCall }) => {
      handleToolCall(toolCall);
    },
  });

  // Serialize the VFS only at submit time, not on every render
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      aiHandleSubmit(e, {
        body: {
          files: fileSystem.serialize(),
          projectId: projectIdRef.current,
        },
      });
    },
    [aiHandleSubmit, fileSystem]
  );

  // Track anonymous work — only after streaming finishes to avoid serializing
  // on every streaming token
  useEffect(() => {
    if (!projectId && messages.length > 0 && status === "ready") {
      setHasAnonWork(messages, fileSystem.serialize());
    }
  }, [messages, fileSystem, projectId, status]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        input,
        handleInputChange,
        handleSubmit,
        status,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}