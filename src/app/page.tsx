'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME = `你好！我是 AI 高考志愿顾问。

告诉我你的情况——省份、文理科、分数（或预估分数）、位次、家庭背景、想去哪里、想学什么、家里有没有行业资源？

我知道什么就问什么，缺信息就追问。该劝退的专业直接劝退，不会跟你客套。

开始吧 👇`;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
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
      const reply = data.reply || '抱歉，出了点问题，请稍后再试。';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '网络错误，请稍后重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-dvh" style={{ background: '#f5f4ed' }}>
      {/* Header */}
      <header
        className="shrink-0 border-b px-5 py-4 flex items-center justify-between"
        style={{ borderColor: '#e8e6dc', background: '#faf9f5' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <h1
              className="text-lg font-medium tracking-tight"
              style={{ color: '#141413', fontFamily: 'Georgia, serif' }}
            >
              AI 高考志愿顾问
            </h1>
            <p className="text-xs" style={{ color: '#87867f' }}>
              会追问 · 会分析 · 敢说真话
            </p>
          </div>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{ background: '#e8e6dc', color: '#5e5d59' }}
        >
          Beta
        </span>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 mt-0.5"
                  style={{ background: '#c96442', color: '#faf9f5' }}
                >
                  🎓
                </div>
              )}
              <div
                className="max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap"
                style={
                  m.role === 'user'
                    ? {
                        background: '#c96442',
                        color: '#faf9f5',
                        borderBottomRightRadius: '6px',
                      }
                    : {
                        background: '#ffffff',
                        color: '#4d4c48',
                        border: '1px solid #f0eee6',
                        borderBottomLeftRadius: '6px',
                        boxShadow: '0px 2px 12px rgba(0,0,0,0.04)',
                      }
                }
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3"
                style={{ background: '#c96442', color: '#faf9f5' }}
              >
                🎓
              </div>
              <div
                className="rounded-2xl px-5 py-3.5 text-sm"
                style={{
                  background: '#ffffff',
                  color: '#87867f',
                  border: '1px solid #f0eee6',
                  borderBottomLeftRadius: '6px',
                }}
              >
                正在分析<span className="animate-pulse">...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer
        className="shrink-0 border-t px-4 py-4"
        style={{ borderColor: '#e8e6dc', background: '#faf9f5' }}
      >
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2.5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="湖北物理580分，位次28000，普通家庭，想去武汉学计算机..."
              className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              style={{
                background: '#f5f4ed',
                color: '#141413',
                border: '1px solid #e8e6dc',
              }}
              disabled={loading}
              onFocus={(e) => {
                e.target.style.borderColor = '#3898ec';
                e.target.style.boxShadow = '0px 0px 0px 2px rgba(56,152,236,0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8e6dc';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl px-5 py-3 text-sm font-medium transition-all active:scale-95"
              style={{
                background: loading || !input.trim() ? '#e8e6dc' : '#c96442',
                color: loading || !input.trim() ? '#87867f' : '#faf9f5',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              发送
            </button>
          </form>
          <p className="text-center text-xs mt-3" style={{ color: '#b0aea5' }}>
            ⚠️ AI 建议仅供参考，最终决策请以官方招生简章和录取数据为准
          </p>
        </div>
      </footer>
    </div>
  );
}
