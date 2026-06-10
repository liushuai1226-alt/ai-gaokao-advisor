'use client';

import { useState, useRef, useEffect } from 'react';

const WELCOME = [
  '你好！我是 AI 高考志愿顾问。',
  '',
  '告诉我你的情况——省份、文理科、分数、位次、家庭背景、想去哪里、想学什么？',
  '',
  '我知道什么就问什么，缺信息就追问。不适合的专业直接劝退。',
  '',
  '开始吧 👇',
].join('\n');

export default function Home() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const history = [...messages, { role: 'user', content: text }];
    setMessages(history);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || '出错了' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '网络错误，请重试' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-zinc-950">
      {/* header */}
      <div className="shrink-0 border-b border-zinc-800 px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg shadow-lg shadow-amber-500/20">
          🎓
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-100">AI 高考志愿顾问</div>
          <div className="text-xs text-zinc-500">会追问 · 会分析 · 敢说真话</div>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
                  🎓
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-black rounded-tr-md'
                    : 'bg-zinc-900 text-zinc-200 rounded-tl-md border border-zinc-800/50'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">🎓</div>
              <div className="rounded-2xl rounded-tl-md px-4 py-3 text-sm text-zinc-500 bg-zinc-900 border border-zinc-800/50">
                分析中<span className="animate-pulse">...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* input */}
      <div className="shrink-0 border-t border-zinc-800 p-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="说说你的情况..."
              disabled={loading}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="shrink-0 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold rounded-xl px-5 py-3 text-sm transition active:scale-95"
            >
              发送
            </button>
          </form>
          <div className="text-center text-xs text-zinc-700 mt-3">
            AI 建议仅供参考 · 请以官方招生简章为准
          </div>
        </div>
      </div>
    </div>
  );
}
