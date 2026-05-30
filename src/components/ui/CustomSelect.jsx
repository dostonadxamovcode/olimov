import { useState, useRef, useEffect, memo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Drop-in replacement for native <select>.
 * Renders the options panel via React Portal into document.body so it
 * escapes any parent stacking context (backdrop-filter, overflow, z-index).
 *
 * Props:
 *   value          – currently selected value string
 *   onValueChange  – (value: string) => void
 *   options        – [{ value, label }]
 *   placeholder    – text shown when nothing selected
 *   className      – extra wrapper classes
 *   hasError       – highlights border red
 */
const CustomSelect = memo(function CustomSelect({
  value,
  onValueChange,
  options = [],
  placeholder,
  className = '',
  hasError = false,
}) {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t('common.select')
  const [isOpen, setIsOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState({})

  const triggerRef  = useRef(null)
  const dropdownRef = useRef(null)

  const selected = options.find((o) => o.value === value)

  // Recalculate portal position from trigger's screen rect
  const reposition = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPanelStyle({
      position: 'fixed',
      top:      r.bottom + 6,
      left:     r.left,
      width:    r.width,
      zIndex:   9999,
    })
  }, [])

  // Reposition whenever the dropdown opens
  useEffect(() => {
    if (isOpen) reposition()
  }, [isOpen, reposition])

  // Close on outside click / scroll / resize
  useEffect(() => {
    if (!isOpen) return

    const onOutside = (e) => {
      const inTrigger   = triggerRef.current?.contains(e.target)
      const inDropdown  = dropdownRef.current?.contains(e.target)
      if (!inTrigger && !inDropdown) setIsOpen(false)
    }

    document.addEventListener('mousedown', onOutside)
    window.addEventListener('scroll',  reposition, true)
    window.addEventListener('resize',  reposition)

    return () => {
      document.removeEventListener('mousedown', onOutside)
      window.removeEventListener('scroll',  reposition, true)
      window.removeEventListener('resize',  reposition)
    }
  }, [isOpen, reposition])

  const handleSelect = (optValue) => {
    onValueChange(optValue)
    setIsOpen(false)
  }

  // ── Portal panel ──────────────────────────────────────────────────────────
  const panel = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          style={panelStyle}
          className="bg-[#12161f] border border-slate-700/80 rounded-xl shadow-2xl shadow-black/70 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* Subtle top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          <div className="py-1.5 max-h-56 overflow-y-auto">
            {options.map((opt) => {
              const isSel = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={[
                    'w-full flex items-center justify-between gap-2',
                    'px-4 py-2.5 text-sm text-left',
                    'transition-colors duration-150',
                    isSel
                      ? 'bg-purple-600/25 text-purple-300'
                      : 'text-slate-300 hover:bg-purple-600 hover:text-white',
                  ].join(' ')}
                >
                  <span className="truncate whitespace-nowrap">{opt.label}</span>
                  {isSel && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )
    : null

  // ── Trigger button ────────────────────────────────────────────────────────
  return (
    <div ref={triggerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={[
          'w-full min-w-0 flex items-center justify-between gap-2',
          'px-4 py-3 rounded-xl text-sm text-left',
          'bg-[#12161f] transition-all duration-200',
          isOpen
            ? 'border border-purple-500/60 ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/5'
            : hasError
              ? 'border border-red-500/50 hover:border-red-400/60'
              : 'border border-slate-700 hover:border-slate-500',
        ].join(' ')}
      >
        <span className={`block truncate whitespace-nowrap ${selected ? 'text-white font-medium' : 'text-slate-500'}`}>
          {selected ? selected.label : resolvedPlaceholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-purple-400' : 'text-slate-500'
          }`}
        />
      </button>

      {panel}
    </div>
  )
})

export default CustomSelect
