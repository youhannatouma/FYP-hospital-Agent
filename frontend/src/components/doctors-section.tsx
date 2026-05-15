"use client";

import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Doctor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  specialty: string;
  license_number: string;
  years_of_experience: number;
  qualifications: string[];
  clinic_address: string;
  phone_number: string;
  status: string;
}

export function DoctorsSection() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get<Doctor[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/doctors`,
        );
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <section id="doctors" className="bg-muted/50 py-20 lg:py-28">
      {/* Header fades in from right */}
      <div
        ref={headerRef}
        className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
          headerVisible
            ? "translate-x-0 opacity-100"
            : "translate-x-16 opacity-0"
        }`}
      >
        <span className="text-sm font-semibold tracking-wider text-primary uppercase">
          Find Your Doctor
        </span>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">
          Top-Rated Specialists Near You
        </h2>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
          Browse our network of verified healthcare professionals. Sign up to
          book appointments and access full profiles.
        </p>
      </div>

      {/* Cards fade in from left */}
      <div
        ref={gridRef}
        className={`mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-150 ease-out ${
          gridVisible
            ? "translate-x-0 opacity-100"
            : "-translate-x-16 opacity-0"
        }`}
      >
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {doc.first_name[0]}
                {doc.last_name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-card-foreground">
                  Dr. {doc.first_name} {doc.last_name}
                </h3>
                <p className="text-xs text-primary">{doc.specialty}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4 text-primary" />
                {doc.clinic_address}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4 text-primary" />
                {doc.years_of_experience} years of experience
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="mr-2 h-4 w-4 text-primary" />
                {doc.qualifications.join(", ")}
              </div>
            </div>

            <Button variant="ghost" className="mt-4 w-full justify-between">
              View Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
