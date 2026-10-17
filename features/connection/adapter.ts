import type { Profile } from "@/features/profiles/model";

export type RuntimeConnectionStatus = "disconnected" | "connecting" | "connected";

export interface ConnectionAdapter {
  readonly mode: "native" | "simulation";
  connect(profile: Profile): Promise<void>;
  disconnect(): Promise<void>;
}

/**
 * Demo-only adapter. It changes UI state after a short delay and never creates
 * a device VPN interface or forwards traffic.
 */
export class SimulatedConnectionAdapter implements ConnectionAdapter {
  readonly mode = "simulation" as const;

  async connect(_profile: Profile): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 1400));
  }

  async disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

export const connectionAdapter: ConnectionAdapter = new SimulatedConnectionAdapter();
