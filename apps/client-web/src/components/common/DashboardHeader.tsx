import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { kidsService } from "@/services/kids.service";
import { useKid } from "@/contexts/kid/useKid";
import { useAuth } from '@/contexts/useAuth';
import type { Kid } from "@grow-fitness/shared-types";

export function DashboardHeader() {
  const { user, role, isLoading } = useAuth();
  const {
    kids,
    setKids,
    selectedKid,
    setSelectedKid,
    isLoading: isKidLoading,
    setIsLoading: setIsKidLoading,
  } = useKid();

  /* ---------- ROLE CONFIG ---------- */
  const roleConfig = {
    PARENT: {
      greeting: `Hi, Welcome Back! 👋`,
      subtitle: "Track your child's fitness journey",
    },
    COACH: {
      greeting: `Hi Coach 👋`,
      subtitle: "Ready to inspire young athletes today?",
    },
  };

  /* ---------- FETCH KIDS (PARENT ONLY) ---------- */
  useEffect(() => {
    if (role !== "PARENT" || !user?.id) return;

    const fetchKids = async () => {
      try {
        setIsKidLoading(true);

        const res = await kidsService.getKids(1, 50, user.id);

      const mappedKids = res.data.map((kid: Kid) => ({
        id: kid.id,
        parentId: kid.parentId,
        name: kid.name,
        gender: kid.gender,
        birthDate: new Date(kid.birthDate),
        currentlyInSports: kid.currentlyInSports,
        medicalConditions: kid.medicalConditions || [],
        sessionType: kid.sessionType,
        createdAt: kid.createdAt ? new Date(kid.createdAt) : new Date(),
        updatedAt: kid.updatedAt ? new Date(kid.updatedAt) : new Date(),
      }));

        setKids(mappedKids);

        // ✅ auto-select ONLY once
        if (selectedKid || mappedKids.length === 0) return;

        setSelectedKid(mappedKids[0]);
      } catch (error) {
        console.error("❌ Failed to fetch kids", error);
      } finally {
        setIsKidLoading(false);
      }
    };

    fetchKids();
  }, [role, user?.id, setKids, setSelectedKid, setIsKidLoading, selectedKid]);

  /* ---------- LOADING STATE ---------- */
  if (isLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-gray-500">Loading user...</p>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    console.log("🧒 Selected kid changed:", selectedKid);
  }, [selectedKid]);

  const config = role ? roleConfig[role] : null;

  /* ---------- UI ---------- */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* ---------- LEFT ---------- */}
        <div className="text-center md:text-left">
          <h1 className="text-base sm:text-lg font-semibold text-gray-800">
            {config?.greeting}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {config?.subtitle}
          </p>

          {role === "PARENT" && selectedKid && (
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              {isKidLoading
                ? "Loading..."
                : `Selected: ${selectedKid.name}`}
            </p>
          )}
        </div>

        {/* ---------- RIGHT (KID SELECTOR) ---------- */}
        {role === "PARENT" && (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="text-sm font-bold text-gray-700">
              Kid&apos;s Name:
            </span>

            {kids.length === 1 ? (
              <span className="px-3 py-1 rounded-md bg-gray-100 text-sm font-medium">
                {kids[0].name}
              </span>
            ) : (
              <Select
                value={selectedKid?.id ?? ""}
                onValueChange={(value) => {
                  const kid = kids.find((k) => k.id === value);
                  if (kid) setSelectedKid(kid);
                }}
              >
                <SelectTrigger className="w-[200px] text-sm">
                  <SelectValue placeholder="Select Kid" />
                </SelectTrigger>

                <SelectContent>
                  {kids.map((kid) => (
                    <SelectItem key={kid.id} value={kid.id}>
                      {kid.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
