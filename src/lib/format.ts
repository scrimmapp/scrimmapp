export function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// "Today at 2:30 PM" / "Yesterday at 6:15 PM" / "Aug 28, 6:15 PM" (adds the year only if not
// the current one), matching the OfferUp/Marketplace-style thread timestamps coaches expect.
export function formatMessageTimestamp(date: Date) {
  const now = new Date();
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (dayDiff === 0) return `Today at ${time}`;
  if (dayDiff === 1) return `Yesterday at ${time}`;

  const showYear = date.getFullYear() !== now.getFullYear();
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: showYear ? "numeric" : undefined,
  });
  return `${datePart}, ${time}`;
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
