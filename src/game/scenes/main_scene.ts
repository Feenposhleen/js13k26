import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import createSprite, { Sprite } from "../../core/sprite";
import { utils, Vec } from "../../core/utils";
import { createParticles } from "./common/particles";
import { createBackground } from "./gameplay/background";
import { createEnemyOne } from "./gameplay/enemyOne";
import { createEnemyTwo } from "./gameplay/enemyTwo";
import unicorn from "./gameplay/unicorn";

const createSpawn = (delay: number, type: number, finalPosition: Vec) => ({
  _delay: delay,
  _type: type,
  _finalPosition: finalPosition,
});

type Spawn = ReturnType<typeof createSpawn>;

const spawns: Array<Spawn> = [
  createSpawn(3, 0, [0.5, 0.2]),
  createSpawn(0.1, 1, [0.6, 0.4]),
  createSpawn(0.1, 2, [0.6, 0.6]),
  createSpawn(0.1, 3, [0.5, 0.8]),

  createSpawn(6, 4, [0.8, 0.2]),
  createSpawn(0.1, 4, [0.8, 0.4]),
  createSpawn(0.1, 4, [0.8, 0.6]),
  createSpawn(0.1, 4, [0.8, 0.8]),
];

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
  });

  scene._updater = (scene, game, delta) => {
    if (spawns.length > 0 && (spawns[0]._delay -= delta) < 0) {
      const spawn = spawns.shift()!;

      let enemy: Sprite | null = null;
      if (spawn._type < 4) {
        enemy = createEnemyTwo(spawn._type, game._state._layerFxBack, spawn._finalPosition);
      } else if (spawn._type == 4) {
        enemy = createEnemyOne(game._state._layerFxBack, spawn._finalPosition);
      }

      if (enemy) game._state._layerEntities._addChild(enemy);
    }
    game._state._ticks += delta;
  };

  return scene;
};
