"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsNav } from "@/components/business/settings/SettingsNav";
import { ProfileSection } from "@/components/business/settings/ProfileSection";
import { KYBSection } from "@/components/business/settings/KYBSection";
import { PoliciesSection } from "@/components/business/settings/PoliciesSection";
import { SettingsSkeleton } from "@/components/business/settings/SettingsSkeleton";
import { useBusinessStore } from "@/providers/business-store";
import { useBusiness } from "@/hooks/business/use-business";
import { useUpdateBusiness } from "@/hooks/business/use-business-settings";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import type { UpdateBusinessRequest } from "@/lib/business-types";

type Section = "profile" | "verification" | "policies";

export default function SettingsPage() {
  const { activeBusinessId } = useBusinessStore();
  const bizId = activeBusinessId;

  const { data: business, isLoading } = useBusiness(bizId);
  const { data: myPermissions } = useMyPermissions(bizId);
  const updateMutation = useUpdateBusiness(bizId);

  const [activeSection, setActiveSection] = useState<Section>("profile");

  const canManage = myPermissions?.includes("biz:settings:manage") ?? false;

  if (isLoading || !business) {
    return <SettingsSkeleton />;
  }

  function handleSave(data: UpdateBusinessRequest) {
    if (!canManage) {
      toast.error("You do not have permission to update settings");
      return;
    }
    updateMutation.mutate(data, {
      onSuccess: () => toast.success("Settings saved"),
      onError: () => toast.error("Failed to save settings"),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" />

      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Nav */}
        <SettingsNav
          activeSection={activeSection}
          onSectionChange={(s) => setActiveSection(s as Section)}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "profile" && (
            <ProfileSection
              business={business}
              onSave={handleSave}
              isSaving={updateMutation.isPending}
            />
          )}

          {activeSection === "verification" && (
            <KYBSection currentLevel={business.kybLevel} />
          )}

          {activeSection === "policies" && <PoliciesSection />}
        </div>
      </div>
    </div>
  );
}
