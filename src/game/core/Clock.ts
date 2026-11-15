export class MatchClock {
  private elapsedMs = 0;
  private readonly totalMs: number;
  private running = false;

  constructor(totalRealMs: number) {
    this.totalMs = totalRealMs;
  }

  public start(): void {
    this.running = true;
  }

  public stop(): void {
    this.running = false;
  }

  public reset(): void {
    this.elapsedMs = 0;
    this.running = false;
  }

  public tick(deltaMs: number): void {
    if (!this.running) {
      return;
    }
    this.elapsedMs = Math.min(this.totalMs, this.elapsedMs + deltaMs);
    if (this.elapsedMs >= this.totalMs) {
      this.running = false;
    }
  }

  public isRunning(): boolean {
    return this.running;
  }

  public isFinished(): boolean {
    return this.elapsedMs >= this.totalMs;
  }

  public elapsed(): number {
    return this.elapsedMs;
  }

  public remaining(): number {
    return Math.max(0, this.totalMs - this.elapsedMs);
  }

  public gameMinute(totalGameMinutes: number): number {
    if (this.totalMs === 0) {
      return 0;
    }
    return Math.min(
      totalGameMinutes,
      Math.floor((this.elapsedMs / this.totalMs) * totalGameMinutes)
    );
  }
}
