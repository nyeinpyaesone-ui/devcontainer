import type { ReactNode } from "react";

// Lightweight line-based tokenizer → React spans. No innerHTML, no deps.

export type Lang = "bash" | "json" | "dockerfile";

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

export function highlightLine(line: string, lang: Lang): ReactNode {
  if (lang === "json") return tokenize(line, JSON_RE, JSON_GROUPS);
  if (lang === "dockerfile") return tokenize(line, DOCKER_RE, DOCKER_GROUPS);
  return tokenize(line, BASH_RE, BASH_GROUPS);
}

export function countLines(s: string): number {
  return s.split("\n").length;
}
