import createSprite, { Sprite } from "../core/sprite";
import { Vec } from "../core/utils";

export type GameState = {
  _layerBg: Sprite;
  _layerFxFront: Sprite;
  _layerEntities: Sprite;
  _layerFxBack: Sprite;
  _layerUi: Sprite;
  _playerPosition: Vec;
  _score: number;
  _color: number;
  _cooldown: number;
  _ticks: number;
  _projectiles: Sprite[];
};

export const createState = (): GameState => ({
  _layerBg: createSprite(null, [0, 0]),
  _layerFxBack: createSprite(null, [0, 0]),
  _layerUi: createSprite(null, [0, 0]),
  _layerFxFront: createSprite(null, [0, 0]),
  _layerEntities: createSprite(null, [0, 0]),
  _playerPosition: [0, 0],
  _score: 0,
  _color: 0,
  _cooldown: 0,
  _ticks: 0,
  _projectiles: [],
});
