"use client"

const techCategories = [
  {
    category: "Frontend",
    items: [
      { name: "Next.js 16", desc: "React Framework" },
      { name: "TypeScript", desc: "Type Safety" },
      { name: "Tailwind CSS", desc: "Utility Styling" },
      { name: "shadcn/ui", desc: "UI Components" },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", desc: "Runtime" },
      { name: "PostgreSQL", desc: "Database" },
      { name: "Redis", desc: "Caching" },
      { name: "GraphQL", desc: "API Layer" },
    ],
  },
  {
    category: "AI / ML",
    items: [
      { name: "TensorFlow", desc: "ML Framework" },
      { name: "OpenAI", desc: "LLM Provider" },
      { name: "Whisper", desc: "Voice AI" },
      { name: "LangChain", desc: "AI Orchestration" },
    ],
  },
  {
    category: "DevOps",
    items: [
      { name: "Docker", desc: "Containers" },
      { name: "Kubernetes", desc: "Orchestration" },
      { name: "Vercel", desc: "Deployment" },
      { name: "GitHub Actions", desc: "CI/CD" },
    ],
  },
]

export function TechStackSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">
            Technology Stack
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Modern Technologies for Modern Healthcare
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Built with cutting-edge technologies for enterprise-grade healthcare
            solutions.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {techCategories.map((cat) => (
            <div key={cat.category}>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-primary uppercase">
                {cat.category}
              </h3>
              <div className="flex flex-col gap-3">
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30"
                  >
                    <div className="text-sm font-medium text-card-foreground">
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
