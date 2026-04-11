'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const brailleMap = {
  a:'⠁',b:'⠃',c:'⠉',d:'⠙',e:'⠑',f:'⠋',g:'⠛',h:'⠓',i:'⠊',j:'⠚',
  k:'⠅',l:'⠇',m:'⠍',n:'⠝',o:'⠕',p:'⠏',q:'⠟',r:'⠗',s:'⠎',t:'⠞',
  u:'⠥',v:'⠧',w:'⠺',x:'⠭',y:'⠽',z:'⠵',' ':'⠀'
}

const dotPatterns = {
  '⠁': [1,0,0,0,0,0], '⠃': [1,1,0,0,0,0], '⠉': [1,0,0,1,0,0],
  '⠙': [1,0,0,1,1,0], '⠑': [1,0,0,0,1,0], '⠋': [1,1,0,1,0,0],
  '⠛': [1,1,0,1,1,0], '⠓': [1,1,0,0,1,0], '⠊': [0,1,0,1,0,0],
  '⠚': [0,1,0,1,1,0], '⠅': [1,0,1,0,0,0], '⠇': [1,1,1,0,0,0],
  '⠍': [1,0,1,1,0,0], '⠝': [1,0,1,1,1,0], '⠕': [1,0,1,0,1,0],
  '⠏': [1,1,1,1,0,0], '⠟': [1,1,1,1,1,0], '⠗': [1,1,1,0,1,0],
  '⠎': [0,1,1,1,0,0], '⠞': [0,1,1,1,1,0], '⠥': [1,0,1,0,0,1],
  '⠧': [1,1,1,0,0,1], '⠺': [0,1,0,1,1,1], '⠭': [1,0,1,1,0,1],
  '⠽': [1,0,1,1,1,1], '⠵': [1,0,1,0,1,1], '⠀': [0,0,0,0,0,0],
}

function BrailleCell({ char, index, active }) {
  const brailleChar = brailleMap[char?.toLowerCase()] || '⠀'
  const dots = dotPatterns[brailleChar] || [0,0,0,0,0,0]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: active ? 1 : 0.3, scale: active ? 1 : 0.8 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center gap-1"
    >
      {/* Dot grid - 2 columns, 3 rows */}
      <div className="grid grid-cols-2 gap-1.5 p-2 bg-black/30 rounded-lg border border-white/10">
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            animate={dot && active ? {
              scale: [1, 1.4, 1],
              backgroundColor: ['#6366f1', '#a855f7', '#6366f1'],
              boxShadow: ['0 0 4px #6366f1', '0 0 12px #a855f7', '0 0 4px #6366f1'],
            } : {
              scale: 1,
              backgroundColor: '#1e1e2e',
              boxShadow: 'none',
            }}
            transition={{
              duration: 1.5,
              repeat: dot && active ? Infinity : 0,
              delay: i * 0.1,
            }}
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: dot ? '#6366f1' : '#1e1e2e' }}
          />
        ))}
      </div>
      <span className="text-yellow-300 text-xs font-mono">{char === ' ' ? '·' : char}</span>
    </motion.div>
  )
}

export default function BrailleGrid({ text }) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const chars = text?.toLowerCase().split('') || []

  useEffect(() => {
    if (!text) return
    setActiveIndex(-1)
    let i = 0
    const interval = setInterval(() => {
      setActiveIndex(i)
      i++
      if (i >= chars.length) {
        clearInterval(interval)
        setTimeout(() => setActiveIndex(-1), 1000)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [text])

  if (!text) return null

  return (
    <div className="bg-black/40 border border-yellow-400/30 rounded-2xl p-4 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 bg-yellow-400 rounded-full"
        />
        <span className="text-yellow-300 text-xs font-bold tracking-widest">BRAILLE TACTILE OUTPUT</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {chars.map((char, i) => (
          <BrailleCell
            key={i}
            char={char}
            index={i}
            active={activeIndex >= i}
          />
        ))}
      </div>
      <div className="mt-3 text-yellow-200/50 text-xs font-mono tracking-widest">
        {chars.map(c => brailleMap[c] || c).join('')}
      </div>
    </div>
  )
}