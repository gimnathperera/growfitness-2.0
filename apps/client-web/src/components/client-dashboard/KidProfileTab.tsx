import React, { useEffect, useState } from "react";
import { SessionType, type Kid } from "@grow-fitness/shared-types";
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
import { useToast } from "@/hooks/use-toast";
import { kidsService } from "@/services/kids.service";
import { useKid } from "@/contexts/kid/useKid";

import { User, Calendar, Award, Heart, Loader2, Save } from "lucide-react";

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
    sessionType: SessionType.INDIVIDUAL,  
  });

  const formatDateForInput = (dateValue?: string | Date) => {
    if (!dateValue) return '';
    const dateString = dateValue instanceof Date ? dateValue.toISOString() : dateValue;
    return dateString.split("T")[0];
  };

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
      } catch (error: unknown) {
        setKid(selectedKid as Kid);
        setFormData((prev) => ({
          ...prev,
          name: selectedKid.name || "",
        }));

        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to load kid profile details.';

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    fetchKidDetails();
  }, [selectedKid?.id, toast]);

  const handleInputChange = (field: keyof UpdateKidDto, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

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

      interface ApiResponse<T> {
        data: T;
        // Add other response metadata if needed (e.g., status, message, etc.)
      }

      // Then in your handleSubmit function:
      const res = await kidsService.updateKid(kid.id, payload) as unknown as ApiResponse<Kid>;
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

  if (isKidLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{selectedKid.name}'s Profile</CardTitle>
        <CardDescription>Manage your kid's information and goals</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid layout for most fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Name *
              </Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={saving}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Gender *
              </Label>
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
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Birth Date *
              </Label>
              <Input
                type="date"
                value={formatDateForInput(formData.birthDate)}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                disabled={saving}
              />
            </div>

            {/* Session Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> Session Type
              </Label>
              <Select
                value={formData.sessionType || "INDIVIDUAL"}
                onValueChange={(v) =>
                  handleInputChange("sessionType", v as SessionType)
                }
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
          </div>

          {/* Currently in Sports */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="currentlyInSports"
              checked={formData.currentlyInSports || false}
              onCheckedChange={(checked) =>
                handleInputChange("currentlyInSports", !!checked)
              }
              disabled={saving}
            />
            <Label htmlFor="currentlyInSports" className="cursor-pointer">
              Currently participating in sports
            </Label>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" /> Fitness Goal
            </Label>
            <Textarea
              value={formData.goal || ""}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              disabled={saving}
              placeholder="Enter fitness goals..."
            />
          </div>

          {/* Medical Conditions */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">Medical Conditions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {["Asthma", "Diabetes", "Heart condition", "Allergy"].map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <Checkbox
                    id={`medical-${c}`}
                    checked={(formData.medicalConditions || []).includes(c)}
                    onCheckedChange={(checked) =>
                      handleMedicalConditionChange(c, !!checked)
                    }
                    disabled={saving}
                  />
                  <Label htmlFor={`medical-${c}`} className="cursor-pointer font-normal">
                    {c}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
