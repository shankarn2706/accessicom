'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useClerk, useUser } from '@clerk/nextjs'
import { LogOut, Home, MessageSquare, LayoutDashboard } from 'lucide-react'

export default function Navbar({ active }) {
  const router = useRouter()
  const { signOut } = useClerk()
  const { user } = useUser()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-8 py-5 border-b sticky top-0 z-50"
      style={{
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.08)',
        fontFamily: 'var(--font-syne)',
      }}
    >
      {/* Logo */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push('/')}
        className="font-black text-lg tracking-widest uppercase text-white hover:text-red-400 transition-colors duration-200"
      >
        AccessiCom
      </motion.button>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {[
          { label: 'Home', icon: Home, path: '/' },
          { label: 'Chat', icon: MessageSquare, path: '/chat' },
          { label: 'Admin', icon: LayoutDashboard, path: '/admin' },
        ].map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(item.path)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
            style={{
              background: active === item.label ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: active === item.label ? 'white' : 'rgba(255,255,255,0.35)',
              border: active === item.label ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
            }}
          >
            <item.icon size={12} />
            {item.label}
          </motion.button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user && (
          <div
            className="text-xs text-white/20 hidden md:block"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {user.fullName || user.emailAddresses?.[0]?.emailAddress}
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.03, backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          <LogOut size={12} /> Sign Out
        </motion.button>
      </div>
    </motion.nav>
  )
}