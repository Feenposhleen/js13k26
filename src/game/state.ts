export type GameState = {
  _score: number;
  _ticks: number;
  _paused: boolean;
};

export const createState = (): GameState => ({
  _score: 0,
  _ticks: 0,
  _paused: false,
});
