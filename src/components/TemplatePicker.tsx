import { templates, type Template } from "../lib/templates";
import type { Config } from "../lib/generator";

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export default function TemplatePicker({ open, onClose, onSelect }: TemplatePickerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="backdrop-in absolute inset-0 bg-ink-950/80 backdrop-blur-[3px]" onClick={onClose} />
      <div className="modal-in absolute left-1/2 top-[10vh] w-[min(92vw,800px)] -translate-x-1/2 border border-ink-600 rounded-xl bg-ink-900 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-850 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 16 16" className="w-5 h-5 text-ember-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="5" height="5" rx="0.5" />
              <rect x="9" y="2" width="5" height="5" rx="0.5" />
              <rect x="2" y="9" width="5" height="5" rx="0.5" />
              <rect x="9" y="9" width="5" height="5" rx="0.5" />
            </svg>
            <h2 className="font-display font-semibold text-[16px] text-mist-100">Start from Template</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid place-items-center w-7 h-7 rounded-md text-mist-500 hover:text-mist-100 hover:bg-ink-700 transition-colors"
            aria-label="close"
          >
            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="1.6" fill="none">
              <path d="M2.5 2.5l7 7m0-7-7 7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="code-scroll max-h-[70vh] overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                className="group text-left border border-ink-700 rounded-lg bg-ink-850/50 p-4 transition-all hover:border-ember-500/50 hover:bg-ink-800 active:scale-[0.98]"
              >
                <div className="text-4xl mb-3">{template.icon}</div>
                <h3 className="font-display font-semibold text-[14px] text-mist-100 mb-1 group-hover:text-ember-300 transition-colors">
                  {template.name}
                </h3>
                <p className="font-body text-[12px] text-mist-500 leading-relaxed">
                  {template.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-mist-600">
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 1v10M1 6h10" strokeLinecap="round" />
                    </svg>
                    {template.config.features?.filter(f => f.on).length || 0} features
                  </span>
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="6" cy="6" r="4" />
                    </svg>
                    {template.config.ports?.length || 0} ports
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-ink-700/70 bg-ink-850 px-5 py-3 font-mono text-[10.5px] text-mist-600">
          <span className="text-mist-500">Tip:</span> Templates pre-configure features, toolchains, ports, and extensions. You can customize everything after selecting.
        </div>
      </div>
    </div>
  );
}
