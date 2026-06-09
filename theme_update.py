import os
import glob

components_dir = r"d:\Cepilabs works\Ai Avtar\frontend\src\components"
files = glob.glob(os.path.join(components_dir, "*.jsx"))

replacements = {
    "bg-slate-900/60": "bg-white/80",
    "bg-slate-900/50": "bg-white",
    "bg-slate-900": "bg-white",
    "bg-slate-800/60": "bg-slate-100",
    "bg-slate-800/40": "bg-slate-100",
    "bg-slate-800": "bg-slate-50",
    "text-white": "text-slate-900",
    "text-gray-400": "text-slate-500",
    "text-gray-100": "text-slate-800",
    "text-gray-200": "text-slate-800",
    "text-cyan-400": "text-teal-700",
    "text-cyan-500": "text-teal-600",
    "text-cyan-100": "text-teal-800",
    "text-cyan-200": "text-teal-700",
    "text-cyan-50": "text-teal-900",
    "bg-cyan-900/40": "bg-teal-100",
    "bg-cyan-900/30": "bg-teal-50",
    "bg-cyan-900/80": "bg-teal-100",
    "bg-cyan-900": "bg-teal-100",
    "bg-cyan-600": "bg-teal-500",
    "bg-cyan-500": "bg-teal-500",
    "bg-cyan-400": "bg-teal-400",
    "bg-cyan-300": "bg-teal-300",
    "bg-cyan-950": "bg-teal-50",
    "border-cyan-500/30": "border-teal-200",
    "border-cyan-500/40": "border-teal-200",
    "border-cyan-500/50": "border-teal-300",
    "border-cyan-500/20": "border-teal-100",
    "border-cyan-500": "border-teal-300",
    "border-cyan-400": "border-teal-200",
    "border-white/10": "border-slate-200",
    "border-slate-700": "border-slate-300",
    "border-slate-600/30": "border-slate-200",
    "border-slate-600": "border-slate-200",
    "placeholder-gray-500": "placeholder-slate-400",
    "shadow-[0_0_50px_rgba(6,182,212,0.15)]": "shadow-soft",
    "shadow-[0_0_30px_rgba(6,182,212,0.15)]": "shadow-soft",
    "shadow-[0_0_20px_rgba(34,211,238,0.3)]": "shadow-sm",
    "shadow-[0_0_30px_rgba(34,211,238,0.6)]": "shadow-md",
    "shadow-[0_0_20px_rgba(6,182,212,0.3)]": "shadow-sm",
    "shadow-[0_0_30px_rgba(6,182,212,0.5)]": "shadow-md",
    "shadow-[0_0_10px_cyan]": "shadow-sm",
    "text-white/20": "text-slate-400",
    "text-slate-400": "text-slate-500",
    "hover:bg-white/10": "hover:bg-slate-100",
    "hover:text-white": "hover:text-teal-700",
    "bg-black/50": "bg-white",
    "bg-black/80": "bg-white/90"
}

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Theme update complete.")
