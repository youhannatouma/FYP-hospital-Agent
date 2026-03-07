"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function DoctorLoading() {
  return (
    <div className="flex h-full flex-col gap-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Skeleton className="h-full min-h-[600px] rounded-2xl" />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-[250px] rounded-2xl" />
          <Skeleton className="h-[350px] rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
