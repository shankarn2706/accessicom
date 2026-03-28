'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    fetchData()
  }, [])

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

  const intentBadge = (intent) => {
    if (intent === 'emergency') return 'bg-red-500 text-white'
    if (intent === 'question') return 'bg-yellow-400 text-black'
    return 'bg-green-500 text-white'
  }

  const sentimentBadge = (sentiment) => {
    if (sentiment === 'positive') return 'bg-green-500/20 text-green-300 border-green-500/30'
    if (sentiment === 'negative') return 'bg-red-500/20 text-red-300 border-red-500/30'
    return 'bg-white/10 text-white/50 border-white/10'
  }

  const disabilityColor = (type) => {
    const colors = {
      general: 'bg-green-500/20 text-green-300',
      blind: 'bg-purple-500/20 text-purple-300',
      deaf: 'bg-blue-500/20 text-blue-300',
      mute: 'bg-pink-500/20 text-pink-300',
      deafblind: 'bg-yellow-500/20 text-yellow-300',
    }
    return colors[type] || colors.general
  }

  return (
    <main className="min-h-screen bg-[#020818] text-white relative overflow-hidden">

      {/* Background */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Header */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/30 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center relative z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center font-black text-lg">
            A
          </div>
          <div>
            <h1 className="font-black text-xl">AccessiCom Admin</h1>
            <p className="text-white/40 text-xs">System Dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            className="border border-white/20 hover:border-white/40 px-4 py-2 rounded-full text-sm text-white/70 hover:text-white transition-all"
          >
            🔄 Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/chat')}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full text-sm font-bold transition-all"
          >
            → Back to Chat
          </motion.button>
        </div>
      </motion.div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Messages', value: stats.total, color: 'from-purple-500 to-blue-500', icon: '💬' },
            { label: 'Emergency', value: stats.emergency, color: 'from-red-500 to-orange-500', icon: '🚨' },
            { label: 'Questions', value: stats.question, color: 'from-yellow-400 to-orange-400', icon: '❓' },
            { label: 'Normal', value: stats.normal, color: 'from-green-500 to-teal-500', icon: '✅' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur"
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`text-4xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}
              >
                {s.value}
              </motion.div>
              <div className="text-white/50 text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['logs', 'users', 'ml'].map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all ${
                tab === t
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
              }`}
            >
              {t === 'logs' ? '📋 Message Logs' : t === 'users' ? '👥 Users' : '🧠 ML Stats'}
            </motion.button>
          ))}
        </div>

        {/* Message Logs Tab */}
        <AnimatePresence mode="wait">
          {tab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {messages.length === 0 && (
                <div className="text-center text-white/30 py-20">No messages yet</div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur hover:bg-white/8 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white/60 text-sm font-semibold">{msg.sender_name}</span>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${intentBadge(msg.intent)}`}>
                        {msg.intent}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${sentimentBadge(msg.sentiment)}`}>
                        {msg.sentiment}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                        {Math.round(msg.confidence * 100)}% confidence
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                        urgency: {msg.urgency}
                      </span>
                    </div>
                  </div>
                  <p className="text-white">{msg.content}</p>
                  <p className="text-white/30 text-xs mt-2">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              {profiles.length === 0 && (
                <div className="text-center text-white/30 py-20 col-span-2">No users yet</div>
              )}
              {profiles.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center font-bold">
                      {(p.full_name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-bold">{p.full_name || 'Unknown'}</div>
                      <div className="text-white/40 text-xs">{new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${disabilityColor(p.disability_type)}`}>
                    {p.disability_type}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ML Stats Tab */}
          {tab === 'ml' && (
            <motion.div
              key="ml"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
                <h3 className="font-black text-lg mb-4">🧠 ML Pipeline Info</h3>
                {[
                  { label: 'Intent Classifier', value: 'Rule-based + Keyword Matching', status: 'Active' },
                  { label: 'Sentiment Analyzer', value: 'Lexicon-based (Positive/Negative/Neutral)', status: 'Active' },
                  { label: 'Urgency Scorer', value: 'Intent-weighted (1-10 scale)', status: 'Active' },
                  { label: 'Confidence Score', value: 'Per-classification probability', status: 'Active' },
                  { label: 'Emergency Keywords', value: 'help, fire, danger, ambulance, bleeding...', status: 'Active' },
                  { label: 'Question Keywords', value: 'what, where, when, how, why, who...', status: 'Active' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between items-center py-3 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <div className="text-white font-semibold text-sm">{item.label}</div>
                      <div className="text-white/40 text-xs mt-0.5">{item.value}</div>
                    </div>
                    <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
                      {item.status}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Intent distribution bar */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
                <h3 className="font-black text-lg mb-4">📊 Intent Distribution</h3>
                {[
                  { label: 'Normal', count: stats.normal, total: stats.total, color: 'bg-green-500' },
                  { label: 'Question', count: stats.question, total: stats.total, color: 'bg-yellow-400' },
                  { label: 'Emergency', count: stats.emergency, total: stats.total, color: 'bg-red-500' },
                ].map((item, i) => (
                  <div key={item.label} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70">{item.label}</span>
                      <span className="text-white/50">{item.count} / {item.total}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: item.total > 0 ? `${(item.count / item.total) * 100}%` : '0%' }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.2, ease: 'easeOut' }}
                        className={`h-full ${item.color} rounded-full`}
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