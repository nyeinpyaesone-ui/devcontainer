import type { ReactNode } from "react";

/* Tiny sequential regex scanner → token spans. No deps, no lookbehind. */

interface Rule {
  re: RegExp; // sticky
  cls: string;
  /** require previous char to be whitespace / start of line */
  sp?: boolean;
}

const BASH: Rule[] = [
  { re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/gy, cls: "tk-s" },
  { re: /\$\{[^}]*\}|\$\([^)]*\)|\$[A-Za-z_]\w*/gy, cls: "tk-v" },
  { re: /#.*/gy, cls: "tk-c" },
  {
    re: /\b(?:if|then|else|elif|fi|for|in|do|done|while|until|case|esac|function|set|local|export|readonly|declare|return|exit|shift|exec|trap|source|command)\b/gy,
    cls: "tk-k",
  },
  { re: /--?[A-Za-z][\w-]*/gy, cls: "tk-f", sp: true },
  { re: /\b\d+(?:\.\d+)?\b/gy, cls: "tk-n" },
  { re: /[|&;<>(){}[\]=]+/gy, cls: "tk-p" },
];

const JSON_RULES: Rule[] = [
  { re: /"(?:[^"\\]|\\.)*"(?=\s*:)/gy, cls: "tk-key" },
  { re: /"(?:[^"\\]|\\.)*"/gy, cls: "tk-s" },
  { re: /\b(?:true|false|null)\b/gy, cls: "tk-b" },
  { re: /-?\d+(?:\.\d+)?/gy, cls: "tk-n" },
  { re: /[{}[\]:,]/gy, cls: "tk-p" },
];

const YAML_RULES: Rule[] = [
  { re: /\$\{\{[^}]*\}\}/gy, cls: "tk-v" },
  { re: /#.*/gy, cls: "tk-c", sp: true },
  { re: /"[^"]*"|'[^']*'/gy, cls: "tk-s" },
  { re: /[A-Za-z0-9_.$/-]+(?=\s*:)/gy, cls: "tk-key", sp: true },
  { re: /\b(?:true|false|null|always|on)\b/gy, cls: "tk-b" },
  { re: /\b\d+(?:\.\d+)?\b/gy, cls: "tk-n" },
  { re: /-(?=\s)/gy, cls: "tk-p", sp: true },
  { re: /[{}[\],]/gy, cls: "tk-p" },
];

const RULESETS: Record<string, Rule[]> = {
  bash: BASH,
  json: JSON_RULES,
  yaml: YAML_RULES,
};

function tokenizeLine(line: string, rules: Rule[]): ReactNode[] {
  const out: ReactNode[] = [];
  let pos = 0;
  let key = 0;
  let plain = "";

  const flush = () => {
    if (plain) {
      out.push(<span key={key++}>{plain}</span>);
      plain = "";
    }
  };

  while (pos < line.length) {
    let matched = false;
    const prev = pos === 0 ? " " : line[pos - 1];
    for (const r of rules) {
      if (r.sp && !/\s/.test(prev)) continue;
      r.re.lastIndex = pos;
      const m = r.re.exec(line);
      if (m && m.index === pos && m[0].length > 0) {
        flush();
        out.push(
          <span key={key++} className={r.cls}>
            {m[0]}
          </span>,
        );
        pos += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plain += line[pos];
      pos += 1;
    }
  }
  flush();
  return out;
}

export function Code({
  code,
  lang,
}: {
  code: string;
  lang: "bash" | "json" | "yaml";
}) {
  const rules = RULESETS[lang];
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <pre className="font-mono text-[12.5px] leading-[1.7] text-mist-300">
      {lines.map((ln, i) => (
        <div key={i} className="flex">
          <span className="w-11 shrink-0 select-none pr-4 text-right text-[11px] leading-[1.9] text-mist-600/60">
            {i + 1}
          </span>
          <span className="whitespace-pre pr-6">{tokenizeLine(ln, rules)}</span>
        </div>
      ))}
    </pre>
  );
}
