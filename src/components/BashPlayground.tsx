import { useState, useRef, useEffect } from "react";

interface BashPlaygroundProps {
  onClose: () => void;
}

interface CommandResult {
  command: string;
  output: string;
  exitCode: number;
  timestamp: number;
}

const MOCK_COMMANDS: Record<string, { output: string; exitCode: number }> = {
  "ls": { output: "devcontainer.json  Dockerfile  setup-env.sh  README.md", exitCode: 0 },
  "ls -la": { output: "total 24\ndrwxr-xr-x  4 vscode vscode 4096 Jan 15 10:30 .\ndrwxr-xr-x  1 root   root   4096 Jan 15 10:25 ..\n-rw-r--r--  1 vscode vscode  512 Jan 15 10:30 devcontainer.json\n-rw-r--r--  1 vscode vscode 1024 Jan 15 10:30 Dockerfile\n-rwxr-xr-x  1 vscode vscode 2048 Jan 15 10:30 setup-env.sh\n-rw-r--r--  1 vscode vscode  768 Jan 15 10:30 README.md", exitCode: 0 },
  "pwd": { output: "/workspaces/ERP", exitCode: 0 },
  "whoami": { output: "vscode", exitCode: 0 },
  "node --version": { output: "v20.11.0", exitCode: 0 },
  "npm --version": { output: "10.2.4", exitCode: 0 },
  "git --version": { output: "git version 2.43.0", exitCode: 0 },
  "rustc --version": { output: "rustc 1.75.0 (82e1608df 2023-12-21)", exitCode: 0 },
  "go version": { output: "go version go1.21.6 linux/amd64", exitCode: 0 },
  "python --version": { output: "Python 3.12.1", exitCode: 0 },
  "docker --version": { output: "Docker version 25.0.2, build 29cf602", exitCode: 0 },
  "cat /etc/os-release": { output: "PRETTY_NAME=\"Ubuntu 24.04 LTS\"\nNAME=\"Ubuntu\"\nVERSION_ID=\"24.04\"\nVERSION=\"24.04 LTS (Noble Numbat)\"\nID=ubuntu\nID_LIKE=debian", exitCode: 0 },
  "echo $SHELL": { output: "/usr/bin/zsh", exitCode: 0 },
  "echo $PATH": { output: "/home/vscode/.cargo/bin:/usr/local/go/bin:/home/vscode/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin", exitCode: 0 },
  "df -h": { output: "Filesystem      Size  Used Avail Use% Mounted on\noverlay          50G   12G   38G  24% /\ntmpfs            64M     0   64M   0% /dev\nshm              64M     0   64M   0% /dev/shm", exitCode: 0 },
  "free -h": { output: "              total        used        free      shared  buff/cache   available\nMem:           7.8Gi       2.1Gi       3.2Gi       156Mi       2.5Gi       5.4Gi\nSwap:          2.0Gi          0B       2.0Gi", exitCode: 0 },
  "ps aux": { output: "USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nvscode         1  0.0  0.1  10240  2048 ?        Ss   10:25   0:00 /sbin/init\nvscode       123  0.5  2.3 456789 12345 ?        Sl   10:26   0:01 node server.js\nvscode       456  0.1  0.5  23456  5678 ?        S    10:27   0:00 zsh", exitCode: 0 },
  "help": { output: "Available commands:\n  ls, ls -la          List directory contents\n  pwd                 Print working directory\n  whoami              Display current user\n  node --version      Show Node.js version\n  npm --version       Show npm version\n  git --version       Show git version\n  rustc --version     Show Rust version\n  go version          Show Go version\n  python --version    Show Python version\n  docker --version    Show Docker version\n  cat /etc/os-release Show OS information\n  echo $SHELL         Show current shell\n  echo $PATH          Show PATH variable\n  df -h               Show disk usage\n  free -h             Show memory usage\n  ps aux              Show running processes\n  clear               Clear terminal\n  help                Show this help", exitCode: 0 },
};

export default function BashPlayground({ onClose }: BashPlaygroundProps) {
  const [history, setHistory] = useState<CommandResult[]>([
    {
      command: "help",
      output: MOCK_COMMANDS["help"].output,
      exitCode: 0,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = () => {
    const cmd = input.trim();
    if (!cmd) return;

    if (cmd === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    const result = MOCK_COMMANDS[cmd] || {
      output: `bash: ${cmd}: command not found`,
      exitCode: 127,
    };

    setHistory([
      ...history,
      {
        command: cmd,
        output: result.output,
        exitCode: result.exitCode,
        timestamp: Date.now(),
      },
    ]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl w-[90vw] max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-coral-500"></div>
              <div className="w-3 h-3 rounded-full bg-ember-500"></div>
              <div className="w-3 h-3 rounded-full bg-lagoon-500"></div>
            </div>
            <h2 className="text-lg font-semibold text-mist-100">
              Interactive Bash Playground
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-mist-500 hover:text-mist-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Terminal */}
        <div
          ref={historyRef}
          className="flex-1 overflow-y-auto bg-ink-950 p-4 font-mono text-sm"
        >
          {history.map((item, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex items-center gap-2 text-lagoon-400">
                <span className="text-ember-400">vscode@devcontainer</span>
                <span className="text-mist-500">:</span>
                <span className="text-skyx-400">~/ERP</span>
                <span className="text-mist-500">$</span>
                <span className="text-mist-100">{item.command}</span>
              </div>
              <pre className="text-mist-300 whitespace-pre-wrap mt-1 pl-4">
                {item.output}
              </pre>
              {item.exitCode !== 0 && (
                <div className="text-coral-400 text-xs mt-1 pl-4">
                  [Exit code: {item.exitCode}]
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-ink-700 p-4 bg-ink-900">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-ember-400">vscode@devcontainer</span>
            <span className="text-mist-500">:</span>
            <span className="text-skyx-400">~/ERP</span>
            <span className="text-mist-500">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-mist-100 outline-none"
              placeholder="Type a command... (try 'help')"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-ink-700 px-6 py-3 bg-ink-800 text-xs text-mist-500">
          <span className="text-mist-400">💡 Tip:</span> Try commands like{" "}
          <code className="text-lagoon-400">ls</code>,{" "}
          <code className="text-lagoon-400">node --version</code>, or{" "}
          <code className="text-lagoon-400">docker --version</code>
        </div>
      </div>
    </div>
  );
}
