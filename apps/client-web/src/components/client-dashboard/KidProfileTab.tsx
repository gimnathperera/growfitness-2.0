import React, { useEffect, useState } from "react";
import { SessionType, UploadKind } from "@grow-fitness/shared-types";
import type { UpdateKidDto } from "@grow-fitness/shared-schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { kidsService } from "@/services/kids.service";
import { uploadFileViaGcs } from "@/services/uploads.service";
import { useKid } from "@/contexts/kid/useKid";
import { ProfilePhotoEditor } from "@/components/common/ProfilePhotoEditor";
import { FieldError } from "@/components/common/FieldError";
import { kidProfileFormSchema, zodFieldErrorMap } from "@/lib/profile-form-schemas";

import {
  User,
  Calendar,
  Award,
  Loader2,
  Save,
  Stethoscope,
  Camera,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type KidFieldKey = "name" | "gender" | "birthDate" | "goal";

const MEDICAL_CONDITIONS = ["Asthma", "Diabetes", "Heart condition", "Allergy"];

// Canonical option lists used by the <Select> components below.
// We normalize incoming API values against these so the Select can
// find a matching SelectItem (Radix/shadcn Select matching is an exact,
// case-sensitive string match).
const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"] as const;
const SESSION_TYPE_OPTIONS = ["INDIVIDUAL", "GROUP", "FAMILY"] as const;
const GOAL_OPTIONS = [
  "Build strength",
  "Improve coordination",
  "Make friends",
  "I don't know/ Basic fitness",
] as const;

// Some APIs store the display label ("Private", "Group", "Both") instead of
// the enum value ("INDIVIDUAL", "GROUP", "FAMILY"). This map lets the
// normalizer below recognize either form. Add more variants here if the
// console log shows something else still slipping through.
const SESSION_TYPE_ALIASES: Record<string, typeof SESSION_TYPE_OPTIONS[number]> = {
  INDIVIDUAL: "INDIVIDUAL",
  PRIVATE: "INDIVIDUAL",
  GROUP: "GROUP",
  FAMILY: "FAMILY",
  BOTH: "FAMILY",
};

/** Case-insensitively matches `raw` against `options` and returns the
 * canonical-cased option if found, otherwise returns the trimmed raw value
 * (so an unexpected value at least renders in read-only mode instead of
 * silently becoming "").
 */
function normalizeToOption<T extends string>(
  raw: string | undefined | null,
  options: readonly T[]
): T | "" {
  const value = (raw ?? "").trim();
  if (!value) return "";
  const match = options.find((opt) => opt.toLowerCase() === value.toLowerCase());
  // If nothing matches, fall back to the raw (trimmed) value rather than
  // silently blanking it out — this way an unexpected value still shows up
  // in the read-only view / console instead of vanishing, making the
  // mismatch easy to spot.
  return (match ?? value) as T;
}

/** Like normalizeToOption, but also checks SESSION_TYPE_ALIASES so label-style
 * values from the API (e.g. "Private", "Both") resolve to the correct enum
 * value the <Select> actually expects. */
function normalizeSessionType(raw: string | undefined | null): SessionType {
  const value = (raw ?? "").trim().toUpperCase();
  if (value && SESSION_TYPE_ALIASES[value]) {
    return SESSION_TYPE_ALIASES[value] as unknown as SessionType;
  }
  return SessionType.INDIVIDUAL;
}

export function KidProfileTab() {
  const { toast } = useToast();
  const { selectedKid, isLoading: isKidLoading, setSelectedKid } = useKid();
  const kidId = selectedKid?.id;

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [kidFieldErrors, setKidFieldErrors] = useState<Partial<Record<KidFieldKey, string>>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [backupFormData, setBackupFormData] = useState<Partial<UpdateKidDto> | null>(null);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherCondition, setOtherCondition] = useState("");

  const [formData, setFormData] = useState<Partial<UpdateKidDto>>({
    name: "",
    gender: "",
    birthDate: "",
    goal: "",
    profilePhotoUrl: "",
    currentlyInSports: false,
    medicalConditions: [],
    sessionType: SessionType.INDIVIDUAL,
  });

  const pendingPreviewUrl = React.useMemo(() => {
    if (!profilePhotoFile) return null;
    return URL.createObjectURL(profilePhotoFile);
  }, [profilePhotoFile]);

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  const avatarSrc =
    pendingPreviewUrl ?? (!photoRemoved && formData.profilePhotoUrl?.trim() ? formData.profilePhotoUrl : undefined);

  const calculateAge = (birthDateValue?: string | Date) => {
    if (!birthDateValue) return null;
    const birthDate = birthDateValue instanceof Date ? birthDateValue : new Date(birthDateValue);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let ageVal = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      ageVal--;
    }
    return ageVal;
  };

  const age = calculateAge(formData.birthDate);

  const initials = formData.name
    ? formData.name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "";

  const formatDateForInput = (dateValue?: string | Date) => {
    if (!dateValue) return "";
    const dateString = dateValue instanceof Date ? dateValue.toISOString() : dateValue;
    return dateString.split("T")[0];
  };

  useEffect(() => {
    if (!kidId) return;

    const fetchKidDetails = async () => {
      try {
        const fullKidData = await kidsService.getKidById(kidId);
        if (!fullKidData) throw new Error("No kid data received from API");

        // Debug: compare these against GENDER_OPTIONS / SESSION_TYPE_OPTIONS /
        // GOAL_OPTIONS / MEDICAL_CONDITIONS above if a Select still shows blank.
        console.log("Raw kid data from API:", {
          gender: fullKidData.gender,
          sessionType: fullKidData.sessionType,
          goal: fullKidData.goal,
          medicalConditions: fullKidData.medicalConditions,
        });

        const details: Partial<UpdateKidDto> = {
          name: fullKidData.name || "",
          gender: normalizeToOption(fullKidData.gender, GENDER_OPTIONS),
          birthDate: formatDateForInput(fullKidData.birthDate),
          goal: normalizeToOption(fullKidData.goal, GOAL_OPTIONS),
          profilePhotoUrl: fullKidData.profilePhotoUrl || "",
          currentlyInSports: fullKidData.currentlyInSports || false,
          sessionType: normalizeSessionType(fullKidData.sessionType),
          medicalConditions: (fullKidData.medicalConditions || [])
            .map((c: string) => c.trim())
            .map((c: string) => {
              const match = MEDICAL_CONDITIONS.find(
                (opt) => opt.toLowerCase() === c.toLowerCase()
              );
              return match ?? c;
            }),
        };

        setFormData(details);
        setBackupFormData(details);
        setProfilePhotoFile(null);
        setPhotoRemoved(false);
        setKidFieldErrors({});
        const existingConditions = details.medicalConditions || [];
        const other = existingConditions.find((c) => !MEDICAL_CONDITIONS.includes(c)) || "";
        setOtherCondition(other);
        setShowOtherInput(!!other);
      } catch (error: unknown) {
        setFormData((prev) => {
          const initialForm = {
            ...prev,
            name: selectedKid.name || "",
          };
          setBackupFormData(initialForm);
          return initialForm;
        });

        const errorMessage =
          error instanceof Error ? error.message : "Failed to load kid profile details.";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    fetchKidDetails();
  }, [kidId, selectedKid, toast]);

  const clearKidError = (key: KidFieldKey) => {
    setKidFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleInputChange = (field: keyof UpdateKidDto, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "name" || field === "gender" || field === "birthDate" || field === "goal") {
      clearKidError(field);
    }
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

  const handleOtherCheckboxChange = (checked: boolean) => {
    setShowOtherInput(checked);
    setFormData((prev) => {
      const conditions = prev.medicalConditions || [];
      const base = conditions.filter((c) => MEDICAL_CONDITIONS.includes(c));
      if (checked) {
        if (otherCondition.trim()) {
          return {
            ...prev,
            medicalConditions: [...base, otherCondition.trim()],
          };
        }
        return prev;
      } else {
        return {
          ...prev,
          medicalConditions: base,
        };
      }
    });
  };

  const handleOtherConditionTextChange = (value: string) => {
    setOtherCondition(value);
    setFormData((prev) => {
      const conditions = prev.medicalConditions || [];
      const base = conditions.filter((c) => MEDICAL_CONDITIONS.includes(c));
      if (value.trim()) {
        return {
          ...prev,
          medicalConditions: [...base, value.trim()],
        };
      } else {
        return {
          ...prev,
          medicalConditions: base,
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kidId) return;

    const parsed = kidProfileFormSchema.safeParse({
      name: formData.name ?? "",
      gender: formData.gender ?? "",
      birthDate: formData.birthDate ? String(formData.birthDate) : "",
      goal: formData.goal ?? "",
    });

    if (!parsed.success) {
      setKidFieldErrors(zodFieldErrorMap(parsed.error.issues) as Partial<Record<KidFieldKey, string>>);
      return;
    }
    setKidFieldErrors({});

    try {
      setSaving(true);
      let profilePhotoUrl: string | undefined = formData.profilePhotoUrl?.trim() || undefined;

      if (profilePhotoFile) {
        try {
          setUploadingPhoto(true);
          const uploadResult = await uploadFileViaGcs(UploadKind.KID_AVATAR, kidId, profilePhotoFile);
          profilePhotoUrl = uploadResult.publicUrl;
        } catch (error) {
          toast({
            title: "Upload failed",
            description:
              error instanceof Error ? error.message : "Could not upload profile picture.",
            variant: "destructive",
          });
          return;
        } finally {
          setUploadingPhoto(false);
        }
      } else if (photoRemoved) {
        profilePhotoUrl = "";
      }

      const payload: UpdateKidDto = {
        name: parsed.data.name,
        gender: parsed.data.gender,
        birthDate: parsed.data.birthDate,
        goal: parsed.data.goal ?? "",
        profilePhotoUrl,
        currentlyInSports: formData.currentlyInSports || false,
        medicalConditions: formData.medicalConditions ?? [],
        sessionType: formData.sessionType as SessionType,
      };

      const updatedKid = await kidsService.updateKid(kidId, payload);
      const newForm: Partial<UpdateKidDto> = {
        name: updatedKid.name || "",
        gender: updatedKid.gender || "",
        birthDate: formatDateForInput(updatedKid.birthDate),
        goal: updatedKid.goal ?? "",
        profilePhotoUrl: updatedKid.profilePhotoUrl || "",
        currentlyInSports: updatedKid.currentlyInSports || false,
        medicalConditions: updatedKid.medicalConditions ?? [],
        sessionType: (updatedKid.sessionType as SessionType) || SessionType.INDIVIDUAL,
      };
      setFormData(newForm);
      setBackupFormData(newForm);
      setProfilePhotoFile(null);
      setPhotoRemoved(false);
      setKidFieldErrors({});
      setIsEditing(false);

      setSelectedKid((prev) =>
        prev && prev.id === kidId
          ? {
            ...prev,
            name: updatedKid.name,
            profilePhotoUrl: updatedKid.profilePhotoUrl,
          }
          : prev
      );

      toast({
        variant: "success",
        title: "Profile saved",
        description: updatedKid.name?.trim()
          ? `${updatedKid.name.trim()}'s profile was updated successfully.`
          : "The profile was updated successfully.",
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
        <CardContent className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!selectedKid) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Kid profile not available.
        </CardContent>
      </Card>
    );
  }

  const selectedConditionsCount = (formData.medicalConditions || []).length;

  return (
    <Card className="animate-fade-in overflow-hidden border-none shadow-none bg-transparent">
      <Card className="overflow-hidden border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className=" space-y-5 pb-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end">
              <div className="relative">
                <Avatar className="h-24 w-24 rounded-2xl border-4 border-card shadow-[var(--shadow-card)]">
                  <AvatarImage src={avatarSrc} alt={formData.name || ""} className="object-cover" />
                  <AvatarFallback className="rounded-2xl bg-secondary text-xl font-bold text-secondary-foreground">
                    {initials || "K"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                    <Camera className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="text-center sm:pb-2 sm:text-left">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {formData.name || "Untitled"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {age !== null ? `${age} years old` : "Add birth date"} ·{" "}
                  {formData.sessionType === "INDIVIDUAL" ? "Private sessions" : "Group sessions"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CardContent className="pt-6 px-0">
        <form noValidate onSubmit={handleSubmit} className="space-y-8 bg-card border border-border/60 rounded-xl p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between pb-4 border-b border-border/40">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">Kid Profile</h3>
              <p className="text-xs text-muted-foreground">
                {isEditing ? "Update profile details and save." : "View profile details."}
              </p>
            </div>
            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (backupFormData) {
                        setFormData(backupFormData);
                        const existingConditions = backupFormData.medicalConditions || [];
                        const other = existingConditions.find((c) => !MEDICAL_CONDITIONS.includes(c)) || "";
                        setOtherCondition(other);
                        setShowOtherInput(!!other);
                      }
                      setProfilePhotoFile(null);
                      setPhotoRemoved(false);
                      setKidFieldErrors({});
                      setIsEditing(false);
                    }}
                    disabled={saving}
                    className="h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={saving || uploadingPhoto}
                    className="h-9 shadow-sm"
                  >
                    {saving || uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-9 px-4 border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {isEditing && (
            <ProfilePhotoEditor
              savedPhotoUrl={formData.profilePhotoUrl}
              pendingFile={profilePhotoFile}
              onPendingFileChange={setProfilePhotoFile}
              photoRemoved={photoRemoved}
              onPhotoRemovedChange={setPhotoRemoved}
              fallbackLabel={formData.name || "K"}
              disabled={saving}
              uploading={uploadingPhoto}
              helperText="The selected photo uploads when you save changes."
            />
          )}

          {/* Section: Basic Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="kid-name" className="text-muted-foreground">
                  Name {isEditing && <span className="text-destructive">*</span>}
                </Label>
                {isEditing ? (
                  <Input
                    id="kid-name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={saving}
                    autoComplete="name"
                    placeholder="Enter full name"
                    aria-invalid={Boolean(kidFieldErrors.name)}
                    aria-describedby={kidFieldErrors.name ? "kid-name-error" : undefined}
                    className={kidFieldErrors.name ? "border-destructive" : undefined}
                  />
                ) : (
                  <div className="flex h-10 items-center text-sm font-medium text-foreground px-3 rounded-md border border-border/20 bg-muted/10 cursor-default">
                    {formData.name || "—"}
                  </div>
                )}
                {isEditing && <FieldError id="kid-name-error" message={kidFieldErrors.name} />}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="kid-gender" className="text-muted-foreground">
                  Gender {isEditing && <span className="text-destructive">*</span>}
                </Label>
                {isEditing ? (
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(v) => handleInputChange("gender", v)}
                    disabled={saving}
                  >
                    <SelectTrigger
                      id="kid-gender"
                      aria-invalid={Boolean(kidFieldErrors.gender)}
                      aria-describedby={kidFieldErrors.gender ? "kid-gender-error" : undefined}
                      className={kidFieldErrors.gender ? "w-full border-destructive" : "w-full"}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex h-10 items-center text-sm font-medium text-foreground px-3 rounded-md border border-border/20 bg-muted/10 cursor-default capitalize">
                    {formData.gender ? formData.gender.toLowerCase() : "—"}
                  </div>
                )}
                {isEditing && <FieldError id="kid-gender-error" message={kidFieldErrors.gender} />}
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="kid-birthDate" className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Birth Date {isEditing && <span className="text-destructive">*</span>}
                </Label>
                {isEditing ? (
                  <Input
                    id="kid-birthDate"
                    type="date"
                    value={formatDateForInput(formData.birthDate)}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    disabled={saving}
                    aria-invalid={Boolean(kidFieldErrors.birthDate)}
                    aria-describedby={kidFieldErrors.birthDate ? "kid-birthDate-error" : undefined}
                    className={kidFieldErrors.birthDate ? "border-destructive" : undefined}
                  />
                ) : (
                  <div className="flex h-10 items-center text-sm font-medium text-foreground px-3 rounded-md border border-border/20 bg-muted/10 cursor-default">
                    {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "—"}
                  </div>
                )}
                {isEditing && <FieldError id="kid-birthDate-error" message={kidFieldErrors.birthDate} />}
              </div>

              {/* Session Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-muted-foreground">
                  <Award className="h-3.5 w-3.5" />
                  Session Type
                </Label>
                {isEditing ? (
                  <Select
                    value={formData.sessionType || "INDIVIDUAL"}
                    onValueChange={(v) => handleInputChange("sessionType", v as SessionType)}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">Private</SelectItem>
                      <SelectItem value="GROUP">Group</SelectItem>
                      <SelectItem value="FAMILY">Both</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex h-10 items-center text-sm font-medium text-foreground px-3 rounded-md border border-border/20 bg-muted/10 cursor-default">
                    {formData.sessionType === "INDIVIDUAL" ? "Private" : formData.sessionType === "GROUP" ? "Group" : "Both"}
                  </div>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* Section: Activity & Goals */}
          <section className="space-y-4">
             <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-muted-foreground">
                  <Award className="h-3.5 w-3.5" />
                  Fitness Goal
                </Label>
                {isEditing ? (
                  <Select
                    value={formData.goal || ""}
                    onValueChange={(v) => handleInputChange("goal", v)}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Build strength">Build strength</SelectItem>
                      <SelectItem value="Improve coordination">Improve coordination</SelectItem>
                      <SelectItem value="Make friends">Make friends</SelectItem>
                      <SelectItem value="I don't know/ Basic fitness">I don't know/ Basic fitness</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex h-10 items-center text-sm font-medium text-foreground px-3 rounded-md border border-border/20 bg-muted/10 cursor-default">
                    {formData.goal}
                  </div>
                )}
              </div>

            {isEditing ? (
              <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="currentlyInSports"
                    checked={formData.currentlyInSports || false}
                    onCheckedChange={(checked) => handleInputChange("currentlyInSports", !!checked)}
                    disabled={saving}
                  />
                  <Label htmlFor="currentlyInSports" className="cursor-pointer font-normal">
                    Currently participating in sports
                  </Label>
                </div>
                {formData.currentlyInSports && (
                  <Badge variant="secondary" className="font-normal">
                    Currently Active
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border bg-muted/10 px-4 py-3">
                <span className="text-sm font-medium text-foreground">Sports Participation</span>
                <Badge
                  variant="outline"
                  className={
                    formData.currentlyInSports
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium"
                      : "bg-muted text-muted-foreground font-medium"
                  }
                >
                  {formData.currentlyInSports ? "Currently Active" : "No"}
                </Badge>
              </div>
            )}
          </section>

          <Separator />

          {/* Section: Medical Conditions */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Medical Conditions
                </h3>
              </div>
              {selectedConditionsCount > 0 && isEditing && (
                <Badge variant="outline" className="font-normal">
                  {selectedConditionsCount} selected
                </Badge>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                  {MEDICAL_CONDITIONS.map((condition) => {
                    const checked = (formData.medicalConditions || []).includes(condition);
                    return (
                      <label
                        key={condition}
                        htmlFor={`medical-${condition}`}
                        className={[
                          "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                          checked
                            ? "border-primary/40 bg-primary/5"
                            : "border-border hover:bg-muted/50",
                          saving ? "pointer-events-none opacity-60" : "",
                        ].join(" ")}
                      >
                        <Checkbox
                          id={`medical-${condition}`}
                          checked={checked}
                          onCheckedChange={(c) => handleMedicalConditionChange(condition, !!c)}
                          disabled={saving}
                        />
                        <span className="font-normal leading-none">{condition}</span>
                      </label>
                    );
                  })}
                  <label
                    htmlFor="medical-other"
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      showOtherInput
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:bg-muted/50",
                      saving ? "pointer-events-none opacity-60" : "",
                    ].join(" ")}
                  >
                    <Checkbox
                      id="medical-other"
                      checked={showOtherInput}
                      onCheckedChange={(c) => handleOtherCheckboxChange(!!c)}
                      disabled={saving}
                    />
                    <span className="font-normal leading-none">Other</span>
                  </label>
                </div>

                {showOtherInput && (
                  <div className="pt-1 max-w-md">
                    <Input
                      id="medical-other-text"
                      placeholder="Specify medical condition"
                      value={otherCondition}
                      onChange={(e) => handleOtherConditionTextChange(e.target.value)}
                      disabled={saving}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                {selectedConditionsCount > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(formData.medicalConditions || []).map((condition) => (
                      <Badge
                        key={condition}
                        variant="outline"
                        className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-medium py-1 px-3 text-xs"
                      >
                        {condition}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic px-1">
                    No medical conditions recorded.
                  </div>
                )}
              </div>
            )}
          </section>
        </form>
      </CardContent>
    </Card>
  );
}