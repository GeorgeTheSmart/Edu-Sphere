"use client";

import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { Send, Bot, User, BookOpen, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  type?: "welcome" | "lesson" | "quiz" | "explanation";
}

type ChatEndpointResponse =
  | string
  | {
      response?: string;
      reply?: string;
      message?: string;
      text?: string;
      data?: unknown;
      [key: string]: unknown;
    };

const subjects = ["Math", "Science", "History", "Literature", "Programming"];

function extractReplyText(payload: ChatEndpointResponse): string {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return "Sorry, I couldn't parse the response.";

  const candidates = [payload.response, payload.reply, payload.message, payload.text]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0);

  if (candidates.length > 0) return candidates[0];

  // Common pattern: { data: { ... } }
  const data = (payload as any).data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const nestedCandidates = [data.response, data.reply, data.message, data.text]
      .filter((v: unknown): v is string => typeof v === "string" && v.trim().length > 0);
    if (nestedCandidates.length > 0) return nestedCandidates[0];
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return "Sorry, I couldn't read the response.";
  }
}

export default function ChatTutor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm your AI tutor 🎓 I'm here to help you learn and explore any topic. What would you like to study today?",
      timestamp: new Date(),
      type: "welcome"
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userId = localStorage.getItem("userId") || "anonymous";
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      const res = await apiFetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          message: currentInput,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const payload: ChatEndpointResponse = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const errorText = extractReplyText(payload);
        throw new Error(errorText || `Request failed with status ${res.status}`);
      }

      const replyText = extractReplyText(payload);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        timestamp: new Date(),
        type: "explanation",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text:
          e instanceof Error
            ? `Sorry — I couldn't reach the chat service. ${e.message}`
            : "Sorry — I couldn't reach the chat service.",
        timestamp: new Date(),
        type: "explanation",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectSubject = (subject: string) => {
    setSelectedSubject(subject);
    const subjectMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: `I'd like to learn about ${subject}`,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, subjectMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `Excellent choice! ${subject} is a fascinating subject. What specific topic in ${subject} would you like to explore? I can help with concepts, problem-solving, or just general understanding.`,
        timestamp: new Date(),
        type: "lesson"
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Tutor Assistant
              </h1>
              <p className="text-gray-600">Your personalized learning companion</p>
            </div>
          </div>

          {/* Subject Selection */}
          {!selectedSubject && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 mr-2">Quick topics:</span>
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => selectSubject(subject)}
                  className="px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  {subject}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                } animate-in slide-in-from-bottom-2 duration-300`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-gradient-to-r from-green-400 to-blue-500"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] ${
                    msg.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-4 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    } shadow-sm`}
                  >
                    {msg.type && msg.sender === "ai" && (
                      <div
                        className={`flex items-center gap-1 mb-2 text-xs opacity-75 ${
                          msg.sender === "ai" ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {msg.type.charAt(0).toUpperCase() + msg.type.slice(1)}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`text-xs mt-2 opacity-70 ${
                        msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
{/* Input Area */}
<div className="border-t border-gray-200 p-6 bg-white/50">
  <div className="flex gap-3 items-end">
    <div className="flex-1">
      <textarea
        ref={inputRef} // make sure inputRef is useRef<HTMLTextAreaElement>(null) in your component
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress} // changed to onKeyDown for better key handling
        placeholder="Ask me anything... I'm here to help you learn!"
        className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm max-h-32"
        rows={1}
        style={{
          minHeight: "48px",
          height: Math.min(input.split("\n").length * 24 + 24, 128) + "px"
        }}
      />
    </div>
    <button
      onClick={handleSend}
      disabled={!input.trim() || isTyping}
      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
      aria-label="Send message"
      type="button"
    >
      <Send className="w-5 h-5" />
    </button>
  </div>
  <div className="text-xs text-gray-500 mt-2 text-center">
    Press Enter to send • Shift + Enter for new line
  </div>
</div>

        </div>
      </div>
    </div>
  );
}
