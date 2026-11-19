import re

with open(r'scratch\GameClient_original.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove emerald/green colors for balanced state
content = re.sub(r'bg-emerald-500', r'bg-white', content)
content = re.sub(r'emerald-500', r'zinc-300', content)
content = re.sub(r'emerald-600', r'white', content)
content = re.sub(r'emerald-400', r'zinc-800', content)
content = re.sub(r'text-emerald-\d+', r'text-zinc-900', content)
content = re.sub(r'text-green-\d+', r'text-zinc-900', content)
content = re.sub(r'green-\d+', r'zinc-800', content)

# Change the card design
old_card_class = r'relative overflow-hidden glass-panel p-6 flex flex-col justify-between items-center group transition-all duration-500 hover:-translate-y-2 \$\{\s*isPositive\s*\?\s*"[^"]+"\s*:\s*isNegative\s*\?\s*"[^"]+"\s*:\s*"[^"]+"\s*\}'
new_card_class = r'relative overflow-hidden bg-white text-black border-[3px] rounded-xl p-6 flex flex-col justify-between items-center group transition-all duration-500 hover:-translate-y-2 shadow-xl '
content = re.sub(old_card_class, new_card_class, content, flags=re.MULTILINE|re.DOTALL)

# Make sure username and texts inside card are black/red
content = content.replace('text-zinc-900 dark:text-white capitalize', 'text-black capitalize')
content = content.replace('text-zinc-300', 'text-zinc-800')

# Change background of the score controls inside card to look like a chip area
content = content.replace('bg-[#022c22]/40 p-2 rounded-[1.5rem] border border-[#047857]/50 backdrop-blur-md', 'bg-zinc-100 p-2 rounded-full border-2 border-dashed border-zinc-300')
content = content.replace('bg-[#022c22] border border-[#047857]', 'bg-white border-2 border-zinc-900')
content = content.replace('placeholder:text-zinc-500', 'placeholder:text-zinc-400 text-black')

# Change the chips to look round
content = content.replace('py-4 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl', 'w-16 h-16 rounded-full bg-white hover:bg-zinc-100 text-black border-4 border-dashed border-zinc-800 flex items-center justify-center')
content = content.replace('py-4 px-6 bg-red-50/50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl', 'w-16 h-16 rounded-full bg-red-600 text-white border-4 border-dashed border-red-800 flex items-center justify-center font-bold text-xs')

# Fix the 'TND' color inside card
content = content.replace('isPositive ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" : isNegative ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]" : "text-zinc-300"', 'isPositive ? "text-black" : isNegative ? "text-red-600" : "text-zinc-800"')

# Fix 'PERFECT' badge
content = content.replace('bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', 'bg-white/20 text-white border border-white/40')

with open(r'scratch\GameClient_modified.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

