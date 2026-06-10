'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是 AI 高考志愿顾问。\n\n告诉我你的情况——省份、文理科、分数（或预估分数）、位次、家庭背景、想去哪里、想学什么、有什么资源……我知道什么就问什么，缺信息就追问，不会给你糊弄的答案。\n\n开始吧 👇',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.filter((m) => m.role !== 'assistant' || messages.indexOf(m) > 0),
            { role: 'user', content: text },
          ],
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: '抱歉，出了点问题，请稍后再试。' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '网络错误，请刷新页面后重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-800 px-4 py-3 text-center">
        <h1 className="text-lg font-bold text-amber-400">🎓 AI 高考志愿顾问</h1>
        <p className="text-xs text-zinc-500 mt-0.5">会追问 · 会分析 · 敢说真话</p>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-amber-600 text-white rounded-br-md'
                  : 'bg-zinc-800 text-zinc-200 rounded-bl-md'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-zinc-400">
              分析中<span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="shrink-0 border-t border-zinc-800 p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的情况，比如：湖北物理580分，想学计算机..."
            className="flex-1 bg-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold rounded-xl px-5 py-3 text-sm transition"
          >
            发送
          </button>
        </form>
        <p className="text-center text-xs text-zinc-600 mt-2">
          ⚠️ AI 建议仅供参考，最终决策请以官方招生简章和录取数据为准
        </p>
      </footer>
    </div>
  );
}
