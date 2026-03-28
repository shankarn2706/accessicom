'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) router.push('/chat')
  }, [isSignedIn])

  return (
    <main className="min-h-screen bg-[#020818] flex items-center justify-center overflow-hidden relative">

      {/* Big visible animated orbs */}
      <motion.div
        animate={{ x: [0, 80, 0], y: [0, -60, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/40 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1, 1.4, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/40 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-teal-500/30 rounded-full blur-[80px]"
      />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${8 + i * 8}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
        />
      ))}

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-sm text-blue-300 mb-8 backdrop-blur"
        >
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full inline-block"
          />
          Adaptive Communication System · Live
        </motion.div>

        {/* Title with letter animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              Accessi
            </span>
            <motion.span
              animate={{ color: ['#a855f7', '#3b82f6', '#06b6d4', '#a855f7'] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-purple-400"
            >
              Com
            </motion.span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-2xl text-blue-200/80 mb-4 max-w-2xl mx-auto font-light"
        >
          Real-time communication that adapts to everyone
        </motion.p>

        {/* Disability tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            { label: '🦯 Blind', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' },
            { label: '🤟 Deaf', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
            { label: '🔇 Mute', color: 'from-teal-500/20 to-teal-600/20 border-teal-500/30' },
            { label: '✋ Deafblind', color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30' },
            { label: '👁️ General', color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
          ].map((tag, i) => (
            <motion.span
              key={tag.label}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.1, y: -3 }}
              className={`bg-gradient-to-r ${tag.color} border rounded-full px-5 py-2 text-sm text-white/90 backdrop-blur cursor-default`}
            >
              {tag.label}
            </motion.span>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="flex gap-4 justify-center mb-16"
        >
          <motion.a
            href="/sign-up"
            whileHover={{ scale: 1.07, boxShadow: '0 0 40px rgba(139,92,246,0.6)' }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-12 rounded-full text-lg relative overflow-hidden group"
          >
            <motion.span
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
            Get Started →
          </motion.a>
          <motion.a
            href="/sign-in"
            whileHover={{ scale: 1.07, borderColor: 'rgba(255,255,255,0.6)' }}
            whileTap={{ scale: 0.95 }}
            className="border border-white/30 text-white font-bold py-4 px-12 rounded-full text-lg backdrop-blur hover:bg-white/10 transition-all"
          >
            Sign In
          </motion.a>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { icon: '🧠', title: 'ML Classification', desc: 'Intent & sentiment detection', color: 'purple' },
            { icon: '⚡', title: 'Real-time Chat', desc: 'WebSocket powered messaging', color: 'blue' },
            { icon: '♿', title: 'Full Accessibility', desc: 'TTS, Braille & visual modes', color: 'teal' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.15 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left backdrop-blur cursor-default hover:bg-white/10 transition-all"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i }}
                className="text-4xl mb-4"
              >
                {f.icon}
              </motion.div>
              <div className="text-white font-bold text-lg mb-1">{f.title}</div>
              <div className="text-white/50 text-sm">{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  )
}