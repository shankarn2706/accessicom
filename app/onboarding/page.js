'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EarOff, MicOff, Hand, User, ArrowRight, Check } from 'lucide-react'
import Navbar from '../components/Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const types = [
  { id: 'general', icon: User, label: 'General User', desc: 'Standard mode with no accessibility modifications applied.' },
  { id: 'blind', icon: Eye, label: 'Blind', desc: 'All incoming messages are automatically read aloud via text-to-speech.' },
  { id: 'deaf', icon: EarOff, label: 'Deaf', desc: 'Visual-only alerts with animated indicators and icon-based UI.' },
  { id: 'mute', icon: MicOff, label: 'Mute', desc: 'Speech input via microphone with full text output delivery.' },
  { id: 'deafblind', icon: Hand, label: 'Deafblind', desc: 'Animated Braille dot grid output with high contrast interface.' },
]

export default function Onboarding() {
  const { user } = useUser()
  const router = useRouter()
  const [selected, setSelected] = useState('general')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.fullName || user.emailAddresses[0].emailAddress,
        disability_type: selected,
      }, { onConflict: 'id' })
    } catch (err) { console.error(err) }
    router.push('/chat')
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col" style={{ fontFamily: 'var(--font-syne)' }}>

      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay muted loop playsInline
          className="w-full h-full object-cover"
          style={{ opacity: 0.2 }}
        >
          <source src="/chat-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.9))' }} />
      </div>

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar active="Home" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="text-red-500 text-xs tracking-[0.3em] uppercase font-medium mb-3">Setup</div>
            <h1
              className="font-black uppercase leading-none mb-3"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.02em' }}
            >
              Choose Your
              <br />
              <span className="text-white/20">Access Mode</span>
            </h1>
            <p className="text-white/30 text-sm" style={{ fontFamily: 'var(--font-playfair)' }}>
              Select how you want to receive messages. You can change this anytime.
            </p>
          </motion.div>

          {/* Options */}
          <div className="space-y-2 mb-8">
            {types.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelected(t.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
                style={{
                  background: selected === t.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: selected === t.id ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    background: selected === t.id ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                    border: selected === t.id ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <t.icon size={15} style={{ color: selected === t.id ? '#ef4444' : 'rgba(255,255,255,0.3)' }} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm mb-0.5">{t.label}</div>
                  <div className="text-white/30 text-xs leading-relaxed" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {t.desc}
                  </div>
                </div>
                <AnimatePresence>
                  {selected === t.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
                    >
                      <Check size={10} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileHover={{ scale: 1.02, backgroundColor: '#ef4444' }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-black text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-40"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full"
              />
            ) : (
              <>Continue to Chat <ArrowRight size={14} /></>
            )}
          </motion.button>
        </div>
      </div>
    </main>
  )
}