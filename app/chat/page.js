'use client'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Volume2, Settings, LayoutDashboard, AlertTriangle, CheckCircle, HelpCircle, Radio } from 'lucide-react'
import BrailleGrid from '../components/BrailleGrid'

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
    const emergencyWords = ['help', 'fire', 'danger', 'emergency', 'police', 'ambulance', 'bleeding', 'trapped', 'accident', 'injured', 'attack']
    const questionWords = ['what', 'where', 'when', 'how', 'why', 'who', 'are you', 'do you', 'can you', 'shall', 'is it', 'will you']
    if (emergencyWords.some(w => lower.includes(w))) return { intent: 'emergency', confidence: 0.95 }
    if (questionWords.some(w => lower.includes(w))) return { intent: 'question', confidence: 0.85 }
    return { intent: 'normal', confidence: 0.90 }
  }

  const analyzeSentiment = (text) => {
    const lower = text.toLowerCase()
    const positive = ['good', 'great', 'thanks', 'fine', 'okay', 'hello', 'hi', 'morning', 'happy', 'love', 'nice']
    const negative = ['bad', 'hurt', 'pain', 'scared', 'help', 'danger', 'emergency', 'sad', 'angry']
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
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  }

  const triggerEmergencyAlert = (text) => {
    if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 300])
    speak('Emergency alert: ' + text)
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
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Use Microsoft Edge for speech recognition')
    const r = new SR()
    r.lang = 'en-US'
    r.onstart = () => setListening(true)
    r.onresult = (e) => setInput(e.results[0][0].transcript)
    r.onend = () => setListening(false)
    r.start()
  }

  const intentConfig = {
    emergency: {
      border: 'border-red-500/50',
      bg: 'rgba(239,68,68,0.05)',
      badge: 'bg-red-500 text-white',
      icon: AlertTriangle,
      iconColor: '#ef4444',
    },
    question: {
      border: 'border-white/10',
      bg: 'rgba(255,255,255,0.02)',
      badge: 'bg-white text-black',
      icon: HelpCircle,
      iconColor: '#ffffff',
    },
    normal: {
      border: 'border-white/06',
      bg: 'rgba(255,255,255,0.01)',
      badge: 'bg-white/10 text-white',
      icon: CheckCircle,
      iconColor: 'rgba(255,255,255,0.3)',
    },
  }

  if (!profile) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full"
      />
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white flex flex-col" style={{ fontFamily: 'var(--font-syne)' }}>

      {/* Emergency Banner */}
      <AnimatePresence>
        {emergency && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-8 py-4"
            style={{ background: '#ef4444', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <AlertTriangle size={20} className="text-white" />
            </motion.div>
            <div>
              <div className="font-black text-sm tracking-widest uppercase">Emergency Alert</div>
              <div className="text-red-100 text-xs mt-0.5" style={{ fontFamily: 'var(--font-playfair)' }}>{emergency}</div>
            </div>
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="ml-auto flex items-center gap-2 text-red-100 text-xs tracking-widest uppercase"
            >
              <Radio size={12} /> Live
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 40 }}
      >
        <div className="flex items-center gap-4">
          <div>
            <div className="font-black text-lg tracking-widest uppercase">AccessiCom</div>
            <div className="flex items-center gap-2 mt-0.5">
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-red-500"
              />
              <span className="text-white/30 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-playfair)' }}>
                {profile.disability_type} mode — live
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speak(messages.map(m => m.content).join('. '))}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/40 hover:text-white transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Volume2 size={13} /> Read All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/40 hover:text-white transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Settings size={13} /> Mode
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/40 hover:text-white transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <LayoutDashboard size={13} /> Admin
          </motion.button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-3">
        <AnimatePresence initial={false}>
          {[...messages]
            .sort((a, b) => b.urgency - a.urgency || new Date(a.created_at) - new Date(b.created_at))
            .map((msg) => {
              const cfg = intentConfig[msg.intent] || intentConfig.normal
              const isOwn = msg.sender_id === user?.id
              const IntentIcon = cfg.icon
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, x: isOwn ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`max-w-2xl border rounded-2xl p-5 ${cfg.border} ${isOwn ? 'ml-auto' : 'mr-auto'}`}
                  style={{ background: cfg.bg }}
                >
                  {msg.intent === 'emergency' && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex items-center gap-2 mb-3 text-red-400"
                    >
                      <AlertTriangle size={12} />
                      <span className="text-xs tracking-widest uppercase font-bold">Priority Emergency</span>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/30 text-xs tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {msg.sender_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <IntentIcon size={11} style={{ color: cfg.iconColor }} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold tracking-wide ${cfg.badge}`}>
                        {msg.intent}
                      </span>
                      <span className="text-xs text-white/20" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {msg.sentiment}
                      </span>
                      <span className="text-xs text-white/20">
                        {Math.round(msg.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <p
                    className={`text-white leading-relaxed mb-3 ${profile.disability_type === 'deafblind' ? 'text-2xl font-bold' : 'text-base'}`}
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    {msg.content}
                  </p>

                  {profile.disability_type === 'deafblind' && (
                    <BrailleGrid text={msg.content} />
                  )}

                  {profile.disability_type === 'deaf' && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-0.5 items-end">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ scaleY: [1, 2, 1] }}
                            transition={{ duration: 0.6, repeat: 2, delay: i * 0.1 }}
                            className="w-0.5 bg-white/30 rounded-full"
                            style={{ height: '10px' }}
                          />
                        ))}
                      </div>
                      <span className="text-white/20 text-xs" style={{ fontFamily: 'var(--font-playfair)' }}>
                        Visual delivery confirmed
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => speak(msg.content)}
                      className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white transition-colors"
                    >
                      <Volume2 size={11} /> Speak
                    </motion.button>
                    <span className="text-white/10 text-xs" style={{ fontFamily: 'var(--font-playfair)' }}>
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
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-8 py-6 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={
                profile.disability_type === 'blind' ? 'Type or use microphone...' :
                profile.disability_type === 'mute' ? 'Use microphone to speak...' :
                'Type a message...'
              }
              className="w-full bg-transparent text-white placeholder-white/20 text-sm py-3.5 px-0 focus:outline-none"
              style={{
                fontFamily: 'var(--font-playfair)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>
          <motion.button
            onClick={startListening}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{
              background: listening ? '#ef4444' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {listening ? (
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                <MicOff size={14} className="text-white" />
              </motion.div>
            ) : (
              <Mic size={14} className="text-white/40" />
            )}
          </motion.button>
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim()}
            whileHover={{ scale: 1.05, backgroundColor: input.trim() ? '#ef4444' : undefined }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-20"
            style={{ background: input.trim() ? 'white' : 'rgba(255,255,255,0.06)', color: input.trim() ? 'black' : 'white' }}
          >
            <Send size={14} /> Send
          </motion.button>
        </div>
      </motion.div>
    </main>
  )
}