"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, Send, Phone, Video, MoreVertical, Check, CheckCheck } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("rabahdj_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const chats = [
    { id: 1, name: "أحمد", avatar: "👨", lastMessage: "مرحباً! كيف حالك؟", time: "10:30", unread: 2, online: true },
    { id: 2, name: "سارة", avatar: "👩", lastMessage: "شكراً جزيلاً!", time: "09:15", unread: 0, online: true },
    { id: 3, name: "محمد", avatar: "👨‍💼", lastMessage: "غداً نلتقي", time: "أمس", unread: 1, online: false },
    { id: 4, name: "فاطمة", avatar: "👩‍🎓", lastMessage: "تمام", time: "أمس", unread: 0, online: true },
    { id: 5, name: "خالد", avatar: "👨‍🔧", lastMessage: "حاضر", time: "الاثنين", unread: 0, online: false },
  ];

  const [messages, setMessages] = useState([
    { id: 1, senderId: 2, text: "مرحباً! 👋", time: "10:25", status: "read" },
    { id: 2, senderId: 2, text: "كيف حالك اليوم؟", time: "10:26", status: "read" },
    { id: 3, senderId: 1, text: "أنا بخير، شكراً!", time: "10:28", status: "read" },
    { id: 4, senderId: 2, text: "مرحباً! كيف حالك؟", time: "10:30", status: "delivered" },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      senderId: 1,
      text: newMessage,
      time: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const selectedChatData = chats.find(c => c.id === selectedChat);

  if (selectedChat && selectedChatData) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Chat Header */}
        <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                  {selectedChatData.avatar}
                </div>
                {selectedChatData.online && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                )}
              </div>
              <div>
                <h1 className="text-white font-bold">{selectedChatData.name}</h1>
                <p className="text-slate-400 text-xs">
                  {selectedChatData.online ? "متصل الآن" : "غير متصل"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                <Phone className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                <Video className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === 1 ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  msg.senderId === 1
                    ? "bg-slate-700 text-white rounded-br-md"
                    : "bg-blue-500 text-white rounded-bl-md"
                }`}
              >
                <p>{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${msg.senderId === 1 ? "text-slate-400" : "text-blue-200"} text-xs`}>
                  <span>{msg.time}</span>
                  {msg.senderId !== 1 && (
                    msg.status === "read" ? (
                      <CheckCheck className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="glass border-t border-slate-700/50 p-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="اكتب رسالتك..."
              className="flex-1 bg-slate-800 rounded-full px-6 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              onClick={handleSend}
              className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/home")}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">محادثات فورية</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="glass rounded-full px-4 py-3 mb-6">
          <input
            type="text"
            placeholder="بحث في المحادثات..."
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Chats List */}
        <div className="space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                  {chat.avatar}
                </div>
                {chat.online && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
                )}
              </div>
              <div className="flex-1 text-right">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-bold">{chat.name}</h3>
                  <span className="text-slate-500 text-xs">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
