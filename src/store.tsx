import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import {
  austinSample,
  closeTrip,
  startTrip,
  type Draft,
  type Trip,
} from "@/ledger";

type TripStore = {
  trip: Trip | null;
  draft: Draft | null;
  notice: string | null;
  beginCharge: () => void;
  saveCaps: (draft: Draft) => void;
  start: () => void;
  close: () => void;
  commit: (trip: Trip) => void;
};

const TripContext = createContext<TripStore | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<Trip | null>(() => austinSample());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const store = useMemo<TripStore>(
    () => ({
      trip,
      draft,
      notice,
      beginCharge: () => setDraft(null),
      saveCaps: (next) => setDraft(next),
      start: () => {
        const result = startTrip(trip);
        if (!result.ok) {
          setNotice("Starting another trip is declined until this one is closed.");
          return;
        }
        setNotice(null);
        setDraft(null);
        setTrip(result.trip);
      },
      close: () => {
        setTrip((current) => (current ? closeTrip(current) : current));
        setDraft(null);
      },
      commit: (next) => setTrip(next),
    }),
    [trip, draft, notice],
  );

  return <TripContext.Provider value={store}>{children}</TripContext.Provider>;
}

export function useTrip(): TripStore {
  const store = useContext(TripContext);
  if (!store) {
    throw new Error("useTrip must be used within TripProvider");
  }
  return store;
}
