import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditProfileButton } from "@/components/profile/edit-profile-button";
import { TeamsManager } from "@/components/profile/teams-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileById, countListingsForProfile, listTeamsForProfile } from "@/db/queries";
import { genderToDisplay, levelToDisplay } from "@/db/mappers";
import { initialsFrom } from "@/lib/format";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfileById(user.id);
  if (!profile) redirect("/login");

  const listingCount = await countListingsForProfile(user.id);
  const teams = await listTeamsForProfile(user.id);
  const hasRatings = profile.ratingsCount > 0;

  return (
    <div className="mx-auto w-full max-w-xl space-y-2.5 px-4 py-4">
      <div className="text-center">
        <h1 className="font-display text-lg font-extrabold tracking-tight text-ink md:text-xl">Coach Profile</h1>
      </div>

      <Card className="space-y-2.5 p-3.5">
        <div className="flex items-center justify-between gap-2.5 border-b border-rule pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pitch text-sm font-black text-pitch-contrast">
              {initialsFrom(profile.coachName)}
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">{profile.coachName}</p>
              <p className="text-[12px] text-muted">{profile.teamName} · {levelToDisplay(profile.orgType)}</p>
            </div>
          </div>
          <EditProfileButton profile={profile} />
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold text-ink-2">Reliability score</span>
          {hasRatings ? (
            <Badge tone="gold" className="gap-1">
              <span className="flex items-center gap-px">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={9} strokeWidth={0} className="fill-current" />
                ))}
              </span>
              {profile.reliabilityScore.toFixed(1)} · {profile.ratingsCount} ratings
            </Badge>
          ) : (
            <Badge tone="muted">No ratings yet</Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold text-ink-2">Listings posted</span>
          <span className="font-bold text-ink">{listingCount}</span>
        </div>
        {profile.clubName && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-ink-2">Club</span>
            <span className="font-bold text-ink">{profile.clubName}</span>
          </div>
        )}
        {profile.division && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-ink-2">Division</span>
            <span className="font-bold text-ink">{profile.division}</span>
          </div>
        )}
        {(profile.defaultAgeGroup || profile.defaultGender) && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-ink-2">Usual roster</span>
            <span className="font-bold text-ink">
              {[profile.defaultGender ? genderToDisplay(profile.defaultGender) : null, profile.defaultAgeGroup]
                .filter(Boolean)
                .join(" ")}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold text-ink-2">Contact email</span>
          <span className="font-bold text-ink">{profile.contactEmail}</span>
        </div>
        {profile.phone && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-ink-2">Phone</span>
            <span className="font-bold text-ink">{profile.phone}</span>
          </div>
        )}
      </Card>

      <TeamsManager teams={teams} />
    </div>
  );
}
