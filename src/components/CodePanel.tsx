import { useMemo, useState } from "react";
import { Code } from "../lib/highlight";
import type { GeneratedFile } from "../lib/generate";
import { CopyBtn, DownloadBtn } from "./ui";

export function CodePanel({ files }: { files: GeneratedFile[] }) {
  const [active, setActive] = useState(0);
  const file = files[active];

  const stats = useMemo(
    () => ({
      lines: file.content.split("\n").length - 1,
      kb: (new Blob([file.content]).size / 1024).toFixed(1),
    }),
    [file],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-900/90 shadow-[0_24px_70px_rgba(3,6,14,0.55)]">
      {/* tab strip */}
      <div className="flex items-end gap-1 overflow-x-auto border-b border-ink-700/80 bg-ink-850 px-3 pt-2">
        {files.map((f, i) => {
          const on = i === active;
          return (
            <button
              key={f.path}
              onClick={() => setActive(i)}
              className={`relative shrink-0 rounded-t-md px-3.5 py-2 font-mono text-[11.5px] transition-colors duration-200 ${
                on ? "text-ember-300" : "text-mist-600 hover:text-mist-300"
              }`}
            >
              {f.name}
              <span
                className={`absolute inset-x-2 top-0 h-[2px] rounded-full transition-all duration-300 ${
                  on ? "bg-ember-500 opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* path bar */}
      <div className="flex items-center gap-2 border-b border-ink-700/60 bg-ink-900 px-4 py-2.5">
        <span className="font-mono text-[11.5px] text-mist-500">
          <span className="text-mist-600">nyeinpysone-ui/ERP</span>
          <span className="text-ink-600"> / </span>
          <span className="text-lagoon-300">{file.path.replace(/^\.\//, "")}</span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          <CopyBtn text={file.content} />
          <DownloadBtn filename={file.name} content={file.content} label="Download" />
        </div>
      </div>

      {/* code */}
      <div className="max-h-[560px] overflow-auto bg-ink-950/80 py-4">
        <Code code={file.content} lang={file.lang} />
      </div>

      {/* status bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-700/60 bg-ink-850 px-4 py-2.5">
        <span className="min-w-0 flex-1 truncate text-[12px] text-mist-500">{file.desc}</span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mist-600">
          {file.lang} · {stats.lines} ln · {stats.kb} kb
        </span>
      </div>
    </div>
  );
}
