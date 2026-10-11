import React, { useState } from 'react';
import { Copy, Check, Terminal, Server, Rocket } from 'lucide-react';

export function SetupGuideSection() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  const envSnippet = `GEMINI_API_KEY="your_google_ai_studio_api_key_here"
PORT=3000`;

  const curlSnippet = `curl -X POST http://localhost:3000/api/generate-mission \\
  -H "Content-Type: application/json" \\
  -d '{
    "duration": 15,
    "mood": "Curious",
    "activity": "Nature Exploration"
  }'`;

  const deploySnippet = `# 1. Install dependencies & build production frontend
npm install
npm run build

# 2. Start the production Express + Gemma 4 server
NODE_ENV=production GEMINI_API_KEY="your_api_key" npm start`;

  return (
    <section
      id="guide"
      className="py-16 border-t border-[#DCE5DC] bg-[#F4F8F4]"
      aria-labelledby="guide-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#475D50]">
            <span>Open-Source Documentation</span>
            <span aria-hidden="true">·</span>
            <span>Hacktoberfest 2026 Week 1</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">gemma-4-26b-a4b-it</span>
          </div>
          <h2
            id="guide-heading"
            className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#14261C] tracking-tight"
          >
            API Key Configuration, Real Gemma 4 Testing & Deployment
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#475D50]">
            TouchGrass AI keeps your API credentials strictly on the server inside{' '}
            <code className="font-mono text-xs bg-[#E5EFE7] px-1.5 py-0.5 rounded text-[#14261C]">
              server.ts
            </code>{' '}
            using the official{' '}
            <code className="font-mono text-xs bg-[#E5EFE7] px-1.5 py-0.5 rounded text-[#14261C]">
              @google/genai
            </code>{' '}
            SDK. The browser never sees or bundles your API key.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: API Key Setup */}
          <div className="rounded-2xl border border-[#DCE5DC] bg-white p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[#2D6A4F] font-semibold">
                  01. Server API Key Setup
                </span>
                <Server className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <h3 className="mt-2 font-serif text-lg font-semibold text-[#14261C]">
                Configure GEMINI_API_KEY
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#475D50] leading-relaxed">
                In Google AI Studio, add{' '}
                <code className="font-mono text-xs text-[#14261C]">GEMINI_API_KEY</code> in the{' '}
                <strong>Settings &gt; Secrets</strong> panel. For local development, copy{' '}
                <code className="font-mono text-xs text-[#14261C]">.env.example</code> to{' '}
                <code className="font-mono text-xs text-[#14261C]">.env</code> and set your key:
              </p>
            </div>

            <div className="mt-4">
              <div className="relative rounded-xl bg-[#14261C] text-[#E6F2EA] p-3.5 font-mono text-xs overflow-x-auto">
                <button
                  type="button"
                  onClick={() => handleCopy('env', envSnippet)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF9F5] transition-colors cursor-pointer"
                  title="Copy .env configuration"
                >
                  {copiedId === 'env' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <pre className="pr-8 leading-relaxed">{envSnippet}</pre>
              </div>
            </div>
          </div>

          {/* Card 2: Testing the Real Gemma Call */}
          <div className="rounded-2xl border border-[#DCE5DC] bg-white p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[#2D6A4F] font-semibold">
                  02. Verify Gemma 4 Endpoint
                </span>
                <Terminal className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <h3 className="mt-2 font-serif text-lg font-semibold text-[#14261C]">
                Test Real Gemma 4 API Call
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#475D50] leading-relaxed">
                Click <strong>Generate My Mission</strong> above or run this terminal request to verify live JSON mission synthesis from{' '}
                <code className="font-mono text-xs text-[#14261C]">gemma-4-26b-a4b-it</code>:
              </p>
            </div>

            <div className="mt-4">
              <div className="relative rounded-xl bg-[#14261C] text-[#E6F2EA] p-3.5 font-mono text-xs overflow-x-auto">
                <button
                  type="button"
                  onClick={() => handleCopy('curl', curlSnippet)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF9F5] transition-colors cursor-pointer"
                  title="Copy curl command"
                >
                  {copiedId === 'curl' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <pre className="pr-8 leading-relaxed">{curlSnippet}</pre>
              </div>
            </div>
          </div>

          {/* Card 3: Production Deployment */}
          <div className="rounded-2xl border border-[#DCE5DC] bg-white p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[#2D6A4F] font-semibold">
                  03. Build & Cloud Deployment
                </span>
                <Rocket className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <h3 className="mt-2 font-serif text-lg font-semibold text-[#14261C]">
                Deploy Full-Stack App
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#475D50] leading-relaxed">
                Deploy directly via AI Studio Cloud Run publishing or any Node.js 22+ container host (Cloud Run, Render, Fly.io, Railway) with{' '}
                <code className="font-mono text-xs text-[#14261C]">GEMINI_API_KEY</code> set as a secret:
              </p>
            </div>

            <div className="mt-4">
              <div className="relative rounded-xl bg-[#14261C] text-[#E6F2EA] p-3.5 font-mono text-xs overflow-x-auto">
                <button
                  type="button"
                  onClick={() => handleCopy('deploy', deploySnippet)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF9F5] transition-colors cursor-pointer"
                  title="Copy deployment commands"
                >
                  {copiedId === 'deploy' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <pre className="pr-8 leading-relaxed">{deploySnippet}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
