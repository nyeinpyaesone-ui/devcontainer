// ────────────────────────────────────────────────────────────────────────────
// services/fuzzy — subsequence matching with scoring and match-part extraction
// (score rewards consecutive runs and word-boundary hits; parts let the UI
// highlight exactly which characters matched)
// ────────────────────────────────────────────────────────────────────────────

export interface FuzzyPart {
  text: string;
  hit: boolean;
}

export interface FuzzyMatch {
  parts: FuzzyPart[];
  score: number;
}

export function fuzzyParts(query: string, text: string): FuzzyMatch | null {
  const q = query.trim().toLowerCase();
  if (!q) return { parts: [{ text, hit: false }], score: 1 };
  const t = text.toLowerCase();

  let qi = 0;
  let score = 0;
  let streak = 0;
  const hits = new Set<number>();

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      hits.add(ti);
      streak += 1;
      score += 1 + streak * 0.6;
      if (ti === 0 || /[\s\-_·/.]/.test(t[ti - 1])) score += 2.5; // word start
      qi += 1;
    } else {
      streak = 0;
    }
  }
  if (qi < q.length) return null; // not every query char was found
  score -= (t.length - q.length) * 0.05; // prefer tighter labels

  const parts: FuzzyPart[] = [];
  let cur = "";
  let curHit = false;
  for (let i = 0; i < text.length; i++) {
    const h = hits.has(i);
    if (i > 0 && h !== curHit) {
      parts.push({ text: cur, hit: curHit });
      cur = "";
    }
    cur += text[i];
    curHit = h;
  }
  if (cur) parts.push({ text: cur, hit: curHit });
  return { parts, score };
}

/** score-ordered filter over any list, given a text accessor */
export function fuzzyFilter<T>(items: T[], query: string, textOf: (item: T) => string): T[] {
  if (!query.trim()) return items;
  return items
    .map((item) => ({ item, m: fuzzyParts(query, textOf(item)) }))
    .filter((x): x is { item: T; m: FuzzyMatch } => x.m !== null)
    .sort((a, b) => b.m.score - a.m.score)
    .map((x) => x.item);
}
