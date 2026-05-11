"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function RecordsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pb-24 px-4">
      <div className="space-y-4 pt-4">
        <h1 className="text-4xl font-black text-foreground tracking-tight">Medical Records</h1>
        <p className="text-muted-foreground font-medium text-lg max-w-lg">
          Access your digital health vault. All records are encrypted and secured.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search records by date, doctor, or diagnosis..."
          className="h-14 pl-12 rounded-2xl bg-card border-border/50 font-medium shadow-subtle"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-border/50 shadow-subtle hover:shadow-premium transition-all">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold">Vaccination Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No records found. Visit the clinic to upload your history.</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 shadow-subtle hover:shadow-premium transition-all">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold">Insurance Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Upload your latest insurance card for faster check-in.</p>
          </CardContent>
        </Card>
      </div>
  )
}
