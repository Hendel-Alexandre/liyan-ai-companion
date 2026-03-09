import { useState, useRef, useEffect, useCallback } from 'react';
import { Clock, Plus, Trash2, Volume2, ArrowUp, Mic, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/context/ChatContext';
import { useSettings } from '@/context/SettingsContext';
import { askLiyan, speakText, startVoiceInput } from '@/services/liyanAI';

const QUICK_CHIPS = [
  'How do I pray Fajr?',
  'Give me a morning dua',
  'What is Tawakkul?',
  'How to make Wudu?',
];

interface Msg {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  timestamp?: Date;
}

const formatTime = (d?: Date) => {
  if (!d) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/* ── Animated Orb ── */
const ChatOrb = ({ listening, size = 140 }: { listening: boolean; size?: number }) => (
  <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
    {listening && [0, 1].map(i => (
      <motion.div
        key={i}
        style={{
          position: 'absolute',
          inset: -16 - i * 10,
          borderRadius: '50%',
          border: '1.5px solid rgba(var(--accent-rgb),0.35)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, delay: i * 0.7, repeat: Infinity, ease: 'easeOut' }}
      />
    ))}
    <motion.div
      className={`orb${listening ? ' orb-listening' : ''}`}
      style={{ width: size, height: size }}
      animate={listening
        ? { scale: [1, 1.07, 1] }
        : { scale: [1, 1.03, 1] }
      }
      transition={{
        duration: listening ? 1 : 3.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </div>
);

/* ── Typing dots ── */
const TypingDots = () => (
  <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 2px' }}>
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}
        animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.3 }}
      />
    ))}
  </div>
);

type Panel = 'chat' | 'history';

