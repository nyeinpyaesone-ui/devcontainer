import { useMemo, useState } from "react";
import { countLines, highlightLine, type Lang } from "../lib/highlight";
import { byteSize, shortHash } from "../lib/generator";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  Kbd,
  copyText,
  downloadFile,
} from "./ui";

export interface FileTab {
  name: string;
  lang: Lang;
  badge: string;
  content: string;
}

function useCopied() {
  const [copied, setCopied] = useState<string | null>(null);
  const mark = (id: string) => {
    setCopied(id);
    window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
  };
  return { copied, mark };
}

export default function CodePanel({
  files,
  onToast,
  active,
  onTabChange,
}: {
  files: FileTab[];
  onToast: (msg: string) => void;
  active: number;
  onTabChange: (i: number) => void;
}) {
  const { copied, mark } = useCopied();
  const file = files[active];

  const lines = useMemo(() => file.content.split("\n"), [file.content]);
  const hash = useMemo(() => shortHash(file.content), [file.content]);

  const doCopy = async (id: string, text: string, label: string) => {
    if (await copyText(text)) {
      mark(id);
      onToast(`${label} copied to clipboard`);
    } else {
      onToast("Clipboard unavailable in this browser");
    }
  };

  const doDownload = (f: FileTab) => {
    downloadFile(f.name, f.content);
    onToast(`${f.name} downloaded`);
  };

  return (
    <div className="flex flex-col border border-ink-700/80 rounded-xl overflow-hidden bg-ink-900/80 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.8)]">
      {/* tab strip */}
      <div className="flex items-stretch border-b border-ink-700/70 bg-ink-850/80 overflow-x-auto code-scroll">
        {files.map((f, i) => {
          const isActive = i === active;
          return (
            <button
              key={f.name}
              type="button"
              onClick={() => onTabChange(i)}
              className={`relative shrink-0 flex items-center gap-2 px-4 py-2.5 font-mono text-[12px] transition-colors duration-200 ${
                isActive
                  ? "text-ember-300 bg-ink-900"
                  : "text-mist-500 hover:text-mist-300 hover:bg-ink-800/60"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isActive ? "bg-ember-500" : "bg-ink-600"
                }`}
              />
              {f.name}
              <span
                className={`text-[9.5px] uppercase tracking-[0.1em] px-1.5 py-px rounded border ${
                  isActive
                    ? "border-ember-500/40 text-ember-400/90"
                    : "border-ink-600 text-mist-600"
                }`}
              >
                {f.badge}
              </span>
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-ember-500" />
              )}
            </button>
          );
        })}
        <div className="ml-auto hidden md:flex items-center gap-2 pr-3">
          <button
            type="button"
            onClick={() => doCopy(`tab-${active}`, file.content, file.name)}
            className="flex items-center gap-1.5 rounded-md border border-ink-600 px-2.5 py-1.5 text-[11px] font-mono text-mist-300 transition-all hover:border-ember-500/50 hover:text-ember-300 active:scale-95"
          >
            {copied === `tab-${active}` ? (
              <IconCheck className="w-3 h-3 text-lagoon-400" />
            ) : (
              <IconCopy className="w-3 h-3" />
            )}
            copy
          </button>
          <button
            type="button"
            onClick={() => doDownload(file)}
            className="flex items-center gap-1.5 rounded-md border border-ink-600 px-2.5 py-1.5 text-[11px] font-mono text-mist-300 transition-all hover:border-lagoon-500/50 hover:text-lagoon-300 active:scale-95"
          >
            <IconDownload className="w-3 h-3" />
            save
          </button>
        </div>
      </div>

      {/* code body */}
      <div
        key={file.name}
        className="code-in code-scroll scanlines overflow-auto max-h-[56vh] min-h-[380px] lg:max-h-[calc(100vh-330px)] bg-ink-950/60"
      >
        <pre className="flex text-[12.5px] leading-[1.62] font-mono py-3">
          <div
            aria-hidden
            className="select-none sticky left-0 shrink-0 border-r border-ink-700/60 bg-ink-950/90 px-3 text-right text-mist-600/70"
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
            <div className="text-ink-700">·</div>
          </div>
          <code className="px-4 whitespace-pre text-mist-300">
            {lines.map((ln, i) => (
              <div key={i} className="hover:bg-skyx-400/[0.04]">
                {highlightLine(ln, file.lang) || " "}
              </div>
            ))}
            <div>
              <span className="caret inline-block w-[7px] h-[15px] translate-y-[2px] bg-ember-500/90" />
            </div>
          </code>
        </pre>
      </div>

      {/* status strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-700/70 bg-ink-850/80 px-4 py-2 font-mono text-[11px] text-mist-600">
        <span className="flex items-center gap-1.5">
          <span className="led-live w-1.5 h-1.5 rounded-full bg-lagoon-400" />
          regenerated live
        </span>
        <span>
          {countLines(file.content)} lines · {byteSize(file.content)}
        </span>
        <span className="text-mist-500">
          sha-like <span className="text-ember-400/90">{hash}</span>
        </span>
        <span className="hidden sm:inline text-mist-600">{file.lang} · utf-8 · lf</span>
        <span className="ml-auto hidden lg:flex items-center gap-1.5 text-mist-600">
          <Kbd>⌘</Kbd>
          <Kbd>1–4</Kbd>
          tabs
          <span className="mx-1 text-ink-600">·</span>
          <Kbd>⌘S</Kbd>
          save all
          <span className="mx-1 text-ink-600">·</span>
          <Kbd>⌘⏎</Kbd>
          dry-run
        </span>
      </div>
    </div>
  );
}
