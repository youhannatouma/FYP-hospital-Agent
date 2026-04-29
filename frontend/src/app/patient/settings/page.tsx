"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getServiceContainer } from "@/lib/services/service-container";
import { clearUserProfileCache } from "@/hooks/use-user-profile";

type ProfileForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  address: string;
  blood_type: string;
  emergency_contact: string;
  chronic_conditions: string[];
  allergies: string[];
};

function toForm(user: any): ProfileForm {
  return {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    date_of_birth: user?.date_of_birth || "",
    gender: user?.gender || "",
    address: user?.address || "",
    blood_type: user?.blood_type || "",
    emergency_contact: user?.emergency_contact || "",
    chronic_conditions: Array.isArray(user?.chronic_conditions) ? user.chronic_conditions : [],
    allergies: Array.isArray(user?.allergies) ? user.allergies : [],
  };
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");

  const container = useMemo(() => getServiceContainer(), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const user = await container.user.getCurrentUser();
        setForm(toForm(user));
      } catch (error: any) {
        toast({
          title: "Could not load profile",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [container.user, toast]);

  const saveProfile = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await container.user.updateMyProfile({
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        phone_number: form.phone_number || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        address: form.address || null,
        blood_type: form.blood_type || null,
        emergency_contact: form.emergency_contact || null,
        allergies: form.allergies,
        chronic_conditions: form.chronic_conditions,
      });
      clearUserProfileCache();
      toast({ title: "Profile saved", description: "Your profile data was updated in the database." });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error?.response?.data?.detail || error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your persisted patient profile data.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>First Name</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Last Name</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
              <div><Label>Email (read-only)</Label><Input value={form.email} disabled /></div>
              <div><Label>Phone</Label><Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></div>
              <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth || ""} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></div>
              <div><Label>Gender</Label><Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} /></div>
              <div><Label>Blood Type</Label><Input value={form.blood_type} onChange={(e) => setForm({ ...form, blood_type: e.target.value })} /></div>
              <div><Label>Emergency Contact</Label><Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Allergies (Persisted)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {form.allergies.map((a) => (
                  <Badge key={a} className="gap-1">{a}<button onClick={() => setForm({ ...form, allergies: form.allergies.filter((x) => x !== a) })}><X className="h-3 w-3" /></button></Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="Add allergy" />
                <Button type="button" onClick={() => {
                  const v = newAllergy.trim();
                  if (!v || form.allergies.includes(v)) return;
                  setForm({ ...form, allergies: [...form.allergies, v] });
                  setNewAllergy("");
                }}><Plus className="h-4 w-4" />Add</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Chronic Conditions (Persisted)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {form.chronic_conditions.map((c) => (
                  <Badge key={c} variant="secondary" className="gap-1">{c}<button onClick={() => setForm({ ...form, chronic_conditions: form.chronic_conditions.filter((x) => x !== c) })}><X className="h-3 w-3" /></button></Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newCondition} onChange={(e) => setNewCondition(e.target.value)} placeholder="Add condition" />
                <Button type="button" onClick={() => {
                  const v = newCondition.trim();
                  if (!v || form.chronic_conditions.includes(v)) return;
                  setForm({ ...form, chronic_conditions: [...form.chronic_conditions, v] });
                  setNewCondition("");
                }}><Plus className="h-4 w-4" />Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Local-only Placeholder Sections</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Insurance, vaccination history, and device settings are currently UI placeholders and are not persisted to backend yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button className="w-fit gap-2" onClick={saveProfile} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
