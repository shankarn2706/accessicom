'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Brain, Zap, Shield, Radio } from 'lucide-react'

export default function Home() {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  useEffect(() => { if (isSignedIn) router.push('/chat') }, [isSignedIn])

  return (
    <main ref={containerRef} className="bg-black text-white overflow-x-hidden" style={{ fontFamily: 'var(--font-syne)' }}>

      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay muted loop playsInline
          className="w-full h-full object-cover"
          style={{ opacity: 0.4 }}
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.9) 100%)' }} />
      </div>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="font-black text-base tracking-widest uppercase text-white">AccessiCom</div>
        <div className="flex items-center gap-3">
          <motion.a
            href="/sign-in"
            whileHover={{ scale: 1.03 }}
            className="text-white/50 hover:text-white text-xs font-medium tracking-wide transition-colors px-4 py-2"
          >
            Sign In
          </motion.a>
          <motion.a
            href="/sign-up"
            whileHover={{ scale: 1.03, backgroundColor: '#ef4444' }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-black tracking-widest uppercase transition-all duration-300"
          >
            Get Started <ArrowRight size={12} />
          </motion.a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-4xl mx-auto"
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-10 text-xs tracking-widest uppercase"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-red-500"
            />
            <span className="text-white/60">Adaptive Communication — Live</span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-black uppercase leading-none tracking-tighter mb-6"
            style={{ fontSize: 'clamp(52px, 9vw, 120px)', fontFamily: 'var(--font-syne)' }}
          >
            Communication
            <br />
            <span style={{ color: '#ef4444' }}>Without</span>
            <br />
            Barriers
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-white/50 max-w-lg mx-auto mb-10 leading-relaxed"
            style={{ fontSize: '16px', fontFamily: 'var(--font-playfair)' }}
          >
            A real-time platform that automatically adapts messages for blind, deaf,
            mute and deafblind users — no manual switching required.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <motion.a
              href="/sign-up"
              whileHover={{ scale: 1.05, backgroundColor: '#ef4444' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-black text-sm tracking-widest uppercase transition-all duration-300"
            >
              Get Started <ArrowRight size={14} />
            </motion.a>
            <motion.a
              href="/sign-in"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-white/60 hover:text-white text-sm font-medium transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Sign In
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/20" />
          <span className="text-white/20 text-xs tracking-widest uppercase">Scroll</span>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-t border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }}>
        <div className="grid grid-cols-4">
          {[
            { value: '5', label: 'Disability Modes' },
            { value: '3', label: 'ML Models' },
            { value: '<100ms', label: 'Latency' },
            { value: '100%', label: 'Accessible' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center py-12 border-r last:border-0"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="font-black mb-1"
                style={{ fontSize: '40px', color: i % 2 === 1 ? '#ef4444' : 'white', fontFamily: 'var(--font-syne)' }}
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
      <section className="relative z-10 py-32 px-8" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-red-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">Core Technology</div>
            <h2
              className="font-black uppercase leading-none"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontFamily: 'var(--font-syne)', letterSpacing: '-0.02em' }}
            >
              Built for
              <span className="text-white/20"> Everyone</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Brain, title: 'ML Classification', desc: 'Three-model pipeline detecting emergency, question and normal intents with real-time confidence scoring.' },
              { icon: Zap, title: 'Real-Time Chat', desc: 'WebSocket-powered messaging with sub-100ms delivery and live accessibility routing.' },
              { icon: Shield, title: 'Emergency System', desc: 'Auto-escalation with haptic feedback, voice alerts and animated red banners for critical messages.' },
              { icon: Radio, title: 'Adaptive Output', desc: 'Automatic TTS speech, animated Braille dots and visual-only modes per user profile.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.04)' }}
                className="group p-8 rounded-2xl transition-all duration-300 cursor-default"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <f.icon size={16} style={{ color: '#ef4444' }} />
                </div>
                <h3 className="font-bold text-white text-base mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
                  {f.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {f.desc}
                </p>
                <motion.div
                  className="h-px mt-6 w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: 'linear-gradient(90deg, #ef4444, transparent)' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="relative z-10 py-40 px-8 text-center"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2
            className="font-black uppercase leading-none mb-6"
            style={{ fontSize: 'clamp(40px, 7vw, 88px)', fontFamily: 'var(--font-syne)', letterSpacing: '-0.02em' }}
          >
            Ready to
            <br />
            <span style={{ color: '#ef4444' }}>Connect?</span>
          </h2>
          <p className="text-white/40 mb-10 text-base" style={{ fontFamily: 'var(--font-playfair)' }}>
            Join AccessiCom and experience communication without limits
          </p>
          <motion.a
            href="/sign-up"
            whileHover={{ scale: 1.05, backgroundColor: '#ef4444' }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-white text-black font-black text-sm tracking-widest uppercase transition-all duration-300"
          >
            Get Started Free <ArrowRight size={16} />
          </motion.a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 border-t px-8 py-6 flex items-center justify-between"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.9)' }}
      >
        <div className="text-white/20 text-xs tracking-widest uppercase font-medium">AccessiCom © 2026</div>
        <div className="text-white/20 text-xs" style={{ fontFamily: 'var(--font-playfair)' }}>
          Adaptive Communication for Everyone
        </div>
      </footer>

    </main>
  )
}