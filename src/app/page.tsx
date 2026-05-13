'use client';

const GITHUB_URL = 'https://github.com/mohd-riaz/StashChat';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import NextImage from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  SquarePen, Search, Globe, Link, CornerDownLeft, ArrowRight, Settings,
  PanelLeft, Sparkles, Shield, Cpu, HardDrive, Check, X,
  ChevronDown, Sun, Moon, ImageIcon,
} from 'lucide-react';

function Logo({ size = 28 }: { size?: number }) {
  const h = Math.round(size * 356 / 345);
  return (
    <>
      <NextImage className="dark:hidden" src="/stash-chat-light.svg" width={size} height={h} alt="" aria-hidden priority />
      <NextImage className="hidden dark:block" src="/stash-chat-dark.svg" width={size} height={h} alt="" aria-hidden />
    </>
  );
}

function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <span style={{ fontSize: size }} className="font-semibold leading-none tracking-[-0.01em] text-foreground">
      Stash<span className="text-primary-deep">Chat</span>
    </span>
  );
}

function Brand({ textSize = 17 }: { textSize?: number }) {
  return (
    <span className="inline-flex items-center gap-2.25 leading-none">
      <Logo size={Math.round(textSize * 1.15)} />
      <Wordmark size={textSize} />
    </span>
  );
}

function GithubIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.49-1.11-1.49-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.04A9.4 9.4 0 0 1 12 6.95c.85 0 1.71.12 2.51.34 1.91-1.31 2.75-1.04 2.75-1.04.55 1.41.2 2.45.1 2.71.64.71 1.03 1.62 1.03 2.74 0 3.93-2.34 4.79-4.57 5.05.36.32.68.93.68 1.88v2.79c0 .27.18.59.69.49A10.18 10.18 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/>
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-xs text-primary-deep uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      {children}
    </div>
  );
}

function Nav({ onToggleTheme }: { onToggleTheme: () => void }) {
  return (
    <nav className="sticky top-0 z-30 border-b border-border backdrop-blur-sm [background:color-mix(in_oklch,var(--background)_65%,transparent)]">
      <div className="flex items-center justify-between mx-auto max-w-300 px-4 sm:px-7 py-3.5">
        <a href="#" className="inline-flex no-underline"><Brand textSize={17} /></a>
        <div className="hidden md:flex items-center gap-1 text-sm">
          {([['Why', '#why'], ['Models', '#models'], ['How it works', '#how'], ['FAQ', '#faq']] as const).map(([t, h]) => (
            <a key={t} href={h} className="px-3 py-2 text-muted-foreground no-underline rounded-md">{t}</a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
            <Moon className="dark:hidden" />
            <Sun className="hidden dark:block" />
          </Button>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden sm:inline-flex text-muted-foreground gap-1.5')}>
            <GithubIcon size={14} /> GitHub
          </a>
          <a href="/chat" className={cn(buttonVariants({ size: 'sm' }), 'h-auto py-1.5 px-3')}>Open StashChat</a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="grid items-center mx-auto max-w-310 px-4 sm:px-7 pt-12 sm:pt-18 pb-10 sm:pb-14 gap-8 lg:gap-14 grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border text-muted-foreground px-2.75 py-1.25 text-[12px]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            No sign-up. No accounts. Free to use.
          </div>
          <h1 className="font-semibold text-foreground text-[clamp(40px,5.4vw,64px)] leading-[1.04] tracking-tight mt-5 mb-4.5">
            A chat app that{' '}
            <em className="not-italic text-primary-deep relative sm:whitespace-nowrap">
              keeps things to itself
              <svg className="absolute left-0 right-0 w-full -bottom-1.5 h-2.5 hidden sm:block"
                viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden>
                <path d="M2 6 C 40 2, 80 9, 120 5 S 196 4, 198 6"
                  stroke="var(--primary)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
              </svg>
            </em>.
          </h1>
          <p className="text-muted-foreground text-[18px] leading-[1.55] max-w-130 m-0">
            StashChat saves your conversations on your own device, never on our servers.
            Pick from hundreds of AI models. See exactly which one wrote each reply. Your chats are yours.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-7">
            <a href="/chat" className={cn(buttonVariants({ size: 'lg' }), 'h-auto py-3 px-5 rounded-[10px]')}>Start chatting <ArrowRight /></a>
            <a href="#why" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-auto py-3 px-5 rounded-[10px]')}>Why local?</a>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mt-8 text-[13px]">
            {['Free, open source', 'Works in any browser', 'Optional API key for premium models'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-primary" /> {t}
              </span>
            ))}
          </div>
        </div>
        <div><AppMock /></div>
      </div>
    </section>
  );
}

function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-input overflow-hidden rounded-[14px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.28),0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2 border-b border-border bg-sidebar px-3.5 py-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#e36b6b]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#e8b85b]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#7bbd6b]" />
        <div className="font-mono text-muted-foreground bg-background border border-border rounded-md ml-2.5 text-[11px] px-2.5 py-1">
          stashchat.mohdriaz.com
        </div>
      </div>
      <div className="h-80 sm:h-115 flex min-h-0">{children}</div>
    </div>
  );
}

