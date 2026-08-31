import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import { utils } from "../../core/utils";
import { createParticles } from "./common/particles";
import { createBackground } from "./gameplay/background";
import { createLayersState } from "./gameplay/layers";
import { createLevel } from "./gameplay/level";
import { createUnicorn } from "./gameplay/unicorn";

export const createGameplayScene = () => {
  const scene = createScene((scene, game) => {
    const layerState = createLayersState();
    game._state._layersState = layerState;

    scene._rootSprite._addChildren(Object.values(game._state._layersState));

    const bg = createBackground();
    layerState._bg._addChild(bg);

    game._state._layersState._entities._addChild(createUnicorn(game));
    game._state._layersState._entities._addChild(createLevel(game, 1));

    game._worker._setMusic(1);
  });

  scene._updater = (scene, game, delta) => {
    let bloomValue = game._worker._getPostProgramValue(0);
    if (bloomValue > 0) {
      game._worker._setPostProgramValue(0, utils._max(0, bloomValue - delta * 2));
    }

    game._state._ticks += delta;
  };

  return scene;
};
