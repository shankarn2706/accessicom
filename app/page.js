'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowRight, Zap, Shield, Radio, Brain, Eye, EarOff, MicOff, Hand, ChevronDown } from 'lucide-react'

function SpotlightEffect() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = (e) => { setPosition({ x: e.clientX, y: e.clientY }); setVisible(true) }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])
  return (
    <div className="pointer-events-none fixed inset-0 z-30" style={{ opacity: visible ? 1 : 0 }}>
      <div style={{
        position: 'absolute',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)',
        transform: `translate(${position.x - 250}px, ${position.y - 250}px)`,
        transition: 'transform 0.08s ease',
      }} />
    </div>
  )
}

export default function Home() {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const springHeroY = useSpring(heroY, { stiffness: 80, damping: 20 })

  useEffect(() => { if (isSignedIn) router.push('/chat') }, [isSignedIn])

  const features = [
    { icon: Brain, title: 'ML Intent Classification', desc: 'Three-model pipeline detecting emergency, question and normal intents with confidence scoring.', tag: 'AI' },
    { icon: Zap, title: 'Real-Time WebSocket Chat', desc: 'Sub-100ms message delivery with live status indicators and instant accessibility routing.', tag: 'Live' },
    { icon: Shield, title: 'Emergency Priority System', desc: 'Auto-escalation with haptic feedback, voice alerts and flashing banners for critical messages.', tag: 'Safety' },
    { icon: Radio, title: 'Adaptive Output Engine', desc: 'Automatic conversion to TTS speech, animated Braille dots and visual-only modes.', tag: 'Access' },
  ]

  const stats = [
    { value: '5', label: 'Disability Modes' },
    { value: '3', label: 'ML Models' },
    { value: '<100ms', label: 'Latency' },
    { value: '100%', label: 'Accessible' },
  ]

  const modes = [
    { icon: Eye, label: 'General', color: '#ffffff' },
    { icon: EarOff, label: 'Deaf', color: '#ef4444' },
    { icon: MicOff, label: 'Mute', color: '#ffffff' },
    { icon: Hand, label: 'Deafblind', color: '#ef4444' },
  ]

  return (
    <main ref={containerRef} className="bg-black text-white overflow-x-hidden" style={{ fontFamily: 'var(--font-syne)' }}>
      <SpotlightEffect />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="text-white font-black text-xl tracking-widest uppercase">AccessiCom</div>
        <div className="flex items-center gap-4">
          <motion.a
            href="/sign-in"
            whileHover={{ scale: 1.03 }}
            className="text-white/50 hover:text-white text-sm font-medium transition-colors"
          >
            Sign In
          </motion.a>
          <motion.a
            href="/sign-up"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-white text-black hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            Get Started <ArrowRight size={14} />
          </motion.a>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0">
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
            style={{
              position: 'absolute', top: '20%', right: '10%',
              width: '600px', height: '600px',
              background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)',
            }}
          />
        </div>

        <motion.div style={{ y: springHeroY, opacity: heroOpacity }} className="relative z-10 px-8 w-full">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
            <span className="text-white/40 text-xs tracking-[0.3em] uppercase font-medium">
              Adaptive Communication System
            </span>
          </motion.div>

          {/* Giant heading */}
          <div className="overflow-hidden mb-4">
            <motion.h1
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="font-black uppercase leading-none tracking-tighter"
              style={{
                fontSize: 'clamp(60px, 12vw, 160px)',
                fontFamily: 'var(--font-syne)',
                letterSpacing: '-0.02em',
              }}
            >
              ACCESSI
              <span style={{ color: '#ef4444' }}>COM</span>
            </motion.h1>
          </div>

          <div className="overflow-hidden mb-12">
            <motion.p
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/40 max-w-xl leading-relaxed"
              style={{
                fontSize: 'clamp(14px, 1.5vw, 18px)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              A real-time intelligent communication platform that automatically adapts
              messages for blind, deaf, mute and deafblind users — no manual switching required.
            </motion.p>
          </div>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex items-center gap-6 mb-20"
          >
            <motion.a
              href="/sign-up"
              whileHover={{ scale: 1.04, backgroundColor: '#ef4444' }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-sm tracking-wide transition-all duration-300"
            >
              START NOW <ArrowRight size={16} />
            </motion.a>
            <motion.a
              href="/sign-in"
              whileHover={{ x: 6 }}
              className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-all"
            >
              Already have an account <ArrowRight size={14} />
            </motion.a>
          </motion.div>

          {/* Mode badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-4 flex-wrap"
          >
            {modes.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                whileHover={{ y: -3 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <m.icon size={12} style={{ color: m.color }} />
                <span className="text-white/60">{m.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-8 flex items-center gap-3"
        >
          <ChevronDown size={16} className="text-white/20" />
          <span className="text-white/20 text-xs tracking-widest uppercase">Scroll to explore</span>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-b border-white/06 py-12 px-8">
        <div className="grid grid-cols-4 gap-0">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center py-4 border-r border-white/06 last:border-0"
            >
              <div
                className="font-black mb-1"
                style={{
                  fontSize: 'clamp(32px, 4vw, 56px)',
                  fontFamily: 'var(--font-syne)',
                  color: i % 2 === 1 ? '#ef4444' : '#ffffff',
                }}
              >
                {s.value}
              </div>
              <div className="text-white/30 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-playfair)' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-red-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">Core Technology</div>
          <h2
            className="font-black uppercase leading-none"
            style={{ fontSize: 'clamp(40px, 7vw, 96px)', fontFamily: 'var(--font-syne)', letterSpacing: '-0.02em' }}
          >
            BUILT FOR<br />
            <span className="text-white/20">EVERYONE</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-px bg-white/06">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              className="group relative p-12 bg-black transition-all duration-300 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle at 0% 0%, rgba(220,38,38,0.05) 0%, transparent 60%)' }}
              />
              <div className="flex items-start justify-between mb-8">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <f.icon size={18} className="text-white/60 group-hover:text-red-400 transition-colors duration-300" />
                </div>
                <span className="text-xs tracking-widest uppercase text-white/20 font-medium">{f.tag}</span>
              </div>
              <h3
                className="font-bold text-white mb-3 text-xl group-hover:text-red-400 transition-colors duration-300"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                {f.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-playfair)' }}>
                {f.desc}
              </p>
              <motion.div
                className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
                style={{ background: 'linear-gradient(90deg, #ef4444, transparent)' }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-8 border-t border-white/06 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px', height: '800px',
            background: 'radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h2
            className="font-black uppercase leading-none mb-10"
            style={{ fontSize: 'clamp(48px, 10vw, 140px)', fontFamily: 'var(--font-syne)', letterSpacing: '-0.02em' }}
          >
            CONNECT<br />
            <span className="text-white/10">WITHOUT</span><br />
            <span style={{ color: '#ef4444' }}>LIMITS</span>
          </h2>
          <motion.a
            href="/sign-up"
            whileHover={{ scale: 1.04, gap: '20px' }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-bold text-base tracking-wide hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            GET STARTED FREE <ArrowRight size={18} />
          </motion.a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/06 px-8 py-8 flex items-center justify-between">
        <div className="text-white/20 text-xs tracking-widest uppercase font-medium">AccessiCom © 2026</div>
        <div className="text-white/20 text-xs" style={{ fontFamily: 'var(--font-playfair)' }}>
          Adaptive Communication for Everyone
        </div>
      </footer>
    </main>
  )
}