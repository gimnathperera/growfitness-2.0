import React, { useEffect, useState } from "react";

import type { Kid, SessionType } from "@grow-fitness/shared-types";
import type { UpdateKidDto } from "@grow-fitness/shared-schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { kidsService } from "@/services/kids.service";
import { useKid } from "@/contexts/kid/useKid";

export function KidProfileTab() {
  const { toast } = useToast();
  const { selectedKid, isLoading: isKidLoading } = useKid();

  const [kid, setKid] = useState<Kid | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<UpdateKidDto>>({
    name: "",
    gender: "",
    birthDate: "",
    goal: "",
    currentlyInSports: false,
    medicalConditions: [],
    sessionType: "INDIVIDUAL",
  });

  // Helper to format ISO date string to YYYY-MM-DD for date input
  const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return "";
    return isoDate.split("T")[0];
  };

  /* ----------------------------------
   * Fetch full kid details and sync form
   * ---------------------------------- */
  useEffect(() => {
    if (!selectedKid?.id) return;

    const fetchKidDetails = async () => {
      try {
        const fullKidData = await kidsService.getKidById(selectedKid.id);
        if (!fullKidData) throw new Error("No kid data received from API");

        setKid(fullKidData);

        setFormData({
          name: fullKidData.name || "",
          gender: fullKidData.gender || "",
          birthDate: formatDateForInput(fullKidData.birthDate),
          goal: fullKidData.goal || "",
          currentlyInSports: fullKidData.currentlyInSports || false,
          medicalConditions: fullKidData.medicalConditions || [],
          sessionType: fullKidData.sessionType || "INDIVIDUAL",
        });
      } catch (error: any) {
        // Fallback: if API call fails, at least set the name we have
        setKid(selectedKid as Kid);
        setFormData((prev) => ({
          ...prev,
          name: selectedKid.name || "",
        }));

        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to load kid profile details.",
          variant: "destructive",
        });
      }
    };

    fetchKidDetails();
  }, [selectedKid?.id, toast]);

  /* ----------------------------------
   * Form Handlers
   * ---------------------------------- */
  const handleInputChange = (field: keyof UpdateKidDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMedicalConditionChange = (condition: string, checked: boolean) => {
    setFormData((prev) => {
      const conditions = prev.medicalConditions || [];
      return {
        ...prev,
        medicalConditions: checked
          ? [...conditions, condition]
          : conditions.filter((c) => c !== condition),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kid) return;

    if (!formData.name?.trim() || !formData.gender || !formData.birthDate) {
      toast({
        title: "Validation error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const payload: UpdateKidDto = {
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.birthDate,
        goal: formData.goal || undefined,
        currentlyInSports: formData.currentlyInSports || false,
        medicalConditions: formData.medicalConditions || [],
        sessionType: formData.sessionType as SessionType,
      };

      const res = await kidsService.updateKid(kid.id, payload);
      setKid(res.data);

      toast({
        title: "Success",
        description: "Kid profile updated successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update kid profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------------
   * Render
   * ---------------------------------- */
  if (isKidLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (!selectedKid) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Kid profile not available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kid Profile</CardTitle>
        <CardDescription>
          Update {selectedKid.name}&apos;s profile information
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender *</Label>
            <Select
              value={formData.gender || ""}
              onValueChange={(v) => handleInputChange("gender", v)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label>Birth Date *</Label>
            <Input
              type="date"
              value={formData.birthDate || ""}
              onChange={(e) => handleInputChange("birthDate", e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Session Type */}
          <div className="space-y-2">
            <Label>Session Type</Label>
            <Select
              value={formData.sessionType || "INDIVIDUAL"}
              onValueChange={(v) => handleInputChange("sessionType", v as SessionType)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="GROUP">Group</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currently In Sports */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="currentlyInSports"
                checked={formData.currentlyInSports || false}
                onCheckedChange={(checked) => handleInputChange("currentlyInSports", !!checked)}
                disabled={saving}
              />
              <Label htmlFor="currentlyInSports" className="cursor-pointer">
                Currently participating in sports
              </Label>
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label>Fitness Goal</Label>
            <Textarea
              value={formData.goal || ""}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              disabled={saving}
              placeholder="Enter fitness goals..."
            />
          </div>

          {/* Medical Conditions */}
          <div className="space-y-2">
            <Label>Medical Conditions</Label>
            <div className="space-y-2">
              {["Asthma", "Diabetes", "Heart condition", "Allergy"].map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <Checkbox
                    id={`medical-${c}`}
                    checked={(formData.medicalConditions || []).includes(c)}
                    onCheckedChange={(checked) => handleMedicalConditionChange(c, !!checked)}
                    disabled={saving}
                  />
                  <Label htmlFor={`medical-${c}`} className="cursor-pointer font-normal">
                    {c}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
