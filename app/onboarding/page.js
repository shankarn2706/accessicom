'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const types = [
  { id: 'general', label: 'General User', emoji: '👁️', desc: 'No accessibility needs', color: 'from-green-500/20 to-emerald-500/20 border-green-500/40' },
  { id: 'blind', label: 'Blind', emoji: '🦯', desc: 'Messages read aloud automatically via TTS', color: 'from-purple-500/20 to-violet-500/20 border-purple-500/40' },
  { id: 'deaf', label: 'Deaf', emoji: '🤟', desc: 'Visual alerts, icons and text only', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40' },
  { id: 'mute', label: 'Mute', emoji: '🔇', desc: 'Speech input with text output', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40' },
  { id: 'deafblind', label: 'Deafblind', emoji: '✋', desc: 'Braille output with high contrast UI', color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40' },
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
      }, { onConflict: 'id', ignoreDuplicates: false })
    } catch (err) {
      console.error(err)
    }
    router.push('/chat')
  }

  return (
    <main className="min-h-screen bg-[#020818] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background orbs */}
      <motion.div
        animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-black text-2xl mx-auto mb-4"
            >
              A
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2">Welcome to AccessiCom!</h1>
            <p className="text-white/50 text-sm">Choose how you want to receive messages</p>
          </motion.div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {types.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(t.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all bg-gradient-to-r ${
                  selected === t.id
                    ? t.color + ' shadow-lg'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={selected === t.id ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className="text-2xl"
                  >
                    {t.emoji}
                  </motion.span>
                  <div className="flex-1">
                    <div className="text-white font-bold">{t.label}</div>
                    <div className="text-white/50 text-xs mt-0.5">{t.desc}</div>
                  </div>
                  <AnimatePresence>
                    {selected === t.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-5 h-5 bg-white rounded-full flex items-center justify-center"
                      >
                        <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black py-4 rounded-2xl text-lg relative overflow-hidden"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : (
              <>
                <motion.span
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
                Continue to Chat →
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </main>
  )
}