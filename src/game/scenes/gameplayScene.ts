import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import { utils } from "../../core/utils";
import { createParticles } from "./common/particles";
import { createBackground } from "./gameplay/background";
import { createSpawner, level1 } from "./gameplay/spawner";
import unicorn from "./gameplay/unicorn";

export const createGameplayScene = () => {
  const scene = createScene((scene, game) => {
    // Start background music loop (1)
    game._worker._setMusic(1);

    const layerBg = game._state._layerBg;
    const layerFxBack = game._state._layerFxBack;
    const layerEntities = game._state._layerEntities;
    const layerFxFront = game._state._layerFxFront;
    const layerUi = game._state._layerUi;

    scene._rootSprite._addChildren([layerBg, layerFxBack, layerEntities, layerFxFront, layerUi]);

    const bg = createBackground();
    layerBg._addChild(bg);

    const trail = createParticles(
      assetLibrary._textures._particle,
      32,
      true,
      unicorn,
      [-utils._pi - 0.05, -utils._pi + 0.05],
      [0.4, 0.6],
      [0.4, 0.8],
      [0.1, 0.3],
    );
    trail._position = [-0.02, 0];

    layerFxBack._addChild(trail);
    layerEntities._addChild(unicorn);
    layerEntities._addChild(createSpawner(game, level1));
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
