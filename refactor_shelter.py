import os

with open('src/pages/ShelterPage.tsx', 'r', encoding='utf-8') as f:
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
    content = content.replace("import { useEffect, useMemo, useState, useCallback } from 'react';", "import { useEffect, useMemo, useState, useCallback } from 'react';\n" + consts)

replacements = {
    "text-white": "text-slate-900",
    "text-slate-100": "text-slate-900",
    "text-slate-400": "text-slate-500",
    "text-slate-300": "text-slate-600",
    "text-blue-400": "text-blue-600",
    "text-emerald-400": "text-emerald-600",
    
    "border-white/10": "border-[#C7D0DA]",
    "border-white/5": "border-[#C7D0DA]",
    "border-slate-800": "border-[#C7D0DA]",
    "borderColor: 'rgba(26,115,232,0.15)'": "borderColor: AD_BORDER",
    "borderColor: 'rgba(26,115,232,0.1)'": "borderColor: AD_BORDER",
    "borderColor: 'rgba(26,115,232,0.08)'": "borderColor: AD_BORDER",
    "borderColor: 'rgba(26,115,232,0.3)'": "borderColor: AD_SKY",
    
    "background: 'rgba(6,12,24,0.92)'": "background: AD_CARD",
    "background: 'rgba(10,20,40,0.6)'": "background: AD_BG",
    "background: 'rgba(26,115,232,0.03)'": "background: AD_BG",
    "background: 'rgba(26,115,232,0.08)'": "background: AD_CARD",
    "bg-white/5": "bg-white",
    "bg-white/10": "bg-slate-50",
    "hover:bg-white/10": "hover:bg-slate-50",
    "hover:bg-white/5": "hover:bg-slate-50",
    "bg-white/20": "bg-slate-200",
    
    "boxShadow: '0 8px 32px rgba(0,0,0,0.6)'": "boxShadow: '0 8px 32px rgba(199,208,218,0.5)'",
    "boxShadow: '0 12px 40px rgba(0,0,0,0.8)'": "boxShadow: '0 12px 40px rgba(199,208,218,0.6)'",
    
    "color: '#1A73E8'": "color: AD_MID",
    "bg-blue-600": "bg-blue-500",
    "bg-blue-500/20": "bg-blue-100",
    "bg-emerald-500/20": "bg-emerald-100",
    "bg-amber-500/20": "bg-amber-100",
    "bg-slate-800": "bg-slate-100",
    "hover:bg-slate-800": "hover:bg-slate-200",
    
    "background: 'rgba(239, 68, 68, 0.9)'": "background: '#fef2f2'",
    "borderColor: 'rgba(248, 113, 113, 0.3)'": "borderColor: '#fca5a5'",
    "boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4)'": "boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)'",
    "text-[10px] text-red-50": "text-[10px] text-red-700",
    "text-white leading-tight": "text-red-900 leading-tight",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/ShelterPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ShelterPage refactored successfully.")
