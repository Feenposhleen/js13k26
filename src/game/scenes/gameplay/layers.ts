import { FullState } from "../../../core/game_worker";
import { Scene } from "../../../core/scene";
import createSprite, { Sprite } from "../../../core/sprite";

export type LayersState = {
  _bg: Sprite;
  _fxBack: Sprite;
  _ui: Sprite;
  _fxFront: Sprite;
  _entities: Sprite;
};

export const createLayersState = (): LayersState => {
  const layers = {
    _bg: createSprite(null, [0, 0]),
    _fxBack: createSprite(null, [0, 0]),
    _entities: createSprite(null, [0, 0]),
    _fxFront: createSprite(null, [0, 0]),
    _ui: createSprite(null, [0, 0]),
  };

  return layers;
};
