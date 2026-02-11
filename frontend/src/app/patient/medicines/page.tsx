"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pill,
  RefreshCw,
  Clock,
  AlertTriangle,
  Search,
  Upload,
  MapPin,
  Phone,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react"

export default function MedicinesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activePrescriptions, setActivePrescriptions] = useState([
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      purpose: "Hypertension",
      doctor: "Dr. Michael Chen",
      startDate: "Oct 15, 2023",
      endDate: "Apr 15, 2024",
      refillsLeft: 2,
      progress: 60,
      status: "Active",
      nextDose: "Today, 8:00 AM",
      sideEffects: "Dizziness, dry cough",
    },
    {
      id: 2,
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      purpose: "High Cholesterol",
      doctor: "Dr. Michael Chen",
      startDate: "Nov 1, 2023",
      endDate: "May 1, 2024",
      refillsLeft: 5,
      progress: 45,
      status: "Active",
      nextDose: "Today, 9:00 PM",
      sideEffects: "Muscle pain, fatigue",
    },
    {
      id: 3,
      name: "Aspirin",
      dosage: "81mg",
      frequency: "Once daily",
      purpose: "Cardiovascular Protection",
      doctor: "Dr. Emily Watson",
      startDate: "Sep 1, 2023",
      endDate: "Ongoing",
      refillsLeft: 8,
      progress: 100,
      status: "Active",
      nextDose: "Today, 8:00 AM",
      sideEffects: "Stomach irritation",
    },
  ])

  const [pastPrescriptions, setPastPrescriptions] = useState([
    {
      id: 4,
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "Three times daily",
      purpose: "Bacterial Infection",
      doctor: "Dr. Emily Watson",
      startDate: "Dec 1, 2023",
      endDate: "Dec 14, 2023",
      status: "Completed",
    },
    {
      id: 5,
      name: "Prednisone",
      dosage: "10mg",
      frequency: "Twice daily",
      purpose: "Inflammation",
      doctor: "Dr. Raj Patel",
      startDate: "Nov 15, 2023",
      endDate: "Nov 30, 2023",
      status: "Completed",
    },
  ])

  const [pharmacyResults, setPharmacyResults] = useState([
    {
      id: 1,
      name: "CVS Pharmacy",
      distance: "0.5 mi",
      address: "123 Main St",
      phone: "(555) 123-4567",
      price: "$12.99",
      inStock: true,
      deliveryAvailable: true,
    },
    {
      id: 2,
      name: "Walgreens",
      distance: "1.2 mi",
      address: "456 Oak Ave",
      phone: "(555) 234-5678",
      price: "$14.49",
      inStock: true,
      deliveryAvailable: false,
    },
    {
      id: 3,
      name: "Rite Aid",
      distance: "2.1 mi",
      address: "789 Elm Blvd",
      phone: "(555) 345-6789",
      price: "$11.99",
      inStock: false,
      deliveryAvailable: true,
    },
  ])

  // API Endpoints Suggestion:
  // GET: /patient/medicines/active -> Fetch active prescriptions
  // GET: /patient/medicines/history -> Fetch past medications
  // GET: /pharmacy/search?q=... -> Search for pharmacies and prices
  /*
    useEffect(() => {
      const fetchMedicines = async () => {
        try {
          // const active = await apiClient.get('/patient/medicines/active');
          // const past = await apiClient.get('/patient/medicines/history');
          // setActivePrescriptions(active.data);
          // setPastPrescriptions(past.data);
        } catch (error) {
          console.error('Failed to fetch medicines', error);
        }
      };
      fetchMedicines();
    }, []);
  */

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Medications</h1>
        <p className="text-sm text-muted-foreground">
          Manage your prescriptions and find pharmacies
        </p>
      </div>

      <Tabs defaultValue="prescriptions" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="prescriptions">Active Prescriptions</TabsTrigger>
          <TabsTrigger value="history">Past Medications</TabsTrigger>
          <TabsTrigger value="finder">Medicine Finder</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="mt-4 flex flex-col gap-4">
          {activePrescriptions.map((rx) => (
            <Card key={rx.id} className="border border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Pill className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-card-foreground">
                          {rx.name}
                        </h3>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs">
                          {rx.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        For: {rx.purpose}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dosage: </span>
                          <span className="font-medium text-card-foreground">{rx.dosage}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frequency: </span>
                          <span className="font-medium text-card-foreground">{rx.frequency}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Refills Left: </span>
                          <span className="font-medium text-card-foreground">{rx.refillsLeft}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type: </span>
                          <span className="font-medium text-card-foreground">OTC</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Next dose: {rx.nextDose}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button className="bg-amber-500 text-white hover:bg-amber-600 gap-1.5 w-full sm:w-auto">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Request Refill
                    </Button>
                    {rx.refillsLeft <= 2 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Low refills remaining</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Prescription progress</span>
                    <span>{rx.progress}%</span>
                  </div>
                  <Progress value={rx.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{rx.startDate}</span>
                    <span>{rx.endDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-4 flex flex-col gap-4">
          {pastPrescriptions.map((rx) => (
            <Card key={rx.id} className="border border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Pill className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-card-foreground">
                        {rx.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {rx.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      For: {rx.purpose}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Dosage: {rx.dosage}</span>
                      <span>Frequency: {rx.frequency}</span>
                      <span>Prescribed by: {rx.doctor}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {rx.startDate} - {rx.endDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="finder" className="mt-4 flex flex-col gap-6">
          {/* Upload Prescription */}
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-card-foreground">Upload Prescription</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a photo of your prescription to find pharmacies
                </p>
              </div>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Choose File
              </Button>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search medicine by name (e.g., Lisinopril, Atorvastatin)..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Pharmacy Results */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Nearby Pharmacies
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pharmacyResults.map((pharmacy) => (
                <Card key={pharmacy.id} className="border border-border bg-card shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-card-foreground">
                          {pharmacy.name}
                        </h4>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{pharmacy.address} - {pharmacy.distance}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{pharmacy.phone}</span>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        {pharmacy.price}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {pharmacy.inStock ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/10 text-destructive border-0 text-xs">
                          <XCircle className="mr-1 h-3 w-3" />
                          Out of Stock
                        </Badge>
                      )}
                      {pharmacy.deliveryAvailable && (
                        <Badge className="bg-blue-500/10 text-blue-600 border-0 text-xs">
                          <Package className="mr-1 h-3 w-3" />
                          Delivery
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                        disabled={!pharmacy.inStock}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Order
                      </Button>
                      <Button variant="outline" className="flex-1 border-border text-foreground">
                        Reserve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
