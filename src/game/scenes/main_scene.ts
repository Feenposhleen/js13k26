import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import createSprite from "../../core/sprite";
import { utils } from "../../core/utils";
import { createParticles } from "./common/particles";
import { createBackground } from "./gameplay/background";
import { createEnemyOne } from "./gameplay/enemyOne";
import { createEnemyTwo } from "./gameplay/enemyTwo";
import unicorn from "./gameplay/unicorn";

export const createMainScene = () => {
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

    // Main interactive player sprite
    const trail = createParticles(
      assetLibrary._textures._particle,
      32,
      true,
      unicorn,
      [-utils._pi - 0.05, -utils._pi + 0.05],
      [0.4, 0.6],
      [0.4, 0.8],
      [0.1, 0.2],
    );
    trail._position = [-0.02, 0];

    layerFxBack._addChild(trail);
    layerEntities._addChild(unicorn);

    setInterval(() => {
      layerEntities._addChild(
        utils._rndBool() ? createEnemyTwo(
          utils._rndInt(0,4),
          layerFxBack,
          utils._rndRange(-1, -0.4),
          utils._rndRange(0.2, 0.8)
        ) : createEnemyOne(
                  layerFxBack,
                  utils._rndRange(-1, -0.4),
                  utils._rndRange(0.2, 0.8)
                )
      );
    },
      1000
    );
  });

  scene._updater = (scene, game, delta) => {
    game._state._ticks += delta;
  };

  return scene;
};
