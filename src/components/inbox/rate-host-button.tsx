"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RateHostDialog } from "@/components/inbox/rate-host-dialog";

export function RateHostButton({ connectionId, hostTeamName }: { connectionId: string; hostTeamName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
        Rate Host
      </Button>
      <RateHostDialog connectionId={connectionId} hostTeamName={hostTeamName} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
