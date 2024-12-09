import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  saveChatSession,
  getChatSessionById,
  generateSessionId,
  getAllChatSessions,
  deleteSession,
  ChatSession,
} from "@/lib/sessionStorage";
import { sendMessage } from "@/lib/api";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function useTelkomLLM() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string>(searchParams?.get("sessionId") || "new");    
  const [input, setInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.");
  const [conversation, setConversation] = useState<Message[]>([
    { role: "system", content: systemPrompt },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0);
  const [maxGenLen, setMaxGenLen] = useState(100);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load existing chat sessions on component mount
  useEffect(() => {
    setChatSessions(getAllChatSessions());
  }, []);

  // Load conversation from session ID
  useEffect(() => {
    if (sessionId && sessionId !== "new") {
      const session = getChatSessionById(sessionId);
      if (session) {
        setConversation(session.messages);
        setSystemPrompt(session.messages[0].content);
      }
    } else {
      setConversation([{ role: "system", content: "You are a helpful assistant." }]);
      setSystemPrompt("You are a helpful assistant.");
    }
  }, [sessionId]);

  // Auto-save conversation to session storage
  useEffect(() => {
    if (sessionId && sessionId !== "new") {
      saveChatSession({
        id: sessionId,
        messages: conversation,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [conversation, sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversation]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);

    if (!sessionId || sessionId === "new") {
      const newSessionId = generateSessionId();
      router.push(`/api/telkom-llm?sessionId=${newSessionId}`);
      setSessionId(newSessionId); // Update sessionId state
    }

    const result = await sendMessage(input, conversation, temperature, maxGenLen);
    const updatedConversation = result.updatedConversation;
    setConversation(updatedConversation);

    saveChatSession({
      id: sessionId,
      messages: updatedConversation,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setChatSessions(getAllChatSessions());
    setInput("");
    setIsLoading(false);
  };

  const handleSystemPromptEdit = (newContent: string) => {
    setSystemPrompt(newContent);
    setConversation((prev) => [{ role: "system", content: newContent }, ...prev.slice(1)]);
  };

  const handleSessionSelect = (selectedSessionId: string) => {
    router.push(`/api/telkom-llm?sessionId=${selectedSessionId}`);
  };

  const handleNewChat = () => {
    router.push("/api/telkom-llm?sessionId=new");
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionToDelete: string) => {
    e.stopPropagation(); // Prevent triggering the session selection
    deleteSession(sessionToDelete);
    setChatSessions(getAllChatSessions());

    if (sessionId === sessionToDelete) {
      router.push("/api/telkom-llm?sessionId=new");
    }
  };

  return {
    sessionId,
    input,
    systemPrompt,
    conversation,
    isLoading,
    temperature,
    maxGenLen,
    chatSessions,
    messagesEndRef,
    setInput,
    setTemperature,
    setMaxGenLen,
    handleSend,
    handleSystemPromptEdit,
    handleSessionSelect,
    handleNewChat,
    handleDeleteSession,
  };
}
