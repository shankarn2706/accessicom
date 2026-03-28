'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, HelpCircle, CheckCircle, Users, MessageSquare, Brain, RefreshCw } from 'lucide-react'
import Navbar from '../components/Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Admin() {
  const [messages, setMessages] = useState([])
  const [profiles, setProfiles] = useState([])
  const [tab, setTab] = useState('logs')
  const [stats, setStats] = useState({ total: 0, emergency: 0, question: 0, normal: 0 })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    const { data: profs } = await supabase.from('profiles').select('*')
    setMessages(msgs || [])
    setProfiles(profs || [])
    if (msgs) {
      setStats({
        total: msgs.length,
        emergency: msgs.filter(m => m.intent === 'emergency').length,
        question: msgs.filter(m => m.intent === 'question').length,
        normal: msgs.filter(m => m.intent === 'normal').length,
      })
    }
  }

  const tabs = [
    { id: 'logs', label: 'Message Logs', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'ml', label: 'ML Pipeline', icon: Brain },
  ]

  return (
    <main className="min-h-screen bg-black text-white" style={{ fontFamily: 'var(--font-syne)' }}>

      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay muted loop playsInline
          className="w-full h-full object-cover"
          style={{ opacity: 0.15 }}
        >
          <source src="/chat-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)' }} />
      </div>

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar active="Admin" />
      </div>

      <div className="relative z-10 px-8 py-10 max-w-7xl mx-auto">

        {/* Page title + refresh */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-red-500 text-xs tracking-[0.3em] uppercase font-medium mb-2">Dashboard</div>
            <h1
              className="font-black uppercase tracking-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontFamily: 'var(--font-syne)' }}
            >
              Admin Panel
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
          >
            <RefreshCw size={12} /> Refresh
          </motion.button>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-4 mb-10 rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)' }}
        >
          {[
            { label: 'Total Messages', value: stats.total, icon: MessageSquare, color: '#ffffff' },
            { label: 'Emergency', value: stats.emergency, icon: AlertTriangle, color: '#ef4444' },
            { label: 'Questions', value: stats.question, icon: HelpCircle, color: 'rgba(255,255,255,0.6)' },
            { label: 'Normal', value: stats.normal, icon: CheckCircle, color: 'rgba(255,255,255,0.3)' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 border-r last:border-0 hover:bg-white/02 transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <s.icon size={14} style={{ color: s.color, opacity: 0.4 }} className="mb-4" />
              <div
                className="font-black mb-1"
                style={{ fontSize: '44px', lineHeight: 1, color: s.color, fontFamily: 'var(--font-syne)' }}
              >
                {s.value}
              </div>
              <div
                className="text-xs tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-playfair)' }}
              >
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-8 p-1 rounded-full w-fit"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {tabs.map((t) => (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200"
              style={{
                background: tab === t.id ? 'white' : 'transparent',
                color: tab === t.id ? 'black' : 'rgba(255,255,255,0.3)',
              }}
            >
              <t.icon size={11} /> {t.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {tab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-2"
            >
              {messages.length === 0 && (
                <div className="text-center py-20 text-sm" style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-playfair)' }}>
                  No messages yet
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  className="flex items-start gap-5 p-5 rounded-xl transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {msg.intent === 'emergency' && <AlertTriangle size={13} style={{ color: '#ef4444' }} />}
                    {msg.intent === 'question' && <HelpCircle size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                    {msg.intent === 'normal' && <CheckCircle size={13} style={{ color: 'rgba(255,255,255,0.15)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm mb-1.5" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {msg.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-playfair)' }}>
                      <span>{msg.sender_name}</span>
                      <span>·</span>
                      <span>{msg.sentiment}</span>
                      <span>·</span>
                      <span>{Math.round(msg.confidence * 100)}% confidence</span>
                      <span>·</span>
                      <span>urgency {msg.urgency}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-bold"
                      style={{
                        background: msg.intent === 'emergency' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                        color: msg.intent === 'emergency' ? '#ef4444' : 'rgba(255,255,255,0.25)',
                        border: `1px solid ${msg.intent === 'emergency' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {msg.intent}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.1)', fontFamily: 'var(--font-playfair)' }}>
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="grid grid-cols-3 gap-4"
            >
              {profiles.length === 0 && (
                <div className="col-span-3 text-center py-20 text-sm" style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-playfair)' }}>
                  No users yet
                </div>
              )}
              {profiles.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mb-4"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                  >
                    {(p.full_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="font-bold text-sm text-white mb-1">{p.full_name || 'Unknown'}</div>
                  <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-playfair)' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium capitalize"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    {p.disability_type}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === 'ml' && (
            <motion.div
              key="ml"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="grid grid-cols-2 gap-4"
            >
              <div
                className="p-8 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
              >
                <div className="text-red-500 text-xs tracking-[0.3em] uppercase font-medium mb-6">Pipeline Info</div>
                {[
                  { label: 'Intent Classifier', value: 'Keyword + Rule-based' },
                  { label: 'Sentiment Analyzer', value: 'Lexicon-based' },
                  { label: 'Urgency Scorer', value: 'Intent-weighted 1–10' },
                  { label: 'Confidence Score', value: 'Per-classification' },
                  { label: 'Emergency Keywords', value: 'help, fire, danger...' },
                  { label: 'Question Keywords', value: 'what, where, when...' },
                  { label: 'Fallback Rule', value: 'Override < 70% confidence' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex justify-between items-center py-3 border-b last:border-0"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <span className="text-white/60 text-sm">{item.label}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-playfair)' }}>
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div
                className="p-8 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
              >
                <div className="text-red-500 text-xs tracking-[0.3em] uppercase font-medium mb-6">Intent Distribution</div>
                {[
                  { label: 'Normal', count: stats.normal, color: 'rgba(255,255,255,0.5)' },
                  { label: 'Question', count: stats.question, color: 'rgba(255,255,255,0.3)' },
                  { label: 'Emergency', count: stats.emergency, color: '#ef4444' },
                ].map((item, i) => (
                  <div key={item.label} className="mb-7 last:mb-0">
                    <div className="flex justify-between text-xs mb-2">
                      <span style={{ color: item.color, fontFamily: 'var(--font-syne)', fontWeight: 700 }}>{item.label}</span>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-playfair)' }}>
                        {item.count} / {stats.total}
                      </span>
                    </div>
                    <div className="h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: stats.total > 0 ? `${(item.count / stats.total) * 100}%` : '0%' }}
                        transition={{ duration: 1.2, delay: 0.3 + i * 0.2, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="text-red-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">Model Status</div>
                  {['Intent Classifier', 'Sentiment Analyzer', 'Urgency Scorer'].map((m, i) => (
                    <div key={m} className="flex items-center justify-between py-2">
                      <span className="text-white/40 text-xs" style={{ fontFamily: 'var(--font-playfair)' }}>{m}</span>
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                          className="w-1.5 h-1.5 rounded-full bg-green-400"
                        />
                        <span className="text-xs text-green-400 font-medium">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}