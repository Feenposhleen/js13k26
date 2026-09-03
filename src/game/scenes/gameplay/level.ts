import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import { FullState } from "../../../core/game_worker";
import { createSprite, Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createText } from "../common/text";
import { createEnemy, ColorSprite } from "./enemy";
import { createExplosion } from "./fxPacks";

const createSpawn = (delay: number, type: number, finalPosition: Vec) => ({
  _delay: delay,
  _type: type,
  _finalPosition: finalPosition,
});

const safezoneTL: Vec = [0.3, 0.1];
const safezoneWH: Vec = [0.6, 0.55];

export type Spawn = ReturnType<typeof createSpawn>;

export const spawns: Array<Array<Spawn>> = [
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
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
  ],
];

export const createLevel = (game: FullState, levelNr: number) => {
  const remainingSpawns = utils._deepCopy(spawns[levelNr]);
  const level = createSprite(null, [0, 0]);
  const textContainer = createSprite(null, [0, 0]);
  const enemyContainer = createSprite(null, [0, 0]);

  let enemyCount = spawns[levelNr].length;
  let textScale = 0.05;

  const setText = (remainingEnemies: number) => {
    textContainer._children = [];
    const text = createText(`${remainingEnemies} ENEMIES LEFT`);
    textContainer._addChild(text);
    textScale = 0.4;
  };

  level._updater = (sprite, game, delta) => {
    if (remainingSpawns.length > 0 && (remainingSpawns[0]._delay -= delta) < 0) {
      const spawn = remainingSpawns.shift()!;

      const finalPosition = utils._vectorAdd(
        safezoneTL,
        utils._vectorVectorMul(spawn._finalPosition, safezoneWH),
      );

      const texture: RawTexture =
        spawn._type < 4 ? assetLibrary._textures._enemy_two : assetLibrary._textures._enemy_one;

      const enemy = createEnemy(game, texture, spawn._type < 4 ? spawn._type : null, finalPosition);

      enemyContainer._addChild(enemy);

      game._state._gameplay._levelTimeLeft = utils._max(
        0,
        game._state._gameplay._levelTimeLeft - delta,
      );
    }

    const newEnemyCount = remainingSpawns.length + enemyContainer._children.length;
    if (newEnemyCount !== game._state._gameplay._levelRemainingEnemies) {
      game._state._gameplay._levelRemainingEnemies = newEnemyCount;
      setText(newEnemyCount);
    }

    if (textScale > 0.05) {
      textScale = utils._max(0.05, textScale - delta);
      textContainer._setUniformScale(textScale);
    }
  };

  level._addChild(enemyContainer);

  const textBg = createSprite(assetLibrary._textures._ui_square, [0.2, 0.9], [1, 0.3], [0, 0], 0.8);
  level._addChild(textBg);

  textContainer._position = [0.05, 0.9];
  textContainer._setUniformScale(0.05);
  level._addChild(textContainer);

  setText(enemyCount);

  return level;
};
