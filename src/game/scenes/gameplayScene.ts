import createScene from "../../core/scene";
import { createEmptySprite, Sprite } from "../../core/sprite";
import { utils, Vec } from "../../core/utils";
import { createParticles } from "./common/particles";
import { createBackground } from "./gameplay/background";
import { ColorSprite } from "./gameplay/enemy";
import { createExplosion } from "./gameplay/fxPacks";
import { createLevel } from "./gameplay/level";
import { createProjectile } from "./gameplay/projectile";
import { createUnicorn } from "./gameplay/unicorn";

export type GameplayState = {
  // Layers
  _layerBg: Sprite;
  _layerFxBack: Sprite;
  _layerUi: Sprite;
  _layerFxFront: Sprite;
  _layerEntities: Sprite;

  // Player
  _playerColor: number;
  _playerPosition: Vec;
  _playerCooldown: number;
  _playerSpeed: number;

  // Level
  _levelNumber: number;
  _levelTotalEnemies: number;
  _levelRemainingEnemies: number;
  _levelTimeLeft: number;

  // Entities
  _enemies: Array<ColorSprite>;
  _projectiles: Array<ColorSprite>;
};

export const createGameplayState = (): GameplayState => ({
  _layerBg: createEmptySprite(),
  _layerFxBack: createEmptySprite(),
  _layerUi: createEmptySprite(),
  _layerFxFront: createEmptySprite(),
  _layerEntities: createEmptySprite(),

  _playerColor: 0,
  _playerPosition: [0, 0],
  _playerCooldown: 0,
  _playerSpeed: 1,

  _levelNumber: 0,
  _levelTotalEnemies: 0,
  _levelRemainingEnemies: 0,
  _levelTimeLeft: 99, // To avoid countdown race condition

  _enemies: [],
  _projectiles: [],
});

export const createGameplayScene = (level: number) => {
  const gameplayState = createGameplayState();

  const scene = createScene((scene, game) => {
    game._state._gameplay = gameplayState;

    scene._rootSprite._addChildren([
      gameplayState._layerBg,
      gameplayState._layerFxBack,
      gameplayState._layerEntities,
      gameplayState._layerFxFront,
      gameplayState._layerUi,
    ]);

    const bg = createBackground();
    gameplayState._layerBg._addChild(bg);

    gameplayState._layerEntities._addChild(createUnicorn(game));
    gameplayState._layerEntities._addChild(createLevel(game, level));

    game._worker._setMusic(1);
  });

  scene._updater = (scene, game, delta) => {
    let bloomValue = game._worker._getPostProgramValue(0);
    if (bloomValue > 0) {
      game._worker._setPostProgramValue(0, utils._max(0, bloomValue - delta * 2));
    }

    game._state._ticks += delta;

    // Check collisions
    game._state._gameplay._projectiles.forEach((projectile) => {
      const [enemy, distance] = utils._nearestEnemySprite(
        projectile._position,
        gameplayState._enemies,
      );
      if (enemy && distance < 0.06) {
        const projectileSplash = createParticles(
          projectile._texture!,
          4,
          false,
          null,
          [-0.1, 0.1],
          [0.6, 0.8],
          [0.4, 0.6],
          [0.1, 0.2],
          [-0.1, 0.1],
          [-0.05, 0.05],
        );

        projectileSplash._position = [...enemy._position];
        game._state._gameplay._layerFxFront._addChild(projectileSplash);
        projectile._dead = true;

        if (enemy._color < 0 || enemy._color === projectile._color) {
          enemy._dead = true;

          createExplosion(game._state._gameplay._layerFxFront, enemy._position, 0.8);
          game._worker._setPostProgramValue(0, 1);

          game._worker._playSfx(7);
        } else {
          projectile._dead = true;
          game._worker._playSfx(8);
        }
      }

      if (projectile._position[0] > 1.5) {
        projectile._dead = true;
      }
    });

    // Fire on pointer click
    if (game._input._pointer._down && gameplayState._playerCooldown < 0) {
      gameplayState._playerCooldown = 1;

      const projectile = createProjectile(
        game,
        gameplayState._playerPosition,
        gameplayState._playerColor,
      );
      gameplayState._layerFxFront._addChild(projectile);

      game._worker._setPostProgramValue(0, 0.2);
      game._worker._playSfx(6);

      const color = utils._wrap(gameplayState._playerColor + 1, 0, 4);
      gameplayState._playerColor = color;
    }

    gameplayState._playerCooldown -= delta;
  };

  return scene;
};