function MockSidebar() {
  const convs = ['Tahini sauce ratios', 'Trip to Lisbon, 5 days', 'Help me name my cat', 'Refactor my login screen', 'Bedtime story for Maya', 'SQL for monthly cohorts'];
  return (
    <aside className="bg-sidebar border-r border-border hidden sm:flex flex-col gap-1 text-sm w-50 p-2">
      <div className="flex items-center text-foreground px-2 py-1.5">
        <Brand textSize={14} />
      </div>
      <Button variant="ghost" className="justify-start gap-2 w-full font-normal text-[13px] h-auto px-2.25 py-1.75">
        <SquarePen className="size-3.5" />New chat
      </Button>
      <div className="relative">
        <Search className="absolute text-muted-foreground left-2.5 top-1/2 -translate-y-1/2 size-3" />
        <input readOnly placeholder="Search…" className="w-full bg-card text-foreground border border-border rounded-md outline-none py-1.5 pl-7 pr-2 text-[12px]" />
      </div>
      <div className="h-1" />
      {convs.map((t, i) => (
        <Button key={t} variant="ghost" className={`justify-start w-full h-auto px-2.25 py-1.5 text-[12.5px] font-normal truncate ${i === 0 ? 'bg-muted text-foreground font-medium hover:bg-muted' : 'text-muted-foreground'}`}>{t}</Button>
      ))}
    </aside>
  );
}

function MockHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border shrink-0 h-11 px-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm"><PanelLeft /></Button>
        <span className="text-foreground font-medium text-[13.5px]">{title}</span>
      </div>
      <Button variant="ghost" size="icon-sm"><Settings /></Button>
    </header>
  );
}

function ModelLine({ provider = 'anthropic', name = 'claude-haiku-4.5' }: { provider?: string; name?: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5 text-[11.5px]">
      <span className="grid place-items-center font-mono bg-muted text-muted-foreground border border-border rounded-[3px] w-3 h-3 text-[8px]">
        {provider[0].toUpperCase()}
      </span>
      <span className="font-mono">{name}</span>
    </div>
  );
}

function UserMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="self-end max-w-[78%]">
      <div className="bg-muted text-foreground rounded-2xl px-3.25 py-2.25 text-[13.5px] leading-normal">{children}</div>
    </div>
  );
}

function AsstMsg({ provider, model, children, streaming }: { provider: string; model: string; children: React.ReactNode; streaming?: boolean }) {
  return (
    <div className="self-stretch">
      <ModelLine provider={provider} name={model} />
      <div className="text-foreground text-[13.5px] leading-[1.55]">
        {children}
        {streaming && <span className="inline-block bg-primary align-middle w-1.75 h-3.25 ml-0.5 -mb-px animate-[sc-blink_1s_steps(2)_infinite]" />}
      </div>
    </div>
  );
}

