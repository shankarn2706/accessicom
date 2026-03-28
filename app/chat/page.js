'use client'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Chat() {
  const { user } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [profile, setProfile] = useState(null)
  const [listening, setListening] = useState(false)
  const [emergency, setEmergency] = useState(null)
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { if (user) fetchProfile() }, [user])

  useEffect(() => {
    fetchMessages()
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, payload.new])
        if (payload.new.intent === 'emergency') {
          setEmergency(payload.new.content)
          setTimeout(() => setEmergency(null), 6000)
          triggerEmergencyAlert(payload.new.content)
        }
        if (profile?.disability_type === 'blind' || profile?.disability_type === 'mute') {
          speak(payload.new.content)
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [profile])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!data) router.push('/onboarding')
    else setProfile(data)
  }

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').eq('room_id', 'general').order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const classifyMessage = (text) => {
    const lower = text.toLowerCase()
    const emergencyWords = ['help', 'fire', 'danger', 'emergency', 'police', 'ambulance', 'bleeding', 'trapped', 'accident', 'injured', 'pain', 'attack']
    const questionWords = ['what', 'where', 'when', 'how', 'why', 'who', 'are you', 'do you', 'can you', 'shall', 'is it', 'will you']
    if (emergencyWords.some(w => lower.includes(w))) return { intent: 'emergency', confidence: 0.95 }
    if (questionWords.some(w => lower.includes(w))) return { intent: 'question', confidence: 0.85 }
    return { intent: 'normal', confidence: 0.90 }
  }

  const analyzeSentiment = (text) => {
    const lower = text.toLowerCase()
    const positive = ['good', 'great', 'thanks', 'fine', 'okay', 'hello', 'hi', 'morning', 'happy', 'love', 'nice']
    const negative = ['bad', 'hurt', 'pain', 'scared', 'help', 'danger', 'emergency', 'sad', 'angry', 'hate']
    if (negative.some(w => lower.includes(w))) return 'negative'
    if (positive.some(w => lower.includes(w))) return 'positive'
    return 'neutral'
  }

  const getUrgency = (intent) => {
    if (intent === 'emergency') return 10
    if (intent === 'question') return 5
    return 1
  }

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  const triggerEmergencyAlert = (text) => {
    if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 300])
    speak('Emergency alert: ' + text)
  }

  const toBraille = (text) => {
    const map = {a:'⠁',b:'⠃',c:'⠉',d:'⠙',e:'⠑',f:'⠋',g:'⠛',h:'⠓',i:'⠊',j:'⠚',k:'⠅',l:'⠇',m:'⠍',n:'⠝',o:'⠕',p:'⠏',q:'⠟',r:'⠗',s:'⠎',t:'⠞',u:'⠥',v:'⠧',w:'⠺',x:'⠭',y:'⠽',z:'⠵',' ':'⠀'}
    return text.toLowerCase().split('').map(c => map[c] || c).join('')
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    const { intent, confidence } = classifyMessage(input)
    const sentiment = analyzeSentiment(input)
    const urgency = getUrgency(intent)
    await supabase.from('messages').insert({
      room_id: 'general',
      sender_id: user.id,
      sender_name: user.fullName || user.emailAddresses[0].emailAddress,
      content: input.trim(),
      intent, confidence, sentiment, urgency,
    })
    setInput('')
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return alert('Use Microsoft Edge for speech recognition')
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onstart = () => setListening(true)
    recognition.onresult = (e) => setInput(e.results[0][0].transcript)
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  const modeColors = {
    general: 'from-blue-950 via-indigo-900 to-purple-900',
    blind: 'from-gray-950 via-gray-900 to-gray-800',
    deaf: 'from-blue-950 via-blue-900 to-cyan-900',
    mute: 'from-indigo-950 via-purple-900 to-pink-900',
    deafblind: 'from-black via-gray-950 to-black',
  }

  const intentConfig = {
    emergency: { border: 'border-red-500', bg: 'bg-red-500/10', badge: 'bg-red-500 text-white', glow: 'shadow-red-500/30' },
    question: { border: 'border-yellow-400', bg: 'bg-yellow-400/10', badge: 'bg-yellow-400 text-black', glow: 'shadow-yellow-400/20' },
    normal: { border: 'border-white/10', bg: 'bg-white/5', badge: 'bg-green-500 text-white', glow: 'shadow-black/20' },
  }

  if (!profile) return (
    <div className="min-h-screen bg-[#020818] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
      />
    </div>
  )

  const bg = modeColors[profile.disability_type] || modeColors.general

  return (
    <main className={`min-h-screen flex flex-col bg-gradient-to-br ${bg} relative overflow-hidden`}>

      {/* Background orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Emergency Banner */}
      <AnimatePresence>
        {emergency && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-6 py-4 flex items-center gap-3 shadow-2xl"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-2xl"
            >
              🚨
            </motion.span>
            <div>
              <div className="font-black text-lg">EMERGENCY ALERT</div>
              <div className="text-red-100 text-sm">{emergency}</div>
            </div>
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="ml-auto text-red-200 text-sm"
            >
              ● LIVE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-black/30 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center relative z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-black"
          >
            A
          </motion.div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight">AccessiCom</h1>
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full inline-block"
              />
              <span className="text-green-400 text-xs font-medium capitalize">
                {profile.disability_type} mode · Live
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speak(messages.map(m => m.content).join('. '))}
            className="text-blue-300 hover:text-white text-sm border border-blue-400/30 hover:border-blue-400 px-4 py-2 rounded-full backdrop-blur transition-all"
          >
            🔊 Read All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/onboarding')}
            className="text-blue-300 hover:text-white text-sm border border-blue-400/30 hover:border-blue-400 px-4 py-2 rounded-full backdrop-blur transition-all"
          >
            ⚙️ Mode
          </motion.button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 relative z-10">
        <AnimatePresence initial={false}>
          {[...messages]
            .sort((a, b) => b.urgency - a.urgency || new Date(a.created_at) - new Date(b.created_at))
            .map((msg, i) => {
              const cfg = intentConfig[msg.intent] || intentConfig.normal
              const isOwn = msg.sender_id === user?.id
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: isOwn ? 50 : -50, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`border rounded-2xl p-4 shadow-lg ${cfg.border} ${cfg.bg} ${cfg.glow} ${msg.intent === 'emergency' ? 'shadow-red-500/40 shadow-lg' : ''} max-w-2xl ${isOwn ? 'ml-auto' : 'mr-auto'}`}
                >
                  {msg.intent === 'emergency' && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="text-red-400 font-black text-xs mb-2 flex items-center gap-1"
                    >
                      🚨 EMERGENCY — PRIORITY MESSAGE
                    </motion.div>
                  )}

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-200 text-xs font-bold">{msg.sender_name}</span>
                    <div className="flex gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${cfg.badge}`}>
                        {msg.intent}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/20 text-white/60">
                        {msg.sentiment}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/40">
                        {Math.round(msg.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <p className={`text-white mb-3 ${profile.disability_type === 'deafblind' ? 'text-2xl font-bold' : 'text-base'}`}>
                    {msg.content}
                  </p>

                  {/* Braille output */}
                  {profile.disability_type === 'deafblind' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 mb-3"
                    >
                      <div className="text-yellow-300 text-xs font-bold mb-1">⠿ BRAILLE OUTPUT</div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.05 }}
                        className="text-yellow-200 text-lg tracking-widest font-mono"
                      >
                        {toBraille(msg.content)}
                      </motion.p>
                    </motion.div>
                  )}

                  {/* Deaf visual indicator */}
                  {(profile.disability_type === 'deaf') && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ scaleY: [1, 2, 1] }}
                            transition={{ duration: 0.5, repeat: 3, delay: i * 0.1 }}
                            className="w-1 bg-blue-400 rounded-full"
                            style={{ height: '12px' }}
                          />
                        ))}
                      </div>
                      <span className="text-blue-300 text-xs">Visual delivery confirmed</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => speak(msg.content)}
                      className="text-xs text-blue-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      🔊 Speak
                    </motion.button>
                    <span className="text-xs text-white/20">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              )
            })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 py-4 relative z-10"
      >
        <div className="flex gap-3 max-w-4xl mx-auto">
          <motion.input
            value={input}
            onChange={e => { setInput(e.target.value); setTyping(true); setTimeout(() => setTyping(false), 1000) }}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={
              profile.disability_type === 'blind' ? '🦯 Type or use microphone...' :
              profile.disability_type === 'deaf' ? '🤟 Type your message...' :
              profile.disability_type === 'mute' ? '🎙️ Use microphone to speak...' :
              'Type a message...'
            }
            className="flex-1 bg-white/10 text-white placeholder-white/30 border border-white/20 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all"
          />
          <motion.button
            onClick={startListening}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-3 rounded-2xl font-bold transition-all ${listening ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-white/10 hover:bg-white/20 border border-white/20'} text-white`}
          >
            {listening ? (
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🎙️
              </motion.span>
            ) : '🎙️'}
          </motion.button>
          <motion.button
            onClick={sendMessage}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-8 py-3.5 rounded-2xl transition-all disabled:opacity-40"
          >
            Send ↗
          </motion.button>
        </div>
      </motion.div>
    </main>
  )
}