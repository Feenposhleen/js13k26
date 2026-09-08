import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import { FullState } from "../../../core/game_worker";
import { createSprite, Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createText } from "../common/text";
import { createTransitionScene } from "../transitionScene";
import { createEnemy, ColorSprite } from "./enemy";
import { createExplosion } from "./fxPacks";
import { levelSpawns } from "./levelSpawns";

export const createLevel = (game: FullState, levelNr: number) => {
  const gameplayState = game._state._gameplay;
  const remainingSpawns = utils._deepCopy(levelSpawns[levelNr]);
  const level = createSprite(null, [0, 0]);
  const textContainer = createSprite(null, [0, 0]);
  const enemyContainer = createSprite(null, [0, 0]);

  let completed = false;
  let failed = false;
  let transitionCountdown = 2;
  let enemyCount = levelSpawns[levelNr].length;
  let textScale = 0.05;

  gameplayState._levelTotalEnemies = enemyCount;
  gameplayState._levelRemainingEnemies = enemyCount;
  gameplayState._levelTimeLeft = enemyCount * 2;
  gameplayState._levelNumber = levelNr;

  const setText = (remainingEnemies: number) => {
    textContainer._children = [];
    const text = createText(`${remainingEnemies} ENEMIES LEFT`);
    textContainer._addChild(text);
    textScale = 0.4;
  };

  level._updater = (sprite, game, delta) => {
    // ALways do this
    const newEnemyCount = remainingSpawns.length + enemyContainer._children.length;
    if (newEnemyCount !== game._state._gameplay._levelRemainingEnemies) {
      game._state._gameplay._levelRemainingEnemies = newEnemyCount;
      setText(newEnemyCount);
    }

    if (textScale > 0.05) {
      textScale = utils._max(0.05, textScale - delta);
      textContainer._setUniformScale(textScale);
    }

    if (completed || failed) {
      transitionCountdown -= delta;
      if (transitionCountdown < 0) {
        const nextScene = createTransitionScene(levelNr, completed);
        game._worker._setScene(nextScene);
      }
      return;
    }

    if (remainingSpawns.length > 0 && (remainingSpawns[0]._delay -= delta) < 0) {
      const spawn = remainingSpawns.shift()!;

      const texture: RawTexture =
        spawn._type < 4 ? assetLibrary._textures._enemy_two : assetLibrary._textures._enemy_one;

      const enemy = createEnemy(
        game,
        texture,
        spawn._type < 4 ? spawn._type : null,
        spawn._finalPosition,
      );

      enemyContainer._addChild(enemy);
    }

    game._state._gameplay._levelTimeLeft -= delta;

    if (game._state._gameplay._levelTimeLeft < 0) {
      failed = true;
    } else if (game._state._gameplay._levelRemainingEnemies < 1) {
      completed = true;
    }
  };

  level._addChild(enemyContainer);

  const textBg = createSprite(assetLibrary._textures._ui_square, [0.2, 0.9], [1, 0.3], [0, 0], 0.8);
  level._addChild(textBg);

  textContainer._position = [0.21, 0.9];
  textContainer._setUniformScale(0.05);
  level._addChild(textContainer);

  setText(enemyCount);

  return level;
};
