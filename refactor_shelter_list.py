import os

with open('src/pages/ShelterPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "style={i === 0 ? { border: '1px solid rgba(26,115,232,0.3)', background: AD_CARD } : { border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,20,40,0.7)' }}": "style={i === 0 ? { border: `1px solid ${AD_BORDER}`, background: AD_CARD } : { border: `1px solid ${AD_BORDER}`, background: '#FFFFFF' }}",
    "style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', border: '1px solid rgba(26,115,232,0.3)', boxShadow: '0 8px 24px rgba(26,115,232,0.35)' }}": "style={{ background: AD_MID, border: `1px solid ${AD_BORDER}`, color: '#FFFFFF' }}",
    "style={{ border: '1px solid rgba(26,115,232,0.2)', background: 'rgba(10,20,40,0.85)' }}": "style={{ border: `1px solid ${AD_BORDER}`, background: '#FFFFFF' }}",
    "style={{ background: 'rgba(26,115,232,0.15)', borderColor: AD_SKY, boxShadow: '0 0 16px rgba(26,115,232,0.2)' }}": "style={{ background: AD_CARD, borderColor: AD_BORDER }}",
    "style={{ background: 'rgba(255,255,255,0.05)' }}": "style={{ background: AD_BG }}",
    "style={selectedMode === mode ? { borderColor: 'rgba(26,115,232,0.5)', background: 'rgba(26,115,232,0.15)', color: '#74B3F7' } : {}}": "style={selectedMode === mode ? { borderColor: AD_MID, background: AD_CARD, color: AD_MID } : {}}",
    "style={i === 0 ? { background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', borderColor: 'rgba(26,115,232,0.4)' } : {}}": "style={i === 0 ? { background: AD_MID, borderColor: AD_BORDER, color: '#FFFFFF' } : {}}",
    "bg-slate-900": "bg-slate-800",  # Just in case there are slate-900 texts on dark bg, but actually text-slate-900 is good on white.
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/ShelterPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ShelterPage list refactored successfully.")
