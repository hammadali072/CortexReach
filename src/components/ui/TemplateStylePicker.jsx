// src/components/ui/TemplateStylePicker.jsx
import PropTypes from 'prop-types'
import clsx from 'clsx'

// ─── Style definitions ────────────────────────────────────────────────────────

const STYLES = [
  {
    id: 'clean_minimal',
    label: 'Clean Minimal',
    description: 'White, minimal, typographic',
    preview: ({ accent }) => (
      <div style={{ fontFamily: 'sans-serif', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Accent top border */}
        <div style={{ height: 3, background: accent, borderRadius: '2px 2px 0 0' }} />
        {/* Header */}
        <div style={{ padding: '8px 10px 4px', background: '#fff' }}>
          <div style={{ width: 40, height: 5, background: accent, borderRadius: 2, opacity: 0.7 }} />
        </div>
        {/* Body */}
        <div style={{ flex: 1, padding: '6px 10px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ width: '80%', height: 5, background: '#1e293b', borderRadius: 2 }} />
          <div style={{ width: '65%', height: 4, background: '#cbd5e1', borderRadius: 2 }} />
          <div style={{ width: '70%', height: 4, background: '#cbd5e1', borderRadius: 2 }} />
          <div style={{ marginTop: 6, width: 44, height: 14, background: accent, borderRadius: 3 }} />
        </div>
        {/* Footer */}
        <div style={{ padding: '4px 10px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ width: '50%', height: 3, background: '#e2e8f0', borderRadius: 2 }} />
        </div>
      </div>
    ),
  },
  {
    id: 'modern_dark',
    label: 'Modern Dark',
    description: 'Dark header, accent accents',
    preview: ({ accent }) => (
      <div style={{ fontFamily: 'sans-serif', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Dark header */}
        <div style={{ padding: '8px 10px', background: '#1e293b', borderBottom: `3px solid ${accent}` }}>
          <div style={{ width: 28, height: 5, background: accent, borderRadius: 2, marginBottom: 4 }} />
          <div style={{ width: '70%', height: 5, background: '#f1f5f9', borderRadius: 2 }} />
        </div>
        {/* Body */}
        <div style={{ flex: 1, padding: '8px 10px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ width: '60%', height: 4, background: '#334155', borderRadius: 2 }} />
          <div style={{ width: '80%', height: 4, background: '#cbd5e1', borderRadius: 2 }} />
          {/* Accent left-border items */}
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 2, height: 10, background: accent, borderRadius: 1 }} />
              <div style={{ flex: 1, height: 3, background: '#e2e8f0', borderRadius: 2 }} />
            </div>
          ))}
          <div style={{ marginTop: 4, width: 40, height: 12, background: accent, borderRadius: 3 }} />
        </div>
        {/* Footer */}
        <div style={{ padding: '4px 10px', background: '#f8fafc' }}>
          <div style={{ width: '55%', height: 3, background: '#e2e8f0', borderRadius: 2 }} />
        </div>
      </div>
    ),
  },
  {
    id: 'bold_gradient',
    label: 'Bold Gradient',
    description: 'Gradient header, featured cards',
    preview: ({ accent }) => (
      <div style={{ fontFamily: 'sans-serif', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Gradient header */}
        <div style={{ padding: '10px', background: `linear-gradient(135deg, ${accent}, #1e293b)`, textAlign: 'center' }}>
          <div style={{ width: '50%', height: 4, background: 'rgba(255,255,255,0.4)', borderRadius: 2, margin: '0 auto 4px' }} />
          <div style={{ width: '75%', height: 6, background: 'rgba(255,255,255,0.9)', borderRadius: 2, margin: '0 auto' }} />
        </div>
        {/* Body */}
        <div style={{ flex: 1, padding: '8px 8px 4px', background: '#fff' }}>
          <div style={{ width: '85%', height: 3, background: '#cbd5e1', borderRadius: 2, marginBottom: 6 }} />
          {/* Feature mini cards */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 24, background: '#f8fafc', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '60%', height: 3, background: '#cbd5e1', borderRadius: 2 }} />
              </div>
            ))}
          </div>
          {/* CTA gradient block */}
          <div style={{ height: 20, background: `linear-gradient(135deg, ${accent}, #1e293b)`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 10, background: '#fff', borderRadius: 2 }} />
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding: '4px 8px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ width: '45%', height: 3, background: '#e2e8f0', borderRadius: 2, margin: '0 auto' }} />
        </div>
      </div>
    ),
  },
  {
    id: 'professional_blue',
    label: 'Professional',
    description: 'Formal 2-col header, table layout',
    preview: ({ accent }) => (
      <div style={{ fontFamily: 'serif', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #dde3ec', borderRadius: 3 }}>
        {/* Two-column dark header */}
        <div style={{ padding: '8px 10px', background: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Logo placeholder */}
          <div style={{ width: 22, height: 22, background: accent, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, background: 'rgba(255,255,255,0.9)', borderRadius: 1 }} />
          </div>
          {/* Separator */}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          {/* Headline */}
          <div style={{ flex: 1 }}>
            <div style={{ width: '80%', height: 4, background: '#f1f5f9', borderRadius: 2, marginBottom: 3 }} />
            <div style={{ width: '60%', height: 3, background: 'rgba(255,255,255,0.35)', borderRadius: 2 }} />
          </div>
        </div>
        {/* Body */}
        <div style={{ flex: 1, padding: '8px 10px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ width: '90%', height: 3, background: '#cbd5e1', borderRadius: 2 }} />
          <div style={{ width: '75%', height: 3, background: '#cbd5e1', borderRadius: 2 }} />
          {/* Bordered feature table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
            {[1, 2, 3].map((i, idx) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 6px', background: idx % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: idx < 2 ? '1px solid #e2e8f0' : 'none' }}>
                <div style={{ width: 4, height: 4, color: accent, fontSize: 4 }}>▸</div>
                <div style={{ flex: 1, height: 3, background: '#e2e8f0', borderRadius: 2 }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 6, width: 40, height: 12, background: accent, borderRadius: 2 }} />
        </div>
        {/* Footer */}
        <div style={{ padding: '4px 10px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ width: '65%', height: 3, background: '#e2e8f0', borderRadius: 2 }} />
        </div>
      </div>
    ),
  },
]

// ─── Preset accent swatches ───────────────────────────────────────────────────

const PRESET_COLORS = [
  { hex: '#4f46e5', label: 'Indigo' },
  { hex: '#10b981', label: 'Emerald' },
  { hex: '#f43f5e', label: 'Rose' },
  { hex: '#f59e0b', label: 'Amber' },
  { hex: '#64748b', label: 'Slate' },
  { hex: '#7c3aed', label: 'Violet' },
]

// ─── Component ────────────────────────────────────────────────────────────────

const TemplateStylePicker = ({
  selectedStyle,
  onStyleChange,
  accentColor,
  onAccentColorChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Section title */}
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        Choose Email Style
      </p>

      {/* Style cards */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STYLES.map((style) => {
          const isSelected = selectedStyle === style.id
          const Preview = style.preview

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onStyleChange(style.id)}
              className={clsx(
                'flex-shrink-0 w-40 rounded-xl border-2 overflow-hidden transition-all duration-200 focus:outline-none',
                isSelected
                  ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-200'
                  : 'border-slate-100 hover:border-indigo-200 hover:shadow-sm',
              )}
              title={style.description}
            >
              {/* Mini preview canvas */}
              <div
                className="w-full"
                style={{ height: 120, overflow: 'hidden', position: 'relative' }}
              >
                <Preview accent={accentColor} />
              </div>

              {/* Label row */}
              <div
                className={clsx(
                  'px-3 py-2 flex items-center justify-between border-t transition-colors',
                  isSelected
                    ? 'bg-indigo-50 border-indigo-100'
                    : 'bg-white border-slate-50',
                )}
              >
                <span
                  className={clsx(
                    'text-[9px] font-black uppercase tracking-wider',
                    isSelected ? 'text-indigo-700' : 'text-slate-500',
                  )}
                >
                  {style.label}
                </span>
                {isSelected && (
                  <i className="fas fa-check-circle text-indigo-600 text-[11px]" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Accent color picker */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
          Accent Color
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Preset swatches */}
          {PRESET_COLORS.map((c) => {
            const isActive = accentColor === c.hex
            return (
              <button
                key={c.hex}
                type="button"
                title={c.label}
                onClick={() => onAccentColorChange(c.hex)}
                className={clsx(
                  'w-8 h-8 rounded-full transition-all duration-150 flex items-center justify-center focus:outline-none',
                  isActive
                    ? 'ring-2 ring-offset-2 shadow-md scale-110'
                    : 'hover:scale-105 hover:shadow-sm',
                )}
                style={{
                  background: c.hex,
                  ringColor: c.hex,
                  ...(isActive ? { outline: `2px solid ${c.hex}`, outlineOffset: '3px' } : {}),
                }}
              >
                {isActive && (
                  <i className="fas fa-check text-white text-[9px] drop-shadow" />
                )}
              </button>
            )
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200" />

          {/* Custom hex input */}
          <div className="relative flex items-center">
            {/* Color preview dot */}
            <div
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm mr-2 flex-shrink-0"
              style={{ background: accentColor }}
            />
            <input
              type="color"
              value={accentColor}
              onChange={(e) => onAccentColorChange(e.target.value)}
              title="Pick a custom color"
              className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
              style={{ appearance: 'none' }}
            />
            <span className="ml-2 text-[10px] font-mono font-bold text-slate-400 uppercase select-all">
              {accentColor}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

TemplateStylePicker.propTypes = {
  selectedStyle: PropTypes.oneOf(['modern_dark', 'clean_minimal', 'bold_gradient', 'professional_blue'])
    .isRequired,
  onStyleChange: PropTypes.func.isRequired,
  accentColor: PropTypes.string.isRequired,
  onAccentColorChange: PropTypes.func.isRequired,
}

export default TemplateStylePicker
