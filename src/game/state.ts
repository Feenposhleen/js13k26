import { createGameplayState, GameplayState } from "./scenes/gameplayScene";

export type GameState = {
  _ticks: number;
  _level: number;
  _gameplay: GameplayState;
};

export const createState = (): GameState => ({
  _ticks: 0,
  _level: 0,
  _gameplay: createGameplayState(),
});
