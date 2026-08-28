import assetLibrary from "../../../core/asset_library";
import { FullState } from "../../../core/game_worker";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createText } from "../common/text";
import { createEnemyOne } from "./enemyOne";
import { createEnemyTwo } from "./enemyTwo";

const createSpawn = (delay: number, type: number, finalPosition: Vec) => ({
  _delay: delay,
  _type: type,
  _finalPosition: finalPosition,
});

type Spawn = ReturnType<typeof createSpawn>;

export const level1: Array<Spawn> = [
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
  createSpawn(.5, 4, [0.55, 0.8]),
  createSpawn(.5, 4, [0.4, 0.6]),
  createSpawn(.5, 4, [0.55, 0.6]),

  createSpawn(4, 4, [0.4, 0.4]),
  createSpawn(.5, 4, [0.55, 0.4]),
  createSpawn(.5, 4, [0.7, 0.4]),
  createSpawn(.5, 4, [0.85, 0.4]),

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

  const setText = (remainingEnemies: number) => {
    textContainer._children = [];
    const text = createText(`${remainingEnemies} ENEMIES LEFT`);
    textContainer._addChild(text);
  };


  spawner._updater = (s, g, d) => {
    if (spawns.length > 0 && (spawns[0]._delay -= d) < 0) {
      const spawn = spawns.shift()!;

      let enemy: Sprite | null = null;
      if (spawn._type < 4) {
        enemy = createEnemyTwo(spawn._type, game._state._layerFxBack, spawn._finalPosition);
      } else if (spawn._type == 4) {
        enemy = createEnemyOne(game._state._layerFxBack, spawn._finalPosition);
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
  };

  spawner._addChild(enemyContainer);

  const textBg = createSprite(assetLibrary._textures._ui_square, [0.2, 0.9], [1., 0.3], [0,0], 0.8);
  spawner._addChild(textBg);

  textContainer._position = [0.05, 0.9];
  textContainer._setUniformScale(0.05);
  spawner._addChild(textContainer);

  setText(enemyCount);

  return spawner;
};
