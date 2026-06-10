'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME = [
  '你好！我是 AI 高考志愿顾问。',
  '',
  '告诉我你的情况——省份、文理科、分数（或预估分数）、位次、家庭背景、想去哪里、想学什么、家里有没有行业资源？',
  '',
  '我知道什么就问什么，缺信息就追问。该劝退的专业直接劝退，不会跟你客套。',
  '',
  '开始吧 👇',
].join('\n');

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const history = [...messages, { role: 'user' as const, content: text }];
    setMessages(history);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || '抱歉，出了点问题，请稍后再试。' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '网络错误，请稍后重试。' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-[var(--parchment)]">
      {/* Header */}
      <header className="shrink-0 border-b border-[var(--border-warm)] bg-[var(--ivory)]">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <h1 className="text-lg font-semibold text-[var(--near-black)]" style={{ fontFamily: 'Georgia, serif' }}>
                AI 高考志愿顾问
              </h1>
              <p className="text-xs text-[var(--stone)]">会追问 · 会分析 · 敢说真话</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--border-warm)] text-[var(--olive)]">
            Beta
          </span>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--terracotta)] text-[var(--ivory)] flex items-center justify-center text-sm mr-3 mt-0.5">
                  🎓
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[var(--terracotta)] text-[var(--ivory)] rounded-br-md'
                    : 'bg-[var(--white)] text-[var(--charcoal)] rounded-bl-md border border-[var(--border-cream)]'
                }`}
                style={{ boxShadow: m.role === 'assistant' ? '0 2px 12px rgba(0,0,0,0.04)' : 'none' }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--terracotta)] text-[var(--ivory)] flex items-center justify-center text-sm mr-3">
                🎓
              </div>
              <div className="rounded-2xl rounded-bl-md px-5 py-3.5 text-[15px] text-[var(--stone)] bg-[var(--white)] border border-[var(--border-cream)]">
                分析中<span className="animate-pulse">...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="shrink-0 border-t border-[var(--border-warm)] bg-[var(--ivory)]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex gap-2.5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="湖北物理580分，位次28000，想学计算机..."
              disabled={loading}
              className="flex-1 rounded-xl px-4 py-3 text-[15px] text-[var(--near-black)] bg-[var(--parchment)] border border-[var(--border-warm)] outline-none placeholder:text-[var(--silver)] focus:border-[var(--focus-blue)] transition-colors"
              style={{ boxShadow: 'none' }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(56,152,236,0.12)'; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl px-5 py-3 text-[15px] font-semibold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: loading || !input.trim() ? 'var(--border-warm)' : 'var(--terracotta)',
                color: loading || !input.trim() ? 'var(--stone)' : 'var(--ivory)',
              }}
            >
              发送
            </button>
          </form>
          <p className="text-center text-xs mt-3 text-[var(--silver)]">
            ⚠️ AI 建议仅供参考，最终决策请以官方招生简章和录取数据为准
          </p>
        </div>
      </footer>
    </div>
  );
}
