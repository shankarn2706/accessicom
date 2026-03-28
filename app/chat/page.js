'use client'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Volume2, AlertTriangle, CheckCircle, HelpCircle, Radio } from 'lucide-react'
import BrailleGrid from '../components/BrailleGrid'
import Navbar from '../components/Navbar'

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
      border: '1px solid rgba(239,68,68,0.5)',
      bg: 'rgba(239,68,68,0.08)',
      badge: 'bg-red-500 text-white',
      icon: AlertTriangle,
      iconColor: '#ef4444',
    },
    question: {
      border: '1px solid rgba(255,255,255,0.12)',
      bg: 'rgba(255,255,255,0.04)',
      badge: 'bg-white text-black',
      icon: HelpCircle,
      iconColor: 'rgba(255,255,255,0.5)',
    },
    normal: {
      border: '1px solid rgba(255,255,255,0.06)',
      bg: 'rgba(255,255,255,0.02)',
      badge: 'bg-white/10 text-white/60',
      icon: CheckCircle,
      iconColor: 'rgba(255,255,255,0.2)',
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

      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay muted loop playsInline
          className="w-full h-full object-cover"
          style={{ opacity: 0.25 }}
        >
          <source src="/chat-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.4), rgba(0,0,0,0.8))' }} />
      </div>

      {/* Emergency Banner */}
      <AnimatePresence>
        {emergency && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-[60] flex items-center gap-4 px-8 py-4"
            style={{ background: '#ef4444' }}
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
              <AlertTriangle size={18} className="text-white" />
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
              <Radio size={11} /> Live
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar active="Chat" />
      </div>

      {/* Mode bar */}
      <div
        className="relative z-10 flex items-center justify-between px-8 py-2.5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.4)' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-red-500"
          />
          <span className="text-white/30 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-playfair)' }}>
            {profile.disability_type} mode — general room
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05, color: 'white' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speak(messages.map(m => m.content).join('. '))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
            style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Volume2 size={11} /> Read All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, color: 'white' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
            style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            Switch Mode
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-8 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-white/10 text-4xl font-black tracking-widest uppercase mb-3">AccessiCom</div>
              <p className="text-white/20 text-sm" style={{ fontFamily: 'var(--font-playfair)' }}>
                No messages yet. Start the conversation.
              </p>
            </div>
          </div>
        )}
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
                  initial={{ opacity: 0, y: 16, x: isOwn ? 16 : -16 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className={`max-w-xl rounded-2xl p-5 ${isOwn ? 'ml-auto' : 'mr-auto'}`}
                  style={{ background: cfg.bg, border: cfg.border, backdropFilter: 'blur(12px)' }}
                >
                  {msg.intent === 'emergency' && (
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="flex items-center gap-2 mb-3"
                      style={{ color: '#ef4444' }}
                    >
                      <AlertTriangle size={11} />
                      <span className="text-xs tracking-widest uppercase font-black">Priority Emergency</span>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-playfair)' }}>
                      {msg.sender_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <IntentIcon size={10} style={{ color: cfg.iconColor }} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${cfg.badge}`}>
                        {msg.intent}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-playfair)' }}>
                        {msg.sentiment} · {Math.round(msg.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <p
                    className={`text-white leading-relaxed mb-3 ${profile.disability_type === 'deafblind' ? 'text-xl font-bold' : 'text-sm'}`}
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
                            animate={{ scaleY: [1, 2.5, 1] }}
                            transition={{ duration: 0.5, repeat: 2, delay: i * 0.1 }}
                            className="w-0.5 rounded-full"
                            style={{ height: '8px', background: 'rgba(255,255,255,0.2)' }}
                          />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-playfair)' }}>
                        Visual delivery confirmed
                      </span>
                    </div>
                  )}

                  <div
                    className="flex items-center gap-4 mt-3 pt-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, color: 'white' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => speak(msg.content)}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: 'rgba(255,255,255,0.15)' }}
                    >
                      <Volume2 size={10} /> Speak
                    </motion.button>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.08)', fontFamily: 'var(--font-playfair)' }}>
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
      <div
        className="relative z-10 px-8 py-5 border-t"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={
              profile.disability_type === 'blind' ? 'Type or use microphone...' :
              profile.disability_type === 'mute' ? 'Use microphone to speak...' :
              'Type a message...'
            }
            className="flex-1 bg-transparent text-white text-sm py-3 focus:outline-none"
            style={{
              fontFamily: 'var(--font-playfair)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              caretColor: '#ef4444',
            }}
          />
          <motion.button
            onClick={startListening}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              background: listening ? '#ef4444' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${listening ? '#ef4444' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {listening ? (
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                <MicOff size={13} className="text-white" />
              </motion.div>
            ) : (
              <Mic size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
            )}
          </motion.button>
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim()}
            whileHover={{ scale: 1.04, backgroundColor: input.trim() ? '#ef4444' : undefined }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 flex-shrink-0"
            style={{
              background: input.trim() ? 'white' : 'rgba(255,255,255,0.04)',
              color: input.trim() ? 'black' : 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Send size={12} /> Send
          </motion.button>
        </div>
      </div>
    </main>
  )
}