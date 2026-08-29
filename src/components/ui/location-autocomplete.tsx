"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface Suggestion {
  placeId: string;
  description: string;
}

// A verified-address text input backed by Google Places, with a hidden field carrying the
// resolved value so it still posts correctly inside a plain <form>. Debounced so a coach
// typing "Great Park" doesn't fire a request per keystroke.
export function LocationAutocomplete({
  name,
  defaultValue = "",
  placeholder,
  required,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setOpen((data.suggestions ?? []).length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }

  async function handleSelect(suggestion: Suggestion) {
    setOpen(false);
    setQuery(suggestion.description);
    try {
      const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(suggestion.placeId)}`);
      const data = await res.json();
      if (data.formattedAddress) setQuery(data.formattedAddress);
    } catch {
      // Keep the suggestion text as-is: a failed details lookup shouldn't block the coach.
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={query} />
      <Input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-control border border-rule-2 bg-surface shadow-lg">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="block w-full px-3 py-2 text-left text-[13px] text-ink-2 hover:bg-surface-2 hover:text-ink"
              >
                {s.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
