import { sleep } from "@/lib/sleep";

/** Simulated network delay so loading states are visible while prototyping. */
export function latency(min = 500, max = 900): Promise<void> {
  return sleep(min + Math.random() * (max - min));
}
