import re
import glob
import os

files_to_check = glob.glob('app/**/*.tsx', recursive=True) + glob.glob('components/**/*.tsx', recursive=True)

for filepath in files_to_check:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    content = re.sub(r'emerald-\d+', 'white', content)
    content = re.sub(r'green-\d+', 'white', content)
    content = re.sub(r'orange-\d+', 'red-600', content)
    content = re.sub(r'blue-\d+', 'zinc-400', content)
    content = re.sub(r'indigo-\d+', 'zinc-400', content)

    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
