import { useEffect, useRef, useState } from "react";
import { application, initialBandId } from "../../../data/familyFas";
import { TODAY } from "./shared";
import type { SyncStatus } from "./logic";

/** ASSUMPTION: mock SingPass income sync. The outcome is chosen in the demo control; it returns a band id, never an exact income. */
export type Outcome = "b2" | "b3" | "fail";

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [bandId, setBandId] = useState<string>(initialBandId);
  const [syncedOn, setSyncedOn] = useState(application.submittedOn);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function run(outcome: Outcome) {
    setStatus("loading");
    timer.current = setTimeout(() => {
      if (outcome === "fail") return setStatus("error");
      setBandId(outcome);
      setSyncedOn(TODAY);
      setStatus("success");
    }, 1200);
  }
  return { status, bandId, syncedOn, run };
}
