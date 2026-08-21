// Postgres `date` columns can come back as either a JS Date or an already-formatted string
// depending on the driver path; this normalizes either into the "YYYY-MM-DD" string the
// frontend's <input type="date"> and display code expect.
export function toDateString(value: string | Date): string {
  if (typeof value === "string") return value;
  return value.toISOString().slice(0, 10);
}
