export type ActivityTimer = { startedAt: number; stoppedAt?: number }
export function elapsedSeconds(timer: ActivityTimer | undefined, now: number): number {
  if (!timer) return 0
  return Math.max(0, Math.floor(((timer.stoppedAt ?? now) - timer.startedAt) / 1000))
}
export function timerDisplay(seconds: number): string {
  const value = Math.max(0, Math.floor(seconds))
  return `${Math.floor(value / 60).toString().padStart(2, "0")}:${(value % 60).toString().padStart(2, "0")}`
}
export function readingExpired(timer: ActivityTimer | undefined, now: number): boolean {
  return !!timer && timer.stoppedAt === undefined && elapsedSeconds(timer, now) >= 240
}
