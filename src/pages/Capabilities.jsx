import { motion } from 'framer-motion'
import FadingVideo from '../components/FadingVideo'
import { ImageIcon, MovieIcon, LightbulbIcon } from '../components/Icons'

const blurFade = {
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
}

const capabilities = [
  {
    icon: ImageIcon,
    title: 'Design',
    tags: ['Brand Systems', 'Art Direction', 'Visual Identity', 'Motion'],
    body: 'We shape identities and interfaces that feel unmistakably yours — typographic systems, component libraries, and art-directed pages that scale without losing soul.',
  },
  {
    icon: MovieIcon,
    title: 'Engineering',
    tags: ['React', 'Next.js', 'Headless CMS', 'Edge-Ready'],
    body: 'Production-grade front-ends built on modern stacks. Performant, accessible, and instrumented — with code your team will enjoy extending long after launch.',
  },
  {
    icon: LightbulbIcon,
    title: 'Growth',
    tags: ['SEO', 'Analytics', 'A/B Testing', 'Retention'],
    body: 'Launch is the starting line. We partner with your team on conversion, content, and iteration loops that turn a beautiful site into a compounding asset.',
  },
]

export default function Capabilities() {
  return (
    <section className="min-h-screen overflow-hidden bg-black relative">
      {/* Background Video */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Content */}
      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen">
        {/* Header */}
        <motion.div
          {...blurFade}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={blurFade.animate}
          initial={blurFade.initial}
          className="mb-auto"
        >
          <p className="text-sm font-body text-white/80 mb-6">// Capabilities</p>
          <h2
            className="font-heading italic text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px] text-white"
            style={{ whiteSpace: 'pre-line' }}
          >
            {'Studio craft,\nend to end'}
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={blurFade.initial}
              whileInView={blurFade.animate}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
              className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col"
            >
              {/* Top Row: Icon + Tags */}
              <div className="flex items-start justify-between">
                <div className="liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center shrink-0">
                  <cap.icon className="w-5 h-5 text-white/90" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 ml-3">
                  {cap.tags.map((tag) => (
                    <span
                      key={tag}
                      className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Bottom: Title + Body */}
              <div>
                <h3 className="font-heading italic text-3xl md:text-4xl tracking-[-1px] leading-none text-white">
                  {cap.title}
                </h3>
                <p className="text-sm text-white/90 font-body font-light leading-snug max-w-[32ch] mt-3">
                  {cap.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
