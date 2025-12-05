"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "admin" | "visitor";
  message: string;
  createdAt: string;
  read: boolean;
}

interface Chat {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  status: "open" | "closed";
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
}

export default function SupportPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅 목록 불러오기
  useEffect(() => {
    fetchChats();
  }, []);

  // 선택된 채팅의 메시지 불러오기
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/support/chats");
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/support/chats/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);

        // 읽음 처리
        await fetch(`/api/support/chats/${chatId}/read`, {
          method: "PATCH",
        });

        // 읽음 카운트 업데이트
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      const response = await fetch(`/api/support/chats/${selectedChat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");

        // 채팅 목록 업데이트
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  lastMessage: newMessage,
                  lastMessageAt: new Date().toISOString(),
                }
              : chat
          )
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("메시지 전송에 실패했습니다");
    } finally {
      setSending(false);
    }
  };

  const closeChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/support/chats/${chatId}/close`, {
        method: "PATCH",
      });

      if (response.ok) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, status: "closed" } : chat
          )
        );
        alert("문의가 종료되었습니다");
      }
    } catch (error) {
      console.error("Failed to close chat:", error);
      alert("문의 종료에 실패했습니다");
    }
  };

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className="p-6 h-[calc(100vh-4rem)]">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            고객관리
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalUnread}개의 읽지 않은 문의가 있습니다
          </p>
        </div>
        <Link
          href="/dashboard/support/settings"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <span className="material-symbols-outlined">settings</span>
          <span>채팅 설정</span>
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-6rem)]">
        {/* 채팅 목록 */}
        <div className="col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-black dark:text-white">
              문의 목록 ({chats.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-3">
                  chat_bubble_outline
                </span>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  문의가 없습니다
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      selectedChat?.id === chat.id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    } ${chat.unreadCount > 0 ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-black dark:text-white">
                          {chat.userName}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          chat.status === "open"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {chat.status === "open" ? "진행중" : "종료"}
                      </span>
                    </div>
                    {chat.userEmail && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {chat.userEmail}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {chat.lastMessage}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(chat.lastMessageAt).toLocaleString("ko-KR")}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 채팅 내용 */}
        <div className="col-span-8 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          {selectedChat ? (
            <>
              {/* 채팅 헤더 */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-black dark:text-white">
                    {selectedChat.userName}
                  </h2>
                  {selectedChat.userEmail && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedChat.userEmail}
                    </p>
                  )}
                </div>
                {selectedChat.status === "open" && (
                  <button
                    onClick={() => closeChat(selectedChat.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    문의 종료
                  </button>
                )}
              </div>

              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderType === "admin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        msg.senderType === "admin"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                      } rounded-lg px-4 py-2`}
                    >
                      <p className="text-sm mb-1">{msg.message}</p>
                      <p
                        className={`text-xs ${
                          msg.senderType === "admin"
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 메시지 입력 */}
              {selectedChat.status === "open" && (
                <form
                  onSubmit={sendMessage}
                  className="p-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      전송
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-3">
                chat
              </span>
              <p className="text-gray-500 dark:text-gray-400">
                채팅을 선택하세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
