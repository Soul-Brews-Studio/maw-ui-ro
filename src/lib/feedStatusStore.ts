import { create } from "zustand";
import type { PaneStatus } from "./types";

interface FeedStatusStore {
  /** target → PaneStatus */
  statuses: Record<string, PaneStatus>;
  setStatus: (target: string, status: PaneStatus) => void;
  getStatus: (target: string) => PaneStatus;
}

export const useFeedStatusStore = create<FeedStatusStore>()((set, get) => ({
  statuses: {},
  setStatus: (target, status) => set((s) => {
    if (s.statuses[target] === status) return s;
    return { statuses: { ...s.statuses, [target]: status } };
  }),
  getStatus: (target) => get().statuses[target] || "idle",
}));

/** Hook: subscribe to a single agent's status (no re-render from other agents) */
export function useAgentStatus(target: string): PaneStatus {
  return useFeedStatusStore((s) => s.statuses[target] || "idle");
}
