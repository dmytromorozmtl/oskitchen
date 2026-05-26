#!/usr/bin/env python3
"""One-off: replace unsafe `res?.error` client checks with getActionError() for ActionResult unions."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMPORT = 'import { getActionError } from "@/lib/action-result";'

REPLACEMENTS = [
    (re.compile(r"if\s*\(\s*(\w+)\?\.error\s*\)\s*toast\.error\(\1\.error\)"), r'const _err = getActionError(\1); if (_err) toast.error(_err)'),
    (re.compile(r"if\s*\(\s*(\w+)\?\.error\s*\)\s*\{?\s*toast\.error\(\1\.error\)"), r'const _err = getActionError(\1); if (_err) { toast.error(_err)'),
    (re.compile(r"if\s*\(\s*(\w+)\?\.error\s*\)\s*\{"), r'const _err = getActionError(\1); if (_err) {'),
    (re.compile(r"toast\.error\(\s*(\w+)\.error\s*\)"), r'toast.error(getActionError(\1) ?? "Something went wrong")'),
    (re.compile(r"setError\(\s*(\w+)\.error\s*\)"), r'setError(getActionError(\1) ?? "Something went wrong")'),
    (re.compile(r"if\s*\(\s*(\w+)\?\.error\s*\)\s*return"), r'if (getActionError(\1)) return'),
]


def ensure_import(text: str) -> str:
    if "getActionError" not in text or IMPORT in text:
        return text
    if '"use client"' in text:
        return text.replace('"use client";\n', '"use client";\n\n' + IMPORT + "\n", 1)
    return IMPORT + "\n\n" + text


def main() -> None:
    changed: list[str] = []
    for path in (ROOT / "components").rglob("*.tsx"):
        text = path.read_text(encoding="utf-8")
        if ".error" not in text and "?.error" not in text:
            continue
        original = text
        for pattern, repl in REPLACEMENTS:
            text = pattern.sub(repl, text)
        # Fix blocks that only checked error but still reference .error inside
        text = re.sub(
            r"const _err = getActionError\((\w+)\); if \(_err\) \{\s*toast\.error\(\1\.error\)",
            r"const _err = getActionError(\1); if (_err) { toast.error(_err)",
            text,
        )
        if text != original:
            text = ensure_import(text)
            path.write_text(text, encoding="utf-8")
            changed.append(str(path.relative_to(ROOT)))
    print(f"Updated {len(changed)} files")
    for c in changed:
        print(f"  {c}")


if __name__ == "__main__":
    main()
