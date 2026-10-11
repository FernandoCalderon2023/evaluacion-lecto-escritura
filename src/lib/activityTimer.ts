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

export function stopActivity(timer: ActivityTimer, now: number, reading: boolean, finishedText = false) {
  const stoppedAt = Math.max(timer.startedAt, reading ? Math.min(now, timer.startedAt + 240_000) : now)
  const outcome: "completed" | "interrupted" | "finished" = reading && stoppedAt < timer.startedAt + 240_000 ? finishedText ? "finished" : "interrupted" : "completed"
  return { ...timer, stoppedAt, outcome }
}
