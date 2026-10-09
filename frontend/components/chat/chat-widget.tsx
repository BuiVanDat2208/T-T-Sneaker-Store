"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, X, Send, Bot, User, Loader2, 
  Sparkles, ShoppingBag, RotateCcw, ArrowRight, ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";

interface Action {
  type: "product" | "order";
  slug?: string;
  name?: string;
  price?: string;
  image?: string;
}

interface Message {
  role: "assistant" | "user";
  content: string;
  actions?: Action[];
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Khôi phục lịch sử từ localStorage khi khởi tạo
  useEffect(() => {
    const saved = localStorage.getItem("tt_chat_history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        { role: "assistant", content: "Xin chào! Tôi là T&T AI Assistant. Tôi có thể giúp bạn tìm đôi giày ưng ý nhất hoặc kiểm tra đơn hàng. Bạn đang quan tâm đến mẫu giày nào?" }
      ]);
    }
  }, []);

  // Lưu lịch sử mỗi khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("tt_chat_history", JSON.stringify(messages));
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearHistory = () => {
    const defaultMsg: Message[] = [{ role: "assistant", content: "Đã làm mới cuộc hội thoại. Tôi có thể giúp gì thêm cho bạn?" }];
    setMessages(defaultMsg);
    localStorage.setItem("tt_chat_history", JSON.stringify(defaultMsg));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage, 
          userId: user?._id,
          history: messages.slice(-6) // Sử dụng messages cũ làm history
        })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.reply,
        actions: data.actions // Hỗ trợ nhận actions từ AI
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Rất xin lỗi, tôi đang gặp một chút vấn đề về kết nối. Bạn vui lòng thử lại sau nhé!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[600px] bg-white rounded-[32px] shadow-2xl border-2 border-slate-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="bg-slate-900 p-6 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-inner">
                  <Sparkles className="h-5 w-5 text-white" />
               </div>
               <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-wider">T&T AI Agent</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Thông minh & Sẵn sàng</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-1">
               <Button variant="ghost" size="icon" onClick={clearHistory} title="Xóa lịch sử" className="text-white/30 hover:text-white hover:bg-white/10 rounded-xl">
                  <RotateCcw className="h-4 w-4" />
               </Button>
               <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl">
                  <X className="h-5 w-5" />
               </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn("flex items-start gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                    msg.role === "assistant" ? "bg-white border" : "bg-slate-900"
                  )}>
                    {msg.role === "assistant" ? <Bot className="h-4 w-4 text-blue-600" /> : <User className="h-4 w-4 text-white" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === "assistant" 
                      ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none" 
                      : "bg-slate-900 text-white rounded-tr-none"
                  )}>
                    {msg.content}
                  </div>
                </div>

                {/* Actions / Product Cards */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="pl-11 w-full space-y-3 mt-1">
                    {msg.actions.map((action, actionIdx) => (
                      <div key={actionIdx} className="bg-white rounded-2xl border-2 border-slate-50 p-3 shadow-sm hover:border-blue-200 transition-all group">
                        {action.type === "product" && (
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border">
                               {action.image ? (
                                 <img src={action.image} alt={action.name} className="h-full w-full object-cover" />
                               ) : (
                                 <ShoppingBag className="h-full w-full p-3 text-slate-300" />
                               )}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-black text-slate-900 truncate">{action.name}</p>
                               <p className="text-[11px] font-bold text-blue-600 mt-0.5">{action.price}</p>
                            </div>
                            <Link href={`/products/${action.slug}`} className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                               <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <div className="h-8 w-8 rounded-xl bg-white border flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-400" />
                 </div>
                 <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                    <div className="flex gap-1">
                       <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" />
                       <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                       <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white border-t">
            <div className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Nhập câu hỏi..."
                className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 pr-12 text-sm font-medium focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 top-1.5 h-9 w-9 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 disabled:opacity-20 transition-all active:scale-90 shadow-md"
                aria-label="Gửi tin nhắn"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
               <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">Sneaker Intelligence</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-16 w-16 rounded-[24px] shadow-2xl transition-all duration-500 active:scale-90 group relative overflow-hidden bg-slate-900 hover:bg-slate-800",
          isOpen ? "ring-4 ring-blue-600/20" : ""
        )}
        aria-label="Mở hoặc đóng cửa sổ trợ lý AI"
      >
        <div className="relative z-10 flex items-center justify-center">
           {isOpen ? <X className="h-7 w-7 text-white" /> : <MessageSquare className="h-7 w-7 text-white" />}
        </div>
        <div className={cn(
          "absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )} />
      </Button>
    </div>
  );
}
