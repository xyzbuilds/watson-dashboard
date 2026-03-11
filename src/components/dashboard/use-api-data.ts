"use client";

import { useEffect, useState } from "react";

export function useApiData<T>(url: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const response = await fetch(url, { cache: "no-store" });
        const json = await response.json();
        if (active) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Request failed");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const timer = window.setInterval(load, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [url]);

  return { data, loading, error };
}
