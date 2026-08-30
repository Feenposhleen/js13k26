import assetLibrary from "../../../core/asset_library";
import { FullState } from "../../../core/game_worker";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createText } from "../common/text";
import { createEnemy } from "./enemy";

const createSpawn = (delay: number, type: number, finalPosition: Vec) => ({
  _delay: delay,
  _type: type,
  _finalPosition: finalPosition,
});

const safezoneTL: Vec = [0.3, 0.1];
const safezoneWH: Vec = [0.6, 0.55];

export type Spawn = ReturnType<typeof createSpawn>;

export const level1: Array<Spawn> = [
  createSpawn(3, 4, [0, 0]),
  createSpawn(0, 4, [0, 0.25]),
  createSpawn(0, 4, [0, 0.5]),
  createSpawn(0, 4, [0, 0.75]),
  createSpawn(0, 4, [0.25, 0]),
  createSpawn(0, 4, [0.25, 0.25]),
  createSpawn(0, 4, [0.25, 0.5]),
  createSpawn(0, 4, [0.25, 0.75]),
  createSpawn(0, 4, [0.5, 0]),
  createSpawn(0, 4, [0.5, 0.25]),
  createSpawn(0, 4, [0.5, 0.5]),
  createSpawn(0, 4, [0.5, 0.75]),
  createSpawn(0, 4, [0.75, 0]),
  createSpawn(0, 4, [0.75, 0.25]),
  createSpawn(0, 4, [0.75, 0.5]),
  createSpawn(0, 4, [0.75, 0.75]),
  createSpawn(0, 4, [1, 0]),
  createSpawn(0, 4, [1, 0.25]),
  createSpawn(0, 4, [1, 0.5]),
  createSpawn(0, 4, [1, 0.75]),

  // createSpawn(3, 4, [0, 0.5]),
  // createSpawn(1, 4, [0.5, 0.5]),
  // createSpawn(1, 4, [1, 0.5]),

  // createSpawn(3, 4, [0.5, 0]),
  // createSpawn(0, 4, [0, 0.5]),
  // createSpawn(0, 4, [0.5, 0]),

  // createSpawn(3, 4, [0, 0]),
  // createSpawn(1, 4, [0, 0.5]),
  // createSpawn(1, 4, [0, 1]),

  // createSpawn(3, 4, [0, 0.2]),
  // createSpawn(0, 4, [0.5, 0.2]),
  // createSpawn(0, 4, [1, 0.2]),

  // createSpawn(2, 4, [0, 0.8]),
  // createSpawn(0, 4, [0.5, 0.8]),
  // createSpawn(0, 4, [1, 0.8]),

  // createSpawn(3, 4, [0, 0]),
  // createSpawn(1, 4, [0, 0.5]),
  // createSpawn(1, 4, [0, 1]),
  // createSpawn(1, 4, [0.5, 0]),
  // createSpawn(1, 4, [0.5, 0.5]),
  // createSpawn(1, 4, [0.5, 1]),
  // createSpawn(1, 4, [1, 0]),
  // createSpawn(1, 4, [1, 0.5]),
  // createSpawn(1, 4, [1, 1]),
];

export const level2: Array<Spawn> = [
  createSpawn(3, 4, [0.4, 0.5]),
  createSpawn(2, 4, [0.55, 0.2]),
  createSpawn(2, 4, [0.4, 0.6]),

  createSpawn(2, 4, [0.7, 0.6]),
  createSpawn(2, 4, [0.7, 0.8]),
  createSpawn(2, 4, [0.7, 0.4]),
  createSpawn(2, 4, [0.5, 0.6]),
  createSpawn(2, 4, [0.5, 0.4]),
  createSpawn(2, 4, [0.5, 0.4]),

  createSpawn(4, 4, [0.4, 0.8]),
  createSpawn(0.5, 4, [0.55, 0.8]),
  createSpawn(0.5, 4, [0.4, 0.6]),
  createSpawn(0.5, 4, [0.55, 0.6]),

  createSpawn(4, 4, [0.4, 0.4]),
  createSpawn(0.5, 4, [0.55, 0.4]),
  createSpawn(0.5, 4, [0.7, 0.4]),
  createSpawn(0.5, 4, [0.85, 0.4]),

  createSpawn(4, 4, [0.8, 0.2]),
  createSpawn(0.1, 4, [0.8, 0.4]),
  createSpawn(0.1, 4, [0.8, 0.6]),
  createSpawn(0.1, 4, [0.8, 0.8]),
];

export const level3: Array<Spawn> = [
  createSpawn(3, 4, [0.4, 0.5]),
  createSpawn(2, 4, [0.55, 0.2]),
  createSpawn(2, 4, [0.4, 0.6]),

  createSpawn(2, 4, [0.7, 0.6]),
  createSpawn(2, 4, [0.7, 0.8]),
  createSpawn(2, 4, [0.7, 0.4]),
  createSpawn(2, 4, [0.5, 0.6]),
  createSpawn(2, 4, [0.5, 0.4]),
  createSpawn(2, 4, [0.5, 0.4]),

  createSpawn(4, 4, [0.4, 0.8]),
  createSpawn(0.5, 4, [0.55, 0.8]),
  createSpawn(0.5, 4, [0.4, 0.6]),
  createSpawn(0.5, 4, [0.55, 0.6]),

  createSpawn(4, 4, [0.4, 0.4]),
  createSpawn(0.5, 4, [0.55, 0.4]),
  createSpawn(0.5, 4, [0.7, 0.4]),
  createSpawn(0.5, 4, [0.85, 0.4]),

  createSpawn(4, 4, [0.8, 0.2]),
  createSpawn(0.1, 4, [0.8, 0.4]),
  createSpawn(0.1, 4, [0.8, 0.6]),
  createSpawn(0.1, 4, [0.8, 0.8]),
];

