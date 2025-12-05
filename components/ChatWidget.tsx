"use client";

import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "admin" | "visitor";
  message: string;
  createdAt: string;
}

interface ChatWidgetProps {
  position?: { bottom: number; right: number };
}

export default function ChatWidget({ position = { bottom: 20, right: 20 } }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [showNameForm, setShowNameForm] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 폴링 (5초마다 새 메시지 확인)
  useEffect(() => {
    if (!isOpen || !chatId) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, chatId]);

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visitorName.trim() || !newMessage.trim()) {
      alert("이름과 메시지를 입력하세요");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/support/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage,
          visitorName: visitorName.trim(),
          visitorEmail: visitorEmail.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatId(data.chat.id);
        setShowNameForm(false);
        setNewMessage("");

        // 메시지 불러오기
        fetchMessages();
      } else {
        alert("채팅 시작에 실패했습니다");
      }
    } catch (error) {
      console.error("Start chat error:", error);
      alert("채팅 시작에 실패했습니다");
    } finally {
      setSending(false);
    }
  };

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const response = await fetch(`/api/support/chats/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !chatId) return;

    setSending(true);
    try {
      const response = await fetch(`/api/support/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage,
          visitorName: visitorName, // 방문자 이름 전송
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      } else {
        alert("메시지 전송에 실패했습니다");
      }
    } catch (error) {
      console.error("Send message error:", error);
      alert("메시지 전송에 실패했습니다");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* 채팅 버튼 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition"
          style={{ bottom: `${position.bottom}px`, right: `${position.right}px` }}
          title="채팅 문의"
        >
          <span className="material-symbols-outlined text-3xl">chat</span>
        </button>
      )}

      {/* 채팅 창 */}
      {isOpen && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-96 h-[500px] flex flex-col"
          style={{ bottom: `${position.bottom}px`, right: `${position.right}px` }}
        >
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-blue-600 rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white">support_agent</span>
              <h3 className="font-semibold text-white">고객 지원</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 rounded-full p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* 채팅 시작 폼 */}
          {showNameForm ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-black dark:text-white mb-2">
                  안녕하세요! 👋
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  무엇을 도와드릴까요? 문의 내용을 남겨주시면 빠르게 답변드리겠습니다.
                </p>
              </div>

              <form onSubmit={startChat} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="홍길동"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    이메일 (선택)
                  </label>
                  <input
                    type="email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="hong@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    문의 내용 *
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="문의 내용을 입력하세요..."
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {sending ? "전송 중..." : "채팅 시작"}
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      메시지를 입력하세요
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderType === "admin" ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] ${
                            msg.senderType === "admin"
                              ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                              : "bg-blue-600 text-white"
                          } rounded-lg px-4 py-2`}
                        >
                          {msg.senderType === "admin" && (
                            <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                              {msg.senderName}
                            </p>
                          )}
                          <p className="text-sm mb-1">{msg.message}</p>
                          <p
                            className={`text-xs ${
                              msg.senderType === "admin"
                                ? "text-gray-500 dark:text-gray-400"
                                : "text-blue-100"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* 메시지 입력 */}
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
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
