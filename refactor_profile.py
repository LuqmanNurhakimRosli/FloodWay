import os

with open('src/pages/ProfilePage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

consts = """
// ── Arctic Dawn palette constants ────────────────────────────────────────────
const AD_BG        = '#F9FAFB';   // Off-White / Snow
const AD_CARD      = '#E3F4FF';   // Pale Arctic Blue (surfaces)
const AD_MID       = '#7FB8E6';   // Mid-Blue (primary accent)
const AD_SKY       = '#B6DDFF';   // Sky Blue (secondary accent)
const AD_BORDER    = '#C7D0DA';   // Cool Gray (2D borders)
const AD_TEXT      = '#0f172a';   // Deep slate
const AD_MUTED     = '#64748b';   // Muted slate
"""

if "AD_BG" not in content:
    content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\n" + consts)

replacements = {
    "background: '#060C18'": "background: AD_BG",
    "background: 'rgba(10,20,40,0.85)', border: '1px solid rgba(26,115,232,0.14)', backdropFilter: 'blur(16px)'": "background: AD_CARD, border: `1px solid ${AD_BORDER}`",
    "borderBottomColor: 'rgba(26,115,232,0.08)'": "borderBottomColor: AD_BORDER",
    "background: 'rgba(26,115,232,0.12)', border: '1px solid rgba(26,115,232,0.2)'": "background: AD_BG, border: `1px solid ${AD_BORDER}`",
    "text-white": "text-slate-900",
    "color: 'rgba(255,255,255,0.4)'": "color: AD_MUTED",
    "background: 'rgba(255,255,255,0.05)'": "background: AD_BG",
    "border: `1px solid ${focused ? 'rgba(26,115,232,0.50)' : 'rgba(255,255,255,0.08)'}`": "border: `1px solid ${focused ? AD_MID : AD_BORDER}`",
    "boxShadow: focused ? '0 0 0 3px rgba(26,115,232,0.10)' : 'none'": "boxShadow: focused ? `0 0 0 3px ${AD_SKY}` : 'none'",
    "background: 'rgba(6,12,24,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(26,115,232,0.12)'": "background: AD_BG, borderBottom: `1px solid ${AD_BORDER}`",
    "background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'": "background: AD_CARD, border: `1px solid ${AD_BORDER}`",
    "color: '#1A73E8'": "color: AD_MID",
    "background: 'radial-gradient(ellipse at 50% 0%, rgba(26,115,232,0.06) 0%, transparent 65%)'": "background: AD_BG",
    "rgba(26,115,232,0.15)": "AD_SKY",
    "rgba(26,115,232,0.35)": "AD_SKY",
    "linear-gradient(135deg, #1A73E8, #0D47A1)": "AD_MID",
    "text-slate-400": "text-slate-500",
    "text-blue-400": "text-blue-600",
    "text-red-400": "text-red-600",
    "background: 'rgba(239,68,68,0.1)'": "background: '#fee2e2'",
    "color: '#ef4444'": "color: '#dc2626'",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/ProfilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ProfilePage refactored successfully.")
