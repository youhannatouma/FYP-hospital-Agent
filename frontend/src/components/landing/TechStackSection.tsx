"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const medicalCategories = [
  { category: "Diagnostic Imaging", items: [{ name: "MRI Scanning", desc: "3T High-Resolution" }, { name: "CT Imaging", desc: "128-Slice Scanner" }, { name: "Digital X-Ray", desc: "Low Radiation Dose" }, { name: "Ultrasound", desc: "4D Color Doppler" }] },
  { category: "Laboratory", items: [{ name: "Hematology Panel", desc: "CBC & Differentials" }, { name: "Metabolic Profile", desc: "Glucose, Lipids, Liver" }, { name: "Immunology", desc: "Antibody & Allergy Testing" }, { name: "Pathology", desc: "Biopsy & Cytology" }] },
  { category: "Surgical Suites", items: [{ name: "Robotic Surgery", desc: "Da Vinci Xi System" }, { name: "Laparoscopy", desc: "Minimally Invasive" }, { name: "Endoscopy Center", desc: "GI & Pulmonary" }, { name: "Cath Lab", desc: "Cardiac Interventions" }] },
  { category: "Patient Care", items: [{ name: "ICU Monitoring", desc: "24/7 Telemetry" }, { name: "Rehabilitation", desc: "Physical & Occupational" }, { name: "Telemedicine", desc: "Virtual Consultations" }, { name: "Home Health", desc: "Post-Discharge Care" }] },
]

export function TechStackSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Medical Capabilities</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Advanced Equipment & Services</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">State-of-the-art medical technology and compassionate care teams ensuring accurate diagnosis and effective treatment.</p>
        </div>
        <div ref={gridRef} className={`mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-150 ease-out ${gridVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          {medicalCategories.map((cat) => (
            <div key={cat.category}>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-primary uppercase">{cat.category}</h3>
              <div className="flex flex-col gap-3">
                {cat.items.map((item) => (
                  <div key={item.name} className="rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30">
                    <div className="text-sm font-medium text-card-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
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
