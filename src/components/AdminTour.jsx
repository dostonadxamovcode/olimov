import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

const STEPS = [
  {
    target: '[data-tour="stats"]',
    title: 'Statistika',
    text: "Bu yerda sayt foydalanuvchilari sonini va statistikani ko'rishingiz mumkin.",
  },
  {
    target: '[data-tour="students"]',
    title: 'Foydalanuvchilar',
    text: "Bu bo'lim orqali foydalanuvchilarni ko'rish va boshqarish mumkin.",
  },
  {
    target: '[data-tour="add-test"]',
    title: 'Test qo\'shish',
    text: "Yangi testlarni shu bo'lim orqali qo'shishingiz mumkin.",
  },
  {
    target: '[data-tour="tests"]',
    title: 'Testlarni boshqarish',
    text: "Testlarni shu yer orqali tahrirlash yoki o'chirish mumkin.",
  },
  {
    target: '[data-tour="landing"]',
    title: 'Asosiy sahifa',
    text: "Bu tugma orqali asosiy sayt sahifasiga qaytishingiz mumkin.",
  },
]

const TOUR_KEY = 'admin_tour_done'

export default function AdminTour({ userId }) {
  const [step, setStep] = useState(0)
  const [show, setShow] = useState(false)
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (!userId) return
    const key = `${TOUR_KEY}_${userId}`
    if (!sessionStorage.getItem(key)) {
      const timer = setTimeout(() => setShow(true), 300)
      return () => clearTimeout(timer)
    }
  }, [userId])

  const updateRect = useCallback(() => {
    if (!show) return
    const el = document.querySelector(STEPS[step].target)
    if (el) {
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else {
      setRect(null)
    }
  }, [step, show])

  useEffect(() => {
    updateRect()
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [updateRect])

  const finish = () => {
    setShow(false)
    if (userId) sessionStorage.setItem(`${TOUR_KEY}_${userId}`, '1')
  }

  const next = () => step < STEPS.length - 1 ? setStep(step + 1) : finish()
  const prev = () => step > 0 && setStep(step - 1)

  if (!show || !rect) return null

  // Calculate tooltip position
  const pad = 8
  const tooltipW = 320
  let tooltipStyle = {}
  const spaceBelow = window.innerHeight - (rect.top + rect.height)
  const spaceRight = window.innerWidth - (rect.left + rect.width)

  if (spaceBelow > 200) {
    tooltipStyle = { top: rect.top + rect.height + pad + 12, left: Math.max(12, Math.min(rect.left, window.innerWidth - tooltipW - 12)) }
  } else {
    tooltipStyle = { top: Math.max(12, rect.top - 200), left: Math.max(12, Math.min(rect.left, window.innerWidth - tooltipW - 12)) }
  }

  return createPortal(
    <div className="tour-overlay">
      {/* Dark overlay with cutout */}
      <svg className="tour-svg" width="100%" height="100%">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={rect.left - pad} y={rect.top - pad}
              width={rect.width + pad * 2} height={rect.height + pad * 2}
              rx="12" fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#tour-mask)" />
      </svg>

      {/* Highlight border */}
      <div className="tour-highlight" style={{
        top: rect.top - pad, left: rect.left - pad,
        width: rect.width + pad * 2, height: rect.height + pad * 2,
      }} />

      {/* Tooltip */}
      <div className="tour-tooltip" style={tooltipStyle}>
        <div className="tour-tooltip-header">
          <span className="tour-step-badge">{step + 1}/{STEPS.length}</span>
          <button className="tour-skip" onClick={finish}>O'tkazib yuborish</button>
        </div>
        <h4 className="tour-title">{STEPS[step].title}</h4>
        <p className="tour-text">{STEPS[step].text}</p>
        <div className="tour-actions">
          {step > 0 && <button className="tour-btn tour-btn-prev" onClick={prev}>Orqaga</button>}
          <button className="tour-btn tour-btn-next" onClick={next}>
            {step === STEPS.length - 1 ? 'Tugatish' : 'Keyingi'}
          </button>
        </div>
        {/* Progress dots */}
        <div className="tour-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`tour-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
