import React, { useEffect, useState } from "react";
import { SessionType, UploadKind } from "@grow-fitness/shared-types";
import type { UpdateKidDto } from "@grow-fitness/shared-schemas";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
import { uploadFileViaGcs } from "@/services/uploads.service";
import { useKid } from "@/contexts/kid/useKid";
import { FileDropzone } from "@/components/common/FileDropzone";
import { FieldError } from "@/components/common/FieldError";
import { kidProfileFormSchema, zodFieldErrorMap } from "@/lib/profile-form-schemas";

import { User, Calendar, Award, Heart, Loader2, Save } from "lucide-react";

const IMAGE_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

type KidFieldKey = "name" | "gender" | "birthDate" | "goal";

export function KidProfileTab() {
  const { toast } = useToast();
  const { selectedKid, isLoading: isKidLoading } = useKid();
  const kidId = selectedKid?.id;

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [kidFieldErrors, setKidFieldErrors] = useState<Partial<Record<KidFieldKey, string>>>({});

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

  const formatDateForInput = (dateValue?: string | Date) => {
    if (!dateValue) return '';
    const dateString = dateValue instanceof Date ? dateValue.toISOString() : dateValue;
    return dateString.split("T")[0];
  };

  useEffect(() => {
    if (!kidId) return;

    const fetchKidDetails = async () => {
      try {
        const fullKidData = await kidsService.getKidById(kidId);
        if (!fullKidData) throw new Error("No kid data received from API");

        setFormData({
          name: fullKidData.name || "",
          gender: fullKidData.gender || "",
          birthDate: formatDateForInput(fullKidData.birthDate),
          goal: fullKidData.goal || "",
          profilePhotoUrl: fullKidData.profilePhotoUrl || "",
          currentlyInSports: fullKidData.currentlyInSports || false,
          medicalConditions: fullKidData.medicalConditions || [],
          sessionType: fullKidData.sessionType || "INDIVIDUAL",
        });
        setProfilePhotoFile(null);
        setKidFieldErrors({});
      } catch (error: unknown) {
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
  }, [kidId, selectedKid, toast]);

  const clearKidError = (key: KidFieldKey) => {
    setKidFieldErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleInputChange = (field: keyof UpdateKidDto, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name' || field === 'gender' || field === 'birthDate' || field === 'goal') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kidId) return;

    const parsed = kidProfileFormSchema.safeParse({
      name: formData.name ?? '',
      gender: formData.gender ?? '',
      birthDate: formData.birthDate ? String(formData.birthDate) : '',
      goal: formData.goal ?? '',
    });

    if (!parsed.success) {
      setKidFieldErrors(zodFieldErrorMap(parsed.error.issues) as Partial<Record<KidFieldKey, string>>);
      return;
    }
    setKidFieldErrors({});

    try {
      setSaving(true);
      let profilePhotoUrl = formData.profilePhotoUrl?.trim() || undefined;

      if (profilePhotoFile) {
        try {
          setUploadingPhoto(true);
          const uploadResult = await uploadFileViaGcs(UploadKind.KID_AVATAR, kidId, profilePhotoFile);
          profilePhotoUrl = uploadResult.publicUrl;
        } catch (error) {
          toast({
            title: 'Upload failed',
            description:
              error instanceof Error ? error.message : 'Could not upload profile picture.',
            variant: 'destructive',
          });
          return;
        } finally {
          setUploadingPhoto(false);
        }
      }

      const payload: UpdateKidDto = {
        name: parsed.data.name,
        gender: parsed.data.gender,
        birthDate: parsed.data.birthDate,
        goal: parsed.data.goal ?? '',
        profilePhotoUrl,
        currentlyInSports: formData.currentlyInSports || false,
        medicalConditions: formData.medicalConditions ?? [],
        sessionType: formData.sessionType as SessionType,
      };

      const updatedKid = await kidsService.updateKid(kidId, payload);
      setFormData({
        name: updatedKid.name || '',
        gender: updatedKid.gender || '',
        birthDate: formatDateForInput(updatedKid.birthDate),
        goal: updatedKid.goal ?? '',
        profilePhotoUrl: updatedKid.profilePhotoUrl || '',
        currentlyInSports: updatedKid.currentlyInSports || false,
        medicalConditions: updatedKid.medicalConditions ?? [],
        sessionType: updatedKid.sessionType || SessionType.INDIVIDUAL,
      });
      setProfilePhotoFile(null);
      setKidFieldErrors({});

      toast({
        variant: 'success',
        title: 'Profile saved',
        description: updatedKid.name?.trim()
          ? `${updatedKid.name.trim()}'s profile was updated successfully.`
          : 'The profile was updated successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update kid profile.',
        variant: 'destructive',
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
        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start rounded-lg border bg-muted/30 p-4">
            <Avatar className="h-24 w-24 border-2 border-background shadow-sm">
              {formData.profilePhotoUrl ? (
                <AvatarImage
                  src={formData.profilePhotoUrl}
                  alt=""
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="text-lg">
                {(selectedKid.name || "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 w-full sm:w-auto">
              <Label>Profile photo</Label>
              <FileDropzone
                value={profilePhotoFile}
                onChange={setProfilePhotoFile}
                accept={IMAGE_UPLOAD_TYPES}
                maxSizeBytes={MAX_IMAGE_UPLOAD_BYTES}
                preview="image"
                label="Drop photo here or browse"
                description="JPEG, PNG, or WebP up to 5MB"
                disabled={saving || uploadingPhoto || !kidId}
              />
              <p className="text-xs text-muted-foreground">
                The selected photo uploads when you save changes.
              </p>
              {uploadingPhoto && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </div>
              )}
            </div>
          </div>

          {/* Grid layout for most fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="kid-name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Name *
              </Label>
              <Input
                id="kid-name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={saving}
                autoComplete="name"
                aria-invalid={Boolean(kidFieldErrors.name)}
                aria-describedby={
                  kidFieldErrors.name ? "kid-name-error" : undefined
                }
                className={kidFieldErrors.name ? "border-destructive" : undefined}
              />
              <FieldError id="kid-name-error" message={kidFieldErrors.name} />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="kid-gender" className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Gender *
              </Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(v) => handleInputChange("gender", v)}
                disabled={saving}
              >
                <SelectTrigger
                  id="kid-gender"
                  aria-invalid={Boolean(kidFieldErrors.gender)}
                  aria-describedby={
                    kidFieldErrors.gender ? "kid-gender-error" : undefined
                  }
                  className={
                    kidFieldErrors.gender ? "w-full border-destructive" : "w-full"
                  }
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FieldError id="kid-gender-error" message={kidFieldErrors.gender} />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="kid-birthDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Birth Date *
              </Label>
              <Input
                id="kid-birthDate"
                type="date"
                value={formatDateForInput(formData.birthDate)}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                disabled={saving}
                aria-invalid={Boolean(kidFieldErrors.birthDate)}
                aria-describedby={
                  kidFieldErrors.birthDate ? "kid-birthDate-error" : undefined
                }
                className={kidFieldErrors.birthDate ? "border-destructive" : undefined}
              />
              <FieldError
                id="kid-birthDate-error"
                message={kidFieldErrors.birthDate}
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
                  <SelectItem value="INDIVIDUAL">Private</SelectItem>
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
            <Label htmlFor="kid-goal" className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" /> Fitness Goal
            </Label>
            <Textarea
              id="kid-goal"
              value={formData.goal || ""}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              disabled={saving}
              placeholder="Enter fitness goals..."
              rows={4}
              aria-invalid={Boolean(kidFieldErrors.goal)}
              aria-describedby={
                kidFieldErrors.goal ? "kid-goal-error" : undefined
              }
              className={kidFieldErrors.goal ? "border-destructive" : undefined}
            />
            <FieldError id="kid-goal-error" message={kidFieldErrors.goal} />
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
            disabled={saving || uploadingPhoto}
          >
            {saving || uploadingPhoto ? (
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
