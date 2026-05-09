import os

css_files = [
    'src/components/report/EmergencyMode.css',
    'src/components/report/ModeratorPanel.css',
]

replacements = {
    "background: radial-gradient(circle at center, #1f2937 0%, #000000 100%);": "background: #F9FAFB;",
    "background: #111827;": "background: #F9FAFB;",
    "background: #1f2937;": "background: #E3F4FF;",
    "background: #374151;": "background: #C7D0DA;",
    "background: rgba(0, 0, 0, 0.3);": "background: #FFFFFF;",
    "background: rgba(0, 0, 0, 0.6);": "background: #F9FAFB;",
    "background: rgba(0, 0, 0, 0.8);": "background: rgba(249, 250, 251, 0.95);",
    "background: rgba(255, 255, 255, 0.03);": "background: #E3F4FF;",
    "background: rgba(255, 255, 255, 0.05);": "background: #FFFFFF;",
    "background: rgba(255, 255, 255, 0.1);": "background: #C7D0DA;",
    "background: rgba(17, 24, 39, 0.95);": "background: rgba(249, 250, 251, 0.95);",
    "background: rgba(31, 41, 55, 0.8);": "background: #E3F4FF;",
    
    "border: 1px solid rgba(255, 255, 255, 0.15);": "border: 1px solid #C7D0DA;",
    "border: 1px solid rgba(255, 255, 255, 0.1);": "border: 1px solid #C7D0DA;",
    "border: 1px solid rgba(255, 255, 255, 0.05);": "border: 1px solid #C7D0DA;",
    "border: 1px solid rgba(255, 255, 255, 0.2);": "border: 1px solid #C7D0DA;",
    "border-bottom: 1px solid rgba(255, 255, 255, 0.08);": "border-bottom: 1px solid #C7D0DA;",
    "border-color: rgba(255, 255, 255, 0.1);": "border-color: #C7D0DA;",
    
    "color: var(--text-primary);": "color: #0f172a;",
    "color: var(--text-secondary);": "color: #64748b;",
    "color: var(--text-muted);": "color: #64748b;",
    "color: white;": "color: #0f172a;",
    "color: #e5e7eb;": "color: #0f172a;",
    "color: #9ca3af;": "color: #64748b;",
    
    "border-color: white;": "border-color: #0f172a;",
    "box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);": "box-shadow: none;",
    "box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);": "box-shadow: none;",
    "box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);": "box-shadow: none;",
    
    # Specific colors
    "color: var(--accent-red);": "color: #dc2626;",
    "background: var(--accent-red);": "background: #dc2626;",
    "box-shadow: 0 0 10px var(--accent-red);": "box-shadow: none;",
    "text-shadow: 0 0 20px rgba(239, 68, 68, 0.4);": "text-shadow: none;",
    "background: rgba(239, 68, 68, 0.1);": "background: #fee2e2;",
    "color: #ef4444;": "color: #dc2626;",
    
    # Textarea in EmergencyMode
    "background: rgba(0, 0, 0, 0.4);": "background: #FFFFFF;",
    "color: #f3f4f6;": "color: #0f172a;",
    "box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);": "box-shadow: none;",
    
    # Camera box
    "background: #1f2937": "background: #E3F4FF",
}

for file_path in css_files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for old, new in replacements.items():
            content = content.replace(old, new)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Refactored {file_path}")

