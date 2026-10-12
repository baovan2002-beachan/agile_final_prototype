import { useCallback, useEffect, useState } from "react";

type Status = "loading" | "error" | "ready";

/** Simulates an async fetch of `data`. Default delay 400ms; `fail` makes it end in "error". */
export function useMockQuery<T>(data: T, opts?: { delayMs?: number; fail?: boolean }) {
  const { delayMs = 400, fail = false } = opts ?? {};
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus("loading");
    const id = setTimeout(() => setStatus(fail ? "error" : "ready"), delayMs);
    return () => clearTimeout(id);
  }, [attempt, delayMs, fail]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { status, data: status === "ready" ? data : undefined, retry } as {
    status: Status;
    data: T | undefined;
    retry(): void;
  };
}
