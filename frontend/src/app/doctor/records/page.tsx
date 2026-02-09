"use client";

import { columns, MedicalRecord } from "@/components/doctor/MedicalRecord/columns";
import { DataTable } from "@/components/doctor/MedicalRecord/data-table";

const initialData: MedicalRecord[] = [
  {
    id: "1",
    name: "John Doe",
    patientId: "P-2024-001",
    lastVisit: "2024-02-05",
    diagnosis: "Hypertension",
    status: "Active",
    age: 45,
    gender: "Male",
    bloodType: "A+",
    phone: "+1234567890",
    email: "john.doe@email.com",
    address: "123 Main Street, New York, NY 10001",
    height: 178,
    weight: 82,
    bloodPressure: "140/90",
    heartRate: 78,
    temperature: 36.8,
    medications: ["Lisinopril 10mg", "Aspirin 81mg"],
    allergies: ["Penicillin"],
    treatmentPlan: "Monitor blood pressure daily. Continue current medication. Follow-up in 2 weeks.",
    notes: "Patient advised to reduce salt intake and increase physical activity. Family history of cardiovascular disease.",
    nextAppointment: "2024-02-19",
  },
  {
    id: "2",
    name: "Jane Smith",
    patientId: "P-2024-002",
    lastVisit: "2024-02-04",
    diagnosis: "Type 2 Diabetes",
    status: "Active",
    age: 52,
    gender: "Female",
    bloodType: "B+",
    phone: "+1234567891",
    email: "jane.smith@email.com",
    address: "456 Oak Avenue, Los Angeles, CA 90001",
    height: 165,
    weight: 78,
    bloodPressure: "130/85",
    heartRate: 72,
    temperature: 37.0,
    medications: ["Metformin 500mg", "Glipizide 5mg"],
    allergies: ["Sulfa drugs", "Latex"],
    treatmentPlan: "Continue diabetes medication. Monitor blood glucose levels twice daily. Dietary consultation scheduled.",
    notes: "Patient showing good compliance with treatment. HbA1c levels improving. Recommended annual eye examination.",
    nextAppointment: "2024-03-04",
  },
  {
    id: "3",
    name: "Mike Johnson",
    patientId: "P-2024-003",
    lastVisit: "2024-02-03",
    diagnosis: "Asthma",
    status: "Follow-up",
    age: 28,
    gender: "Male",
    bloodType: "O+",
    phone: "+1234567892",
    email: "mike.j@email.com",
    address: "789 Pine Road, Chicago, IL 60601",
    height: 182,
    weight: 75,
    bloodPressure: "118/75",
    heartRate: 68,
    temperature: 36.6,
    medications: ["Albuterol inhaler", "Fluticasone"],
    allergies: ["Pollen", "Dust mites"],
    treatmentPlan: "Use rescue inhaler as needed. Daily maintenance inhaler. Avoid known triggers.",
    notes: "Patient reports fewer episodes since starting maintenance therapy. Recommends keeping peak flow diary.",
    nextAppointment: "2024-03-03",
  },
  {
    id: "4",
    name: "Sarah Williams",
    patientId: "P-2024-004",
    lastVisit: "2024-02-02",
    diagnosis: "Migraine",
    status: "Active",
  },
  {
    id: "5",
    name: "Robert Brown",
    patientId: "P-2024-005",
    lastVisit: "2024-02-01",
    diagnosis: "Back Pain",
    status: "Recovered",
  },
  {
    id: "6",
    name: "Emily Davis",
    patientId: "P-2024-006",
    lastVisit: "2024-01-30",
    diagnosis: "Allergic Rhinitis",
    status: "Active",
  },
  {
    id: "7",
    name: "Michael Wilson",
    patientId: "P-2024-007",
    lastVisit: "2024-01-29",
    diagnosis: "Depression",
    status: "Follow-up",
  },
  {
    id: "8",
    name: "Jennifer Lee",
    patientId: "P-2024-008",
    lastVisit: "2024-01-28",
    diagnosis: "Osteoarthritis",
    status: "Active",
  },
  {
    id: "9",
    name: "David Miller",
    patientId: "P-2024-009",
    lastVisit: "2024-01-27",
    diagnosis: "GERD",
    status: "Recovered",
  },
  {
    id: "10",
    name: "Lisa Taylor",
    patientId: "P-2024-010",
    lastVisit: "2024-01-26",
    diagnosis: "Anxiety Disorder",
    status: "Active",
  },
];

// Optional: API integration function
const saveRecordToAPI = async (record: Omit<MedicalRecord, "id">) => {
  // This is where you would make an API call
  console.log("Saving to API:", record);
  // Example API call:
  // const response = await fetch('/api/medical-records', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(record),
  // });
  // return response.json();
};

export default function MedicalRecordsPage() {
  const handleAddRecord = async (record: Omit<MedicalRecord, "id">) => {
    try {
      // Uncomment to enable API integration
      // await saveRecordToAPI(record);
      console.log("Record added (would save to API):", record);
    } catch (error) {
      console.error("Failed to save record:", error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <DataTable
        columns={columns}
        data={initialData}
        onAddRecord={handleAddRecord}
      />
    </div>
  );
}