const ChatScreen = () => {
  const chat = useChat();
  const { voiceSpeedRate, voiceGender } = useSettings();

  const [panel, setPanel] = useState<Panel>('chat');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (convId) {
      const conv = chat.conversations.find(c => c.id === convId);
      if (conv) setMsgs(conv.messages.map(m => ({
        id: m.id, role: m.role as any, text: m.content, timestamp: new Date(m.createdAt || Date.now())
      })));
    }
  }, [convId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');

    let cid = convId;
    if (!cid) {
      const conv = await chat.startConversation();
      cid = conv.id;
      setConvId(cid);
    }

    const userMsg: Msg = { id: Date.now() + 'u', role: 'user', text: trimmed, timestamp: new Date() };
    setMsgs(prev => [...prev, userMsg]);
    await chat.addMessage(cid, { role: 'user', content: trimmed });
    setLoading(true);

    try {
      const history = msgs
        .filter(m => m.role !== 'error')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.text }));
      const result = await askLiyan(trimmed, history);
      const aiMsg: Msg = { id: Date.now() + 'a', role: 'assistant', text: result.text, timestamp: new Date() };
      setMsgs(prev => [...prev, aiMsg]);
      chat.addMessage(cid, { role: 'assistant', content: result.text, provider_used: result.providerUsed });
      speakText(result.text, voiceSpeedRate, voiceGender);
    } catch (e: any) {
      setMsgs(prev => [...prev, { id: Date.now() + 'e', role: 'error', text: e.message || 'Something went wrong.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [loading, convId, msgs, chat, voiceSpeedRate, voiceGender]);

  const handleMic = () => {
    if (listening) { stopRef.current?.(); setListening(false); return; }
    setListening(true);
    const stop = startVoiceInput(
      t => setInput(t),
      () => {
        setListening(false);
        setInput(prev => { if (prev.trim()) handleSend(prev); return prev; });
      }
    );
    stopRef.current = stop;
  };

  const newChat = async () => {
    setMsgs([]);
    const conv = await chat.startConversation();
    setConvId(conv.id);
    setPanel('chat');
  };

  const selectConv = async (id: string) => {
    const conv = chat.conversations.find(c => c.id === id);
    if (!conv) return;
    setConvId(id);
    await chat.loadMessages(id);
    const loaded = chat.conversations.find(c => c.id === id);
    setMsgs((loaded?.messages ?? []).map(m => ({ id: m.id, role: m.role as any, text: m.content, timestamp: new Date(m.timestamp) })));
    setPanel('chat');
  };

  const handleReplay = (msg: Msg) => {
    setSpeakingId(msg.id);
    speakText(msg.text, voiceSpeedRate, voiceGender);
    setTimeout(() => setSpeakingId(null), msg.text.length * 60);
  };

  const isEmpty = msgs.length === 0;

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 'calc(68px + max(0px, env(safe-area-inset-bottom)))',
      overflow: 'hidden',
    }}>

      {/* ══ HEADER ══ */}
      <div style={{
        flexShrink: 0,
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 12,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(242,242,247,0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Title */}
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 1 }}>
            {panel === 'history' ? 'History' : 'Chat'}
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Liyan <span style={{ color: 'var(--accent)' }}>AI</span>
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setPanel(p => p === 'history' ? 'chat' : 'history')}
            style={{
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: panel === 'history' ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface)',
              border: panel === 'history' ? '1px solid rgba(var(--accent-rgb),0.3)' : '1px solid var(--border)',
              borderRadius: 10, cursor: 'pointer',
            }}
          >
            <Clock size={16} strokeWidth={1.5} style={{ color: panel === 'history' ? 'var(--accent)' : 'var(--text-muted)' }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={newChat}
            style={{
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, cursor: 'pointer',
            }}
          >
            <Plus size={16} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ══ HISTORY PANEL ══ */}
        {panel === 'history' ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{ flex: 1, overflowY: 'auto', padding: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {chat.conversations.length} Conversation{chat.conversations.length !== 1 ? 's' : ''}
              </p>
              {chat.conversations.length > 0 && (
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => chat.clearAll()}
                  style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>
                  Clear all
                </motion.button>
              )}
            </div>

            {chat.conversations.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 60 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={22} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>No history yet</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>Your conversations will appear here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chat.conversations.map((conv, i) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '13px 14px',
                      background: convId === conv.id ? 'rgba(var(--accent-rgb),0.07)' : 'var(--surface)',
                      border: `1px solid ${convId === conv.id ? 'rgba(var(--accent-rgb),0.25)' : 'var(--border)'}`,
                      borderRadius: 14,
                      cursor: 'pointer',
                    }}
                    onClick={() => selectConv(conv.id)}
                  >
                    {/* Accent dot */}
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: convId === conv.id ? 'var(--accent)' : 'var(--surface2)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.title}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {conv.messages.length} messages
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={e => { e.stopPropagation(); chat.deleteConversation(conv.id); if (convId === conv.id) { setMsgs([]); setConvId(null); } }}
                      style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, borderRadius: 8 }}
                    >
                      <Trash2 size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

        ) : (

          /* ══ CHAT PANEL ══ */
          <motion.div
            key="chat"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            {isEmpty ? (
              /* ── Empty state ── */
              <div style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '24px 20px 16px',
                gap: 0,
              }}>
                <ChatOrb listening={listening} size={130} />

                <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginTop: 20, letterSpacing: '-0.03em' }}>
                  As-salamu alaykum
                </p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 5, marginBottom: 24 }}>
                  Ask me anything about Islam
                </p>

                {/* Chip grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 340 }}>
                  {QUICK_CHIPS.map((chip, i) => (
                    <motion.button
                      key={chip}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSend(chip)}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        padding: '12px 12px',
                        fontSize: 13,
                        color: 'var(--text-soft)',
                        cursor: 'pointer',
                        fontWeight: 500,
                        textAlign: 'left',
                        lineHeight: 1.35,
                      }}
                    >
                      {chip}
                    </motion.button>
                  ))}
                </div>

                {/* Recent Chats */}
                {chat.conversations.length > 0 && (
                  <div style={{ marginTop: 16, width: '100%', maxWidth: 340 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Recent Chats</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {chat.conversations.slice(0, 3).map(conv => (
                        <motion.button
                          key={conv.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => selectConv(conv.id)}
                          style={{
                            width: '100%', height: 44,
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '0 12px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                            {conv.title}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--accent)', flexShrink: 0 }}>Open →</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mic hint */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMic}
                  style={{
                    marginTop: 20,
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: listening ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface)',
                    border: listening ? '1px solid rgba(var(--accent-rgb),0.35)' : '1px solid var(--border)',
                    borderRadius: 20, padding: '10px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {listening
                    ? <StopCircle size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                    : <Mic size={16} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                  }
                  <span style={{ fontSize: 13, color: listening ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 500 }}>
                    {listening ? 'Tap to stop' : 'Tap to speak'}
                  </span>
                  {listening && <TypingDots />}
                </motion.button>
              </div>

            ) : (
              /* ── Messages ── */
              <div style={{ padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {msgs.map((msg, i) => {
                  const showTime = i === 0 || (msgs[i - 1]?.role !== msg.role);
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    >
                      {msg.role === 'user' ? (
                        /* User bubble */
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                          <div style={{
                            background: 'var(--accent)',
                            color: 'var(--accent-text)',
                            borderRadius: '18px 18px 4px 18px',
                            padding: '10px 14px',
                            maxWidth: '78%',
                            fontSize: 15,
                            lineHeight: 1.5,
                            fontWeight: 500,
                          }}>
                            {msg.text}
                          </div>
                          {showTime && (
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', paddingRight: 4 }}>
                              {formatTime(msg.timestamp)}
                            </span>
                          )}
                        </div>

                      ) : msg.role === 'error' ? (
                        /* Error bubble */
                        <div style={{ display: 'flex' }}>
                          <div style={{ display: 'flex', maxWidth: '84%' }}>
                            <div style={{ width: 3, borderRadius: 2, background: '#EF4444', flexShrink: 0 }} />
                            <div style={{
                              background: 'rgba(239,68,68,0.07)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              borderLeft: 'none',
                              borderRadius: '0 16px 16px 4px',
                              padding: '11px 14px',
                              fontSize: 14,
                              color: '#EF4444',
                              lineHeight: 1.5,
                            }}>
                              {msg.text}
                            </div>
                          </div>
                        </div>

                      ) : (
                        /* AI bubble */
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5 }}>
                          {/* Sender label */}
                          {showTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 6 }}>
                              <div style={{
                                width: 18, height: 18, borderRadius: '50%',
                                background: 'rgba(var(--accent-rgb),0.15)',
                                border: '1px solid rgba(var(--accent-rgb),0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Liyan AI</span>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· {formatTime(msg.timestamp)}</span>
                            </div>
                          )}

                          <div style={{ display: 'flex', maxWidth: '86%' }}>
                            <div style={{ width: 3, borderRadius: 2, background: 'var(--accent)', flexShrink: 0, opacity: 0.7 }} />
                            <div style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderLeft: 'none',
                              borderRadius: '0 18px 18px 4px',
                              padding: '12px 14px',
                              fontSize: 15,
                              color: 'var(--text)',
                              lineHeight: 1.7,
                              whiteSpace: 'pre-wrap',
                            }}>
                              {msg.text}
                            </div>
                          </div>

                          {/* Replay button */}
                          <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={() => handleReplay(msg)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              background: speakingId === msg.id ? 'rgba(var(--accent-rgb),0.1)' : 'var(--surface)',
                              border: speakingId === msg.id ? '1px solid rgba(var(--accent-rgb),0.3)' : '1px solid var(--border)',
                              borderRadius: 20, padding: '4px 10px',
                              cursor: 'pointer', marginLeft: 6,
                              transition: 'all 0.18s',
                            }}
                          >
                            <Volume2 size={12} strokeWidth={1.5} style={{ color: speakingId === msg.id ? 'var(--accent)' : 'var(--text-muted)' }} />
                            <span style={{ fontSize: 11, color: speakingId === msg.id ? 'var(--accent)' : 'var(--text-muted)' }}>
                              {speakingId === msg.id ? 'Speaking…' : 'Replay'}
                            </span>
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Typing indicator */}
                {loading && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ paddingLeft: 6, marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid rgba(var(--accent-rgb),0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Liyan AI is thinking…</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: 3, borderRadius: 2, background: 'var(--accent)', flexShrink: 0, opacity: 0.5 }} />
                      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: 'none', borderRadius: '0 18px 18px 4px', padding: '14px 18px' }}>
                        <TypingDots />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={endRef} style={{ height: 8 }} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ INPUT BAR ══ */}
      {panel === 'chat' && (
        <div style={{
          flexShrink: 0,
          padding: '8px 16px 12px',
          background: 'rgba(242,242,247,0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid var(--border)',
        }}>
          {/* Listening banner */}
          <AnimatePresence>
            {listening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 32 }}
                exit={{ opacity: 0, height: 0 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, overflow: 'hidden' }}
              >
                <TypingDots />
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Listening…</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            minHeight: 46,
            background: 'var(--surface)',
            border: `1px solid ${listening ? 'rgba(var(--accent-rgb),0.4)' : 'var(--border-strong)'}`,
            borderRadius: 24,
            padding: '6px 6px 6px 16px',
            transition: 'border-color 0.2s',
          }}>
            {/* Mic */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleMic}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}
            >
              {listening
                ? <StopCircle size={19} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                : <Mic size={19} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
              }
            </motion.button>

            {/* Input */}
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
              placeholder={listening ? 'Listening…' : 'Ask Liyan...'}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 15, color: 'var(--text)', minWidth: 0, lineHeight: 1.4,
              }}
            />

            {/* Send */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface2)',
                border: input.trim() && !loading ? 'none' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.18s, border 0.18s',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
              }}
            >
              <ArrowUp size={16} strokeWidth={2.2} style={{ color: input.trim() && !loading ? 'var(--accent-text)' : 'var(--text-muted)' }} />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;