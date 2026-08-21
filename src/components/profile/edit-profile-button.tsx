"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import type { profiles } from "@/db/schema";

export function EditProfileButton({ profile }: { profile: typeof profiles.$inferSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" className="normal-case" onClick={() => setOpen(true)}>
        Edit Profile
      </Button>
      <EditProfileDialog profile={profile} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
