import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import { FullState } from "../../../core/game_worker";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createText } from "../common/text";
import { createEnemy, EnemySprite } from "./enemy";
import { createExplosion } from "./fxPacks";

const createSpawn = (delay: number, type: number, finalPosition: Vec) => ({
  _delay: delay,
  _type: type,
  _finalPosition: finalPosition,
});

const safezoneTL: Vec = [0.3, 0.1];
const safezoneWH: Vec = [0.6, 0.55];

export type Spawn = ReturnType<typeof createSpawn>;

export type LevelState = {
  _totalEnemyCount: number;
  _remainingEnemyCount: number;
  _timeLeft: number;
  _enemies: Array<EnemySprite>;
  _onEnemyHit: (enemy: EnemySprite, color: number) => void;
};

export const createLevelState = (
  level?: number,
  onEnemyHit?: (enemy: EnemySprite, color: number) => void,
): LevelState => ({
  _totalEnemyCount: level ? spawns[level].length : 0,
  _remainingEnemyCount: level ? spawns[level].length : 0,
  _enemies: [],
  _timeLeft: level ? spawns[level].reduce((res, curr) => res + curr._delay, 0) : 0,
  _onEnemyHit: onEnemyHit || ((_, __) => {}),
});

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

export const createLevel = (g: FullState, levelNr: number) => {
  const remainingSpawns = utils._deepCopy(spawns[levelNr]);
  const level = createSprite(null, [0, 0]);
  const textContainer = createSprite(null, [0, 0]);
  const enemyContainer = createSprite(null, [0, 0]);

  const levelState = createLevelState(levelNr, (enemy, color) => {
    if (!color || enemy._color === color) {
      enemy._dead = true;
      levelState._enemies = levelState._enemies.filter((x) => x != enemy);

      createExplosion(g._state._layersState._fxFront, enemy._position, 0.8);
      g._worker._setPostProgramValue(0, 1);
      g._worker._playSfx(7);
    } else {
      g._worker._playSfx(8);
    }
  });

  g._state._levelState = levelState;

  let enemyCount = spawns.length;
  let textScale = 0.05;

  const setText = (remainingEnemies: number) => {
    textContainer._children = [];
    const text = createText(`${remainingEnemies} ENEMIES LEFT`);
    textContainer._addChild(text);
    textScale = 0.4;
  };

  level._updater = (s, g, d) => {
    if (remainingSpawns.length > 0 && (remainingSpawns[0]._delay -= d) < 0) {
      const spawn = remainingSpawns.shift()!;

      const finalPosition = utils._vectorAdd(
        safezoneTL,
        utils._vectorVectorMul(spawn._finalPosition, safezoneWH),
      );

      const texture: RawTexture =
        spawn._type < 4 ? assetLibrary._textures._enemy_two : assetLibrary._textures._enemy_one;

      const enemy = createEnemy(
        texture,
        spawn._type < 4 ? spawn._type : null,
        g._state._layersState._fxBack,
        finalPosition,
      );

      enemyContainer._addChild(enemy);

      levelState._timeLeft = utils._max(0, levelState._timeLeft - d);
    }

    const newEnemyCount = spawns.length + enemyContainer._children.length;
    if (newEnemyCount !== levelState._remainingEnemyCount) {
      levelState._remainingEnemyCount = newEnemyCount;
      setText(enemyCount);
    }

    if (textScale > 0.05) {
      textScale = utils._max(0.05, textScale - d);
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
