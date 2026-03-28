'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { AlertTriangle, HelpCircle, CheckCircle, Users, MessageSquare, Brain, ArrowLeft, RefreshCw } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Admin() {
  const [messages, setMessages] = useState([])
  const [profiles, setProfiles] = useState([])
  const [tab, setTab] = useState('logs')
  const [stats, setStats] = useState({ total: 0, emergency: 0, question: 0, normal: 0 })
  const router = useRouter()

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

  const statCards = [
    { label: 'Total Messages', value: stats.total, icon: MessageSquare, color: '#ffffff' },
    { label: 'Emergency', value: stats.emergency, icon: AlertTriangle, color: '#ef4444' },
    { label: 'Questions', value: stats.question, icon: HelpCircle, color: '#ffffff' },
    { label: 'Normal', value: stats.normal, icon: CheckCircle, color: 'rgba(255,255,255,0.3)' },
  ]

  return (
    <main className="min-h-screen bg-black text-white" style={{ fontFamily: 'var(--font-syne)' }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-5 border-b sticky top-0 z-40"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => router.push('/chat')}
            className="flex items-center gap-2 text-white/30 hover:text-white text-xs transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </motion.button>
          <div className="w-px h-4 bg-white/10" />
          <div className="font-black text-lg tracking-widest uppercase">Admin Panel</div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotate: 180 }}
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/30 hover:text-white transition-all"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RefreshCw size={12} /> Refresh
        </motion.button>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-px bg-white/06 rounded-2xl overflow-hidden mb-8">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black p-8 group hover:bg-white/02 transition-all"
            >
              <s.icon size={16} style={{ color: s.color }} className="mb-4 opacity-50" />
              <div
                className="font-black mb-1"
                style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontFamily: 'var(--font-syne)', color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-white/30 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-playfair)' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-full w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
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
              <t.icon size={12} /> {t.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">

          {tab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              {messages.length === 0 && (
                <div className="text-center text-white/20 py-20 text-sm" style={{ fontFamily: 'var(--font-playfair)' }}>
                  No messages yet
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-6 p-5 rounded-xl hover:bg-white/02 transition-all group"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div className="flex-shrink-0 mt-1">
                    {msg.intent === 'emergency' && <AlertTriangle size={14} className="text-red-500" />}
                    {msg.intent === 'question' && <HelpCircle size={14} className="text-white/40" />}
                    {msg.intent === 'normal' && <CheckCircle size={14} className="text-white/20" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm mb-1 truncate" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {msg.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-white/20">
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
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: msg.intent === 'emergency' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                        color: msg.intent === 'emergency' ? '#ef4444' : 'rgba(255,255,255,0.3)',
                        border: `1px solid ${msg.intent === 'emergency' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {msg.intent}
                    </span>
                    <span className="text-white/10 text-xs" style={{ fontFamily: 'var(--font-playfair)' }}>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-3 gap-4"
            >
              {profiles.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center font-black text-red-400 mb-4"
                  >
                    {(p.full_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="font-bold text-sm text-white mb-1">{p.full_name || 'Unknown'}</div>
                  <div className="text-white/20 text-xs mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-bold tracking-wide capitalize"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-red-500 text-xs tracking-[0.3em] uppercase font-medium mb-6">Pipeline Info</div>
                {[
                  { label: 'Intent Classifier', value: 'Keyword + Rule-based' },
                  { label: 'Sentiment Analyzer', value: 'Lexicon-based' },
                  { label: 'Urgency Scorer', value: 'Intent-weighted 1–10' },
                  { label: 'Confidence Score', value: 'Per-classification' },
                  { label: 'Emergency Keywords', value: 'help, fire, danger...' },
                  { label: 'Question Keywords', value: 'what, where, when...' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex justify-between items-center py-3 border-b last:border-0"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <span className="text-white/60 text-sm font-medium">{item.label}</span>
                    <span className="text-white/20 text-xs" style={{ fontFamily: 'var(--font-playfair)' }}>{item.value}</span>
                  </motion.div>
                ))}
              </div>

              <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-red-500 text-xs tracking-[0.3em] uppercase font-medium mb-6">Intent Distribution</div>
                {[
                  { label: 'Normal', count: stats.normal, color: 'rgba(255,255,255,0.6)' },
                  { label: 'Question', count: stats.question, color: 'rgba(255,255,255,0.3)' },
                  { label: 'Emergency', count: stats.emergency, color: '#ef4444' },
                ].map((item, i) => (
                  <div key={item.label} className="mb-6 last:mb-0">
                    <div className="flex justify-between text-xs mb-2">
                      <span style={{ color: item.color }}>{item.label}</span>
                      <span className="text-white/20" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {item.count} / {stats.total}
                      </span>
                    </div>
                    <div className="h-px bg-white/06 rounded-full overflow-hidden">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}