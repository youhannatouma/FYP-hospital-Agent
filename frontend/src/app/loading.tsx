export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center">
        {/* Use CSS animation, not framer-motion */}
        <div className="absolute h-32 w-32 rounded-full bg-primary/20 blur-2xl animate-pulse" />

        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
          <svg
            className="h-8 w-8 text-primary animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/80">
            Initializing Services
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1 w-1 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-1.5 backdrop-blur-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Secure Clinical Environment
          </span>
        </div>
      </div>
    </div>
  )
}