export const level4: Array<Spawn> = [
  createSpawn(3, 4, [0.4, 0.5]),
  createSpawn(2, 4, [0.55, 0.2]),
  createSpawn(2, 4, [0.4, 0.6]),

  createSpawn(2, 4, [0.7, 0.6]),
  createSpawn(2, 4, [0.7, 0.8]),
  createSpawn(2, 4, [0.7, 0.4]),
  createSpawn(2, 4, [0.5, 0.6]),
  createSpawn(2, 4, [0.5, 0.4]),
  createSpawn(2, 4, [0.5, 0.4]),

  createSpawn(4, 4, [0.4, 0.8]),
  createSpawn(0.5, 4, [0.55, 0.8]),
  createSpawn(0.5, 4, [0.4, 0.6]),
  createSpawn(0.5, 4, [0.55, 0.6]),

  createSpawn(4, 4, [0.4, 0.4]),
  createSpawn(0.5, 4, [0.55, 0.4]),
  createSpawn(0.5, 4, [0.7, 0.4]),
  createSpawn(0.5, 4, [0.85, 0.4]),

  createSpawn(4, 4, [0.8, 0.2]),
  createSpawn(0.1, 4, [0.8, 0.4]),
  createSpawn(0.1, 4, [0.8, 0.6]),
  createSpawn(0.1, 4, [0.8, 0.8]),
];

export const level5: Array<Spawn> = [
  createSpawn(3, 4, [0.4, 0.5]),
  createSpawn(2, 4, [0.55, 0.2]),
  createSpawn(2, 4, [0.4, 0.6]),

  createSpawn(2, 4, [0.7, 0.6]),
  createSpawn(2, 4, [0.7, 0.8]),
  createSpawn(2, 4, [0.7, 0.4]),
  createSpawn(2, 4, [0.5, 0.6]),
  createSpawn(2, 4, [0.5, 0.4]),
  createSpawn(2, 4, [0.5, 0.4]),

  createSpawn(4, 4, [0.4, 0.8]),
  createSpawn(0.5, 4, [0.55, 0.8]),
  createSpawn(0.5, 4, [0.4, 0.6]),
  createSpawn(0.5, 4, [0.55, 0.6]),

  createSpawn(4, 4, [0.4, 0.4]),
  createSpawn(0.5, 4, [0.55, 0.4]),
  createSpawn(0.5, 4, [0.7, 0.4]),
  createSpawn(0.5, 4, [0.85, 0.4]),

  createSpawn(4, 4, [0.8, 0.2]),
  createSpawn(0.1, 4, [0.8, 0.4]),
  createSpawn(0.1, 4, [0.8, 0.6]),
  createSpawn(0.1, 4, [0.8, 0.8]),
];

export const createSpawner = (game: FullState, level: Array<Spawn>) => {
  const spawns = [...level];
  const spawner = createSprite(null, [0, 0]);
  const textContainer = createSprite(null, [0, 0]);
  const enemyContainer = createSprite(null, [0, 0]);
  let enemyCount = spawns.length;
  let textScale = 0.05;

  const setText = (remainingEnemies: number) => {
    textContainer._children = [];
    const text = createText(`${remainingEnemies} ENEMIES LEFT`);
    textContainer._addChild(text);
    textScale = 0.4;
  };

  spawner._updater = (s, g, d) => {
    if (spawns.length > 0 && (spawns[0]._delay -= d) < 0) {
      const spawn = spawns.shift()!;

      const finalPosition = utils._vectorAdd(
        safezoneTL,
        utils._vectorVectorMul(spawn._finalPosition, safezoneWH),
      );

      let enemy: Sprite | null = null;
      if (spawn._type < 4) {
        enemy = createEnemy(
          assetLibrary._textures._enemy_two,
          spawn._type,
          game._state._layerFxBack,
          finalPosition,
        );
      } else if (spawn._type == 4) {
        enemy = createEnemy(
          assetLibrary._textures._enemy_one,
          null,
          game._state._layerFxBack,
          finalPosition,
        );
      }

      if (enemy) {
        enemyContainer._addChild(enemy);
      }
    }

    const newEnemyCount = spawns.length + enemyContainer._children.length;
    if (newEnemyCount !== enemyCount) {
      enemyCount = newEnemyCount;
      setText(enemyCount);
    }

    if (textScale > 0.05) {
      textScale = utils._max(0.05, textScale - d);
      textContainer._setUniformScale(textScale);
    }
  };

  spawner._addChild(enemyContainer);

  const textBg = createSprite(assetLibrary._textures._ui_square, [0.2, 0.9], [1, 0.3], [0, 0], 0.8);
  spawner._addChild(textBg);

  textContainer._position = [0.05, 0.9];
  textContainer._setUniformScale(0.05);
  spawner._addChild(textContainer);

  setText(enemyCount);

  return spawner;
};