function CompBtn({ children, active, wide }: { children: React.ReactNode; active?: boolean; wide?: boolean }) {
  return (
    <Button
      variant="ghost"
      size="xs"
      className={`gap-1 ${wide ? 'px-2' : 'px-1.5'} ${active ? 'bg-muted text-primary-deep hover:bg-muted hover:text-primary-deep' : ''}`}
    >{children}</Button>
  );
}

function MockComposer() {
  return (
    <div className="pt-2 px-4 pb-4 max-w-180 mx-auto w-full shrink-0">
      <div className="bg-card border border-input rounded-xl px-3 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="text-muted-foreground min-h-9 py-1 px-0.5 text-sm">Message StashChat…</div>
        <div className="flex items-center justify-between mt-1.5 gap-2">
          <div className="flex gap-0.5 text-muted-foreground">
            <CompBtn><ImageIcon /></CompBtn>
            <CompBtn active><Globe /></CompBtn>
            <CompBtn><Link /></CompBtn>
            <CompBtn wide>
              <span className="grid place-items-center font-mono bg-muted text-muted-foreground border border-border rounded-[3px] w-3 h-3 text-[8px]">O</span>
              <span className="font-mono text-[11.5px]">free</span>
              <ChevronDown className="size-3" />
            </CompBtn>
          </div>
          <Button size="icon-sm"><CornerDownLeft /></Button>
        </div>
      </div>
    </div>
  );
}

function AppMock() {
  return (
    <AppFrame>
      <MockSidebar />
      <main className="flex flex-col flex-1 min-w-0">
        <MockHeader title="Tahini sauce ratios" />
        <div className="flex flex-col flex-1 gap-3 bg-background overflow-y-auto px-6 py-4">
          <UserMsg>How do I make tahini sauce that doesn&apos;t seize up?</UserMsg>
          <AsstMsg provider="openrouter" model="free" streaming>
            <p className="m-0">Whisk these together in this order:</p>
            <ul className="mt-2 ml-4.5 p-0">
              <li>3 tbsp tahini</li>
              <li>2 tbsp lemon juice</li>
              <li>3–4 tbsp warm water, added a little at a time</li>
              <li>1 small clove garlic, a pinch of salt</li>
            </ul>
          </AsstMsg>
        </div>
        <MockComposer />
      </main>
    </AppFrame>
  );
}

function FlowDiagram() {
  return (
    <div className="bg-card border border-border rounded-2xl p-7 shadow-[0_14px_28px_-22px_rgba(0,0,0,0.18)]">
      <div className="overflow-x-auto -mx-2 px-2">
      <div className="grid items-center grid-cols-[1fr_80px_1fr] min-w-105">
        <div className="bg-sidebar border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-foreground font-medium mb-3 text-[12px]">
            <Cpu size={14} /> Your computer
          </div>
          <div className="flex flex-col gap-1.5">
            {['Tahini sauce ratios', 'Trip to Lisbon', 'Help me name my cat', 'Refactor login'].map(t => (
              <div key={t} className="flex items-center gap-2 bg-card border border-border rounded-md text-foreground px-2.5 py-1.75 text-[12px]">
                <HardDrive size={11} className="text-primary-deep" />{t}
              </div>
            ))}
          </div>
          <div className="text-center text-muted-foreground mt-3 text-[11px]">Lives only here.</div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-primary-deep text-[11px]">question</span>
          <svg width="64" height="14" viewBox="0 0 64 14">
            <defs><marker id="ar2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L7,4 L0,8 z" fill="var(--primary)" /></marker></defs>
            <line x1="3" y1="7" x2="55" y2="7" stroke="var(--primary)" strokeWidth="1.5" markerEnd="url(#ar2)" />
          </svg>
          <svg width="64" height="14" viewBox="0 0 64 14">
            <defs><marker id="ar3" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto"><path d="M7,0 L0,4 L7,8 z" fill="var(--muted-foreground)" /></marker></defs>
            <line x1="9" y1="7" x2="61" y2="7" stroke="var(--muted-foreground)" strokeWidth="1.5" markerStart="url(#ar3)" />
          </svg>
          <span className="text-muted-foreground text-[11px]">answer</span>
        </div>

        <div className="bg-sidebar border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-foreground font-medium mb-3 text-[12px]">
            <Sparkles size={14} /> AI of your choice
          </div>
          <div className="flex flex-col gap-1.5">
            {[['Claude', 'anthropic'], ['GPT', 'openai'], ['Gemini', 'google'], ['Llama', 'meta']].map(([n, p]) => (
              <div key={n} className="flex items-center justify-between bg-card border border-border rounded-md text-foreground px-2.5 py-1.75 text-[12px]">
                <span>{n}</span>
                <span className="font-mono text-muted-foreground text-[10px]">{p}</span>
              </div>
            ))}
          </div>
          <div className="text-center text-muted-foreground mt-3 text-[11px]">Hears the message. Doesn&apos;t keep it.</div>
        </div>
      </div>
      </div>

      <div className="flex justify-center mt-6">
        <div className="inline-flex items-center gap-2 bg-sidebar border border-dashed border-input rounded-full text-muted-foreground px-3 py-1.75 text-[12px]">
          <X size={13} className="text-[oklch(0.55_0.18_25)]" />
          No message database in the middle.
        </div>
      </div>
    </div>
  );
}

