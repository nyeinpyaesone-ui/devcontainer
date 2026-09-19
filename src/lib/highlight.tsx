import type { ReactNode } from "react";

// Lightweight line-based tokenizer → React spans. No innerHTML, no deps.

export type Lang = "bash" | "json" | "dockerfile" | "yaml" | "markdown" | "makefile";

const BASH_RE =
  /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\$\{[^}]*\}|\$[A-Za-z_]\w*|\$\?|\$\*)|\b(if|then|else|elif|fi|for|while|do|done|case|esac|in|function|set|export|local|readonly|trap|exit|return|umask|shift)\b|\b(echo|printf|cd|mkdir|chmod|command|docker|git|cat|curl|bash|sh|zsh|source|exec|read|numfmt|tr|awk|grep|wc|sudo|apt-get|npm|npx|node|devcontainer|code|install|pull|login|run|clone|image|info|export|die|ok|log|warn|chmod)\b|(^|\s)(--?[A-Za-z][\w-]*)|(\b\d+(?:\.\d+)?\b)/g;

const JSON_RE =
  /("(?:[^"\\]|\\.)*")(\s*:)|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b|([{}[\],])/g;

const DOCKER_RE =
  /(#.*$)|^(FROM|ARG|RUN|ENV|LABEL|USER|WORKDIR|COPY|ADD|ENTRYPOINT|CMD|EXPOSE|AS)\b|\b(FROM|ARG|RUN|ENV|LABEL|USER|WORKDIR|COPY|ADD|ENTRYPOINT|CMD|EXPOSE|AS)\b|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\$\{?\w+\}?|--?[A-Za-z][\w-]*)|(\b\d+(?:\.\d+)?\b)/g;

const CLS = ["tk-c", "tk-s", "tk-v", "tk-k", "tk-b", "tk-f", "tk-n"];

function tokenize(line: string, re: RegExp, groupCls: (string | null)[]): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(line.slice(last, m.index));
    let cls: string | null = null;
    for (let g = 1; g < m.length; g++) {
      if (m[g] !== undefined) {
        cls = groupCls[g - 1] ?? null;
        break;
      }
    }
    const text = m[0];
    out.push(
      cls ? (
        <span key={key++} className={cls}>
          {text}
        </span>
      ) : (
        text
      )
    );
    last = m.index + text.length;
    if (text.length === 0) re.lastIndex++;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

const BASH_GROUPS: (string | null)[] = [
  "tk-c", // 1 comment
  "tk-s", // 2 string
  "tk-v", // 3 variable
  "tk-k", // 4 keyword
  "tk-b", // 5 command
  null, // 6 leading-space capture for flags
  "tk-f", // 7 flag
  "tk-n", // 8 number
];

const JSON_GROUPS: (string | null)[] = [
  "tk-key", // 1 key string
  null, // 2 colon capture
  "tk-s", // 3 value string
  "tk-n", // 4 number
  "tk-k", // 5 bool/null
  "tk-p", // 6 punctuation
];

const DOCKER_GROUPS: (string | null)[] = [
  "tk-c", // 1 comment
  "tk-k", // 2 instruction (line-start)
  "tk-k", // 3 instruction
  "tk-s", // 4 string
  "tk-v", // 5 variable/flag
  "tk-n", // 6 number
];

const YAML_RE =
  /(#.*$)|(\$\{\{[^}]*\}\})|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(^\s*- )|(^\s*[\w.-]+(?=\s*:))|(::?error::|::warning::)|\b(true|false|null)\b|(\b\d+(?:\.\d+)?\b)/g;

const YAML_GROUPS: (string | null)[] = [
  "tk-c", // 1 comment
  "tk-v", // 2 ${{ expr }}
  "tk-s", // 3 string
  "tk-p", // 4 list marker
  "tk-key", // 5 key
  "tk-k", // 6 workflow command
  "tk-k", // 7 bool/null
  "tk-n", // 8 number
];

const MARKDOWN_RE =
  /^(#{1,6}\s)|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*]+\*|_[^_]+_)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(^>\s)|(^-\s|^\d+\.\s)|(\[x\]|\[ \])/gi;

const MARKDOWN_GROUPS: (string | null)[] = [
  "tk-k", // 1 heading
  "tk-b", // 2 bold
  "tk-f", // 3 italic
  "tk-s", // 4 inline code
  "tk-v", // 5 link
  "tk-c", // 6 blockquote
  "tk-p", // 7 list marker
  "tk-n", // 8 checkbox
];

const MAKEFILE_RE =
  /(#.*$)|(^[\w-]+(?=\s*:))|(^\t.+)|(\$\([^)]+\)|\$\{[^}]+\})|(\bPHONY\b|\bSHELL\b|\bMAKE\b)/g;

const MAKEFILE_GROUPS: (string | null)[] = [
  "tk-c", // 1 comment
  "tk-key", // 2 target
  "tk-b", // 3 recipe
  "tk-v", // 4 variable
  "tk-k", // 5 special
];

// Bounded memoization: identical (lang, line) pairs tokenize once. Lines are
// immutable strings, so this is safe; we cap the cache to bound memory.
const hlCache = new Map<string, ReactNode>();
const HL_CACHE_MAX = 6000;

export function highlightLine(line: string, lang: Lang): ReactNode {
  const key = lang + "\u0000" + line;
  const hit = hlCache.get(key);
  if (hit !== undefined) return hit;
  let node: ReactNode;
  if (lang === "json") node = tokenize(line, JSON_RE, JSON_GROUPS);
  else if (lang === "dockerfile") node = tokenize(line, DOCKER_RE, DOCKER_GROUPS);
  else if (lang === "yaml") node = tokenize(line, YAML_RE, YAML_GROUPS);
  else if (lang === "markdown") node = tokenize(line, MARKDOWN_RE, MARKDOWN_GROUPS);
  else if (lang === "makefile") node = tokenize(line, MAKEFILE_RE, MAKEFILE_GROUPS);
  else node = tokenize(line, BASH_RE, BASH_GROUPS);
  if (hlCache.size >= HL_CACHE_MAX) hlCache.clear();
  hlCache.set(key, node);
  return node;
}

export function countLines(s: string): number {
  return s.split("\n").length;
}
