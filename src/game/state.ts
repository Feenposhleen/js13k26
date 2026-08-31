import createSprite, { Sprite } from "../core/sprite";
import { Vec } from "../core/utils";
import { createLayersState, LayersState } from "./scenes/gameplay/layers";
import { createLevelState, LevelState } from "./scenes/gameplay/level";
import { createUnicornState, UnicornState } from "./scenes/gameplay/unicorn";

export type GameState = {
  _ticks: number;
  _layersState: LayersState;
  _levelState: LevelState;
  _unicornState: UnicornState;
};

export const createState = (): GameState => ({
  _ticks: 0,
  _layersState: createLayersState(),
  _levelState: createLevelState(),
  _unicornState: createUnicornState(),
});
