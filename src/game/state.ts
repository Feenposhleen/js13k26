import { Vec } from "../core/utils";

export type GameState = {
  _playerPosition: Vec;
  _score: number;
  _ticks: number;
  _paused: boolean;
};

export const createState = (): GameState => ({
  _playerPosition: [0, 0],
  _score: 0,
  _ticks: 0,
  _paused: false,
});
