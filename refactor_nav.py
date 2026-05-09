import os

with open('src/pages/NavigationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "bg-slate-800/95": "bg-[#E3F4FF]/95",
    "border-white/5": "border-[#C7D0DA]",
    "bg-gradient-to-b from-slate-900/[0.98] via-slate-900/85 to-transparent": "bg-gradient-to-b from-[#F9FAFB]/[0.98] via-[#F9FAFB]/85 to-transparent",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/NavigationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("NavigationPage refactored successfully.")