function WhyLocal() {
  return (
    <section id="why" className="border-t border-border bg-sidebar">
      <div className="mx-auto max-w-300 px-4 sm:px-7 py-14 lg:py-22">
        <div className="grid items-center grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-16">
          <div>
            <SectionLabel>Why local</SectionLabel>
            <h2 className="font-semibold text-foreground text-[clamp(28px,3.4vw,44px)] leading-[1.06] tracking-[-0.02em] mt-3.5 mb-4">
              Your conversations stay on your computer.
            </h2>
            <p className="text-muted-foreground text-[16.5px] leading-[1.6] mt-0 mb-6">
              StashChat doesn&apos;t store messages anywhere. They live in your browser. Requests pass through our proxy to reach the AI, but nothing is logged or kept.
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                ['No account, ever', 'Open the page, start typing.'],
                ['Nothing stored on our side', 'Your chats only live in your browser.'],
                ['Open source', 'Audit it, fork it, run your own copy.'],
              ].map(([h, b]) => (
                <li key={h} className="flex gap-3 items-start">
                  <span className="grid place-items-center shrink-0 rounded-full bg-primary-tint border border-primary-ring text-primary-deep mt-0.5 w-5.5 h-5.5">
                    <Check size={12} />
                  </span>
                  <div>
                    <div className="font-medium text-foreground text-[15px]">{h}</div>
                    <div className="text-muted-foreground mt-0.5 text-sm">{b}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <FlowDiagram />
        </div>
      </div>
    </section>
  );
}

function ChatExchange({ user, asst, model, provider }: { user: string; asst: string; model: string; provider: string }) {
  return (
    <div className="bg-card border border-border rounded-xl flex flex-col gap-3 p-4">
      <div className="self-end max-w-[85%]">
        <div className="bg-muted text-foreground rounded-xl px-3.25 py-2.25 text-sm leading-normal">{user}</div>
      </div>
      <div>
        <ModelLine provider={provider} name={model} />
        <div className="text-foreground text-[14.5px] leading-[1.55]">{asst}</div>
      </div>
    </div>
  );
}

function Models() {
  return (
    <section id="models" className="border-t border-border">
      <div className="mx-auto max-w-300 px-4 sm:px-7 py-14 lg:py-22">
        <div className="grid items-start grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16">
          <div>
            <SectionLabel>Pick your AI</SectionLabel>
            <h2 className="font-semibold text-foreground text-[clamp(28px,3.4vw,44px)] leading-[1.06] tracking-[-0.02em] mt-3.5 mb-4">
              One app. Hundreds of AIs.
            </h2>
            <p className="text-muted-foreground text-[16.5px] leading-[1.6] mt-0 mb-4">
              Switch between Claude, GPT, Gemini, and others mid-conversation. Each reply quietly notes which AI wrote it, so you always know who said what.
            </p>
            <p className="text-muted-foreground text-[16.5px] leading-[1.6] m-0">
              No more &ldquo;wait, did GPT say that, or Claude?&rdquo; The model name sits right above the message, every time.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            <ChatExchange model="claude-haiku-4.5" provider="anthropic"
              user="What's a fast pasta dinner I can make tonight?"
              asst="Cacio e pepe, five ingredients, ten minutes. Salt the pasta water generously, save a cup of it before draining, then toss with butter, fresh-ground pepper, and pecorino off heat." />
            <ChatExchange model="gpt-5.1-mini" provider="openai"
              user="Now translate that recipe into Italian."
              asst="Cacio e pepe, cinque ingredienti, dieci minuti. Sala bene l'acqua, conserva una tazza prima di scolare, poi manteca con burro, pepe nero macinato fresco e pecorino fuori dal fuoco." />
          </div>
        </div>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    { n: 1, t: 'Open StashChat', b: "No sign-up screen. The app loads, and you're ready." },
    { n: 2, t: 'Pick a model', b: 'Start with free models out of the box. Add an OpenRouter key any time to unlock premium models and web search.' },
    { n: 3, t: 'Start chatting', b: "Replies stream in live. Switch models any time. Stop a generation if you don't like where it's going." },
    { n: 4, t: 'Close the tab', b: 'Your chats stay where you left them. Open them again next week, next month, or never.' },
  ];
  return (
    <section id="how" className="border-t border-border bg-sidebar">
      <div className="mx-auto max-w-300 px-4 sm:px-7 py-14 lg:py-22">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="font-semibold text-foreground text-[clamp(28px,3.4vw,44px)] leading-[1.06] tracking-[-0.02em] mt-3.5 mb-10 max-w-180">
          From open tab to first reply in under a minute.
        </h2>
        <div className="grid bg-card border border-border overflow-hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-[14px]">
          {steps.map((s, i) => (
            <div key={s.n} className={`flex flex-col gap-2.5 px-5.5 py-6.5 min-h-45 ${i < steps.length - 1 ? 'border-b lg:border-b-0 lg:border-r border-border' : ''}`}>
              <span className="grid place-items-center font-semibold rounded-full bg-primary-tint border border-primary-ring text-primary-deep w-6.5 h-6.5 text-[13px]">{s.n}</span>
              <h3 className="font-semibold text-foreground m-0 text-[17px] tracking-[-0.01em]">{s.t}</h3>
              <p className="text-muted-foreground m-0 text-sm leading-[1.55]">{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reassurance() {
  const items = [
    { Icon: Shield,    t: "We don't store your chats",  b: "Requests pass through our proxy on their way to the AI. It has to forward them to make the call. Nothing gets logged, saved, or read. The proxy's real purpose is to encrypt and decrypt your API key so it stays safe in your browser." },
    { Icon: Cpu,       t: 'Open source, end to end',     b: "Every line of the app is on GitHub. Audit it, fork it, run your own copy. Nothing is hidden in a server you can't see." },
    { Icon: HardDrive, t: 'Optional key, your AI bill',  b: "Use the app for free with free models. Want premium models or web search? Add an OpenRouter key. You pay them directly, we don't take a cut. The encrypted key sits in your browser." },
  ];
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-300 px-4 sm:px-7 py-14 lg:py-22">
        <SectionLabel>How we keep it simple</SectionLabel>
        <h2 className="font-semibold text-foreground text-[clamp(28px,3.4vw,44px)] leading-[1.06] tracking-[-0.02em] mt-3.5 mb-10 max-w-180">
          A few things worth knowing.
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {items.map(({ Icon, t, b }) => (
            <div key={t} className="bg-card border border-border flex flex-col gap-3.5 rounded-[14px] p-6">
              <div className="grid place-items-center bg-primary-tint border border-primary-ring text-primary-deep w-9 h-9 rounded-[10px]">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground m-0 mb-1.5 text-[17px] tracking-[-0.01em]">{t}</h3>
                <p className="text-muted-foreground m-0 text-[14.5px] leading-[1.55]">{b}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    { q: 'Is StashChat really free?', a: "The app is free and open source. You'll pay your AI provider for usage, typically pennies per conversation, often less. Some models on OpenRouter are free." },
    { q: 'What if I clear my browser data?', a: "Your conversations live in your browser, so clearing data deletes them. There's no server-side copy to recover from." },
    { q: 'Can I use this on my phone?', a: 'Yes. The app works on any modern browser, including mobile Safari and Chrome. The sidebar collapses, the keyboard pushes the input up, it all just works.' },
    { q: 'Do I need an API key to use it?', a: "No. The app works out of the box with free models. If you want premium models like GPT-4 or Claude, or web search, sign up at OpenRouter and add your key. It's encrypted by our proxy and stored in your browser. You can use the app indefinitely without one." },
    { q: 'Does anyone ever see my messages?', a: "Whichever AI you talk to sees them. They have to, in order to reply. Our proxy passes the request through to the AI but doesn't log or store it. Once the response is delivered, it's gone from our side." },
    { q: 'How do I switch between AI models?', a: "There's a dropdown right next to the send button. Pick a different model, hit send, and the next reply comes from there. The model name appears above each reply so you can tell who said what." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="border-t border-border bg-sidebar">
      <div className="mx-auto max-w-230 px-4 sm:px-7 py-14 lg:py-22">
        <SectionLabel>Common questions</SectionLabel>
        <h2 className="font-semibold text-foreground text-[clamp(28px,3.4vw,44px)] leading-[1.06] tracking-[-0.02em] mt-3.5 mb-8">
          Things people want to know.
        </h2>
        <div className="bg-card border border-border overflow-hidden rounded-[14px]">
          {qs.map((item, i) => (
            <div key={item.q} className={i < qs.length - 1 ? 'border-b border-border' : ''}>
              <Button
                variant="ghost"
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full justify-between h-auto px-4 sm:px-5.5 py-4 sm:py-4.5 text-base font-medium text-foreground rounded-none"
              >
                <span>{item.q}</span>
                <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
              </Button>
              {open === i && (
                <div className="text-muted-foreground px-4 sm:px-5.5 pb-4 sm:pb-4.5 text-[15px] leading-[1.6] max-w-160">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="cta" className="border-t border-border relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none [background:radial-gradient(circle_at_50%_60%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_60%)]" />
      <div className="mx-auto relative text-center max-w-220 px-4 sm:px-7 py-16 lg:py-24">
        <span className="inline-block mb-4"><Logo size={44} /></span>
        <h2 className="font-semibold text-foreground text-[clamp(36px,4.6vw,56px)] leading-[1.06] tracking-tight mb-4">
          Try it. It&apos;s just a tab.
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 text-[18px] leading-[1.55] max-w-135">
          Open the page, start chatting. Add an API key when you want premium models, or don&apos;t. Either way works.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="/chat" className={cn(buttonVariants({ size: 'lg' }), 'h-auto py-3 px-5 rounded-[10px]')}>Open StashChat <ArrowRight /></a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-auto py-3 px-5 rounded-[10px]')}><GithubIcon size={16} /> View source</a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-4 max-w-300 px-4 sm:px-7 py-9">
        <div className="flex items-center gap-3.5">
          <Brand textSize={15} />
          <span className="text-muted-foreground text-[13px] hidden sm:block">Made for people who like their data where they put it.</span>
        </div>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-muted-foreground gap-1.5')}>
          <GithubIcon size={14} /> GitHub
        </a>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <div className="min-h-dvh bg-background text-foreground relative">
      <div aria-hidden className="absolute inset-x-0 top-0 h-150 pointer-events-none [background:radial-gradient(ellipse_70%_50%_at_50%_0%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_65%)]" />
      <Nav onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} />
      <Hero />
      <WhyLocal />
      <Models />
      <How />
      <Reassurance />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
