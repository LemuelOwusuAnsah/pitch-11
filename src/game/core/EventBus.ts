import Phaser from 'phaser';

export type GameEvents = {
  'match:phase-changed': { from: string; to: string };
  'match:score-changed': { home: number; away: number };
  'match:clock-tick': { elapsedMs: number };
  'player:possession-changed': { playerId: string | null; team: 'home' | 'away' | null };
  'ball:kicked': { byPlayerId: string; power: number };
  'ball:goal-scored': { side: 'home' | 'away' };
  'input:charge-start': undefined;
  'input:charge-release': { power: number };
  'input:switch-player': undefined;
};

class TypedEventBus extends Phaser.Events.EventEmitter {
  public emitEvent<K extends keyof GameEvents>(
    event: K,
    payload: GameEvents[K]
  ): boolean {
    return super.emit(event, payload);
  }

  public onEvent<K extends keyof GameEvents>(
    event: K,
    fn: (payload: GameEvents[K]) => void,
    context?: unknown
  ): this {
    return super.on(event, fn, context);
  }

  public onceEvent<K extends keyof GameEvents>(
    event: K,
    fn: (payload: GameEvents[K]) => void,
    context?: unknown
  ): this {
    return super.once(event, fn, context);
  }

  public offEvent<K extends keyof GameEvents>(
    event: K,
    fn?: (payload: GameEvents[K]) => void,
    context?: unknown
  ): this {
    return super.off(event, fn, context);
  }
}

export const EventBus = new TypedEventBus();
