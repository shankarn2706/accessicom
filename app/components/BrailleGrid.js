'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const brailleMap = {
  a:'⠁',b:'⠃',c:'⠉',d:'⠙',e:'⠑',f:'⠋',g:'⠛',h:'⠓',i:'⠊',j:'⠚',
  k:'⠅',l:'⠇',m:'⠍',n:'⠝',o:'⠕',p:'⠏',q:'⠟',r:'⠗',s:'⠎',t:'⠞',
  u:'⠥',v:'⠧',w:'⠺',x:'⠭',y:'⠽',z:'⠵',' ':'⠀'
}

const dotPatterns = {
  '⠁':[1,0,0,0,0,0],'⠃':[1,1,0,0,0,0],'⠉':[1,0,0,1,0,0],'⠙':[1,0,0,1,1,0],
  '⠑':[1,0,0,0,1,0],'⠋':[1,1,0,1,0,0],'⠛':[1,1,0,1,1,0],'⠓':[1,1,0,0,1,0],
  '⠊':[0,1,0,1,0,0],'⠚':[0,1,0,1,1,0],'⠅':[1,0,1,0,0,0],'⠇':[1,1,1,0,0,0],
  '⠍':[1,0,1,1,0,0],'⠝':[1,0,1,1,1,0],'⠕':[1,0,1,0,1,0],'⠏':[1,1,1,1,0,0],
  '⠟':[1,1,1,1,1,0],'⠗':[1,1,1,0,1,0],'⠎':[0,1,1,1,0,0],'⠞':[0,1,1,1,1,0],
  '⠥':[1,0,1,0,0,1],'⠧':[1,1,1,0,0,1],'⠺':[0,1,0,1,1,1],'⠭':[1,0,1,1,0,1],
  '⠽':[1,0,1,1,1,1],'⠵':[1,0,1,0,1,1],'⠀':[0,0,0,0,0,0],
}

function BrailleCell({ char, revealed }) {
  const brailleChar = brailleMap[char?.toLowerCase()] || '⠀'
  const dots = dotPatterns[brailleChar] || [0,0,0,0,0,0]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="grid grid-cols-2 gap-1 p-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            animate={dot && revealed ? {
              backgroundColor: '#ef4444',
              boxShadow: '0 0 6px rgba(239,68,68,0.6)',
            } : {
              backgroundColor: 'rgba(255,255,255,0.08)',
              boxShadow: 'none',
            }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="w-2 h-2 rounded-full"
          />
        ))}
      </div>
      <span className="text-white/20 text-xs font-mono">{char === ' ' ? '·' : char}</span>
    </div>
  )
}

export default function BrailleGrid({ text }) {
  const [revealedCount, setRevealedCount] = useState(0)
  const chars = (text || '').toLowerCase().split('')

  useEffect(() => {
    if (!text) return
    setRevealedCount(0)
    let i = 0
    const interval = setInterval(() => {
      i++
      setRevealedCount(i)
      if (i >= chars.length) clearInterval(interval)
    }, 150)
    return () => clearInterval(interval)
  }, [text])

  if (!text) return null

  return (
    <div
      className="mt-3 p-4 rounded-xl"
      style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-red-500"
        />
        <span className="text-red-500 text-xs tracking-widest uppercase font-bold">Braille Output</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {chars.slice(0, 20).map((char, i) => (
          <BrailleCell key={i} char={char} revealed={revealedCount > i} />
        ))}
        {chars.length > 20 && (
          <div className="flex items-end pb-4">
            <span className="text-white/20 text-xs" style={{ fontFamily: 'var(--font-playfair)' }}>
              +{chars.length - 20} more
            </span>
          </div>
        )}
      </div>
    </div>
  )
}