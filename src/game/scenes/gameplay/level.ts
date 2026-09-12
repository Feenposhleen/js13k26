import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import { FullState } from "../../../core/game_worker";
import { createNode, createEmptyNode } from "../../../core/node";
import { Scene } from "../../../core/scene";
import { utils } from "../../../core/utils";
import { createText } from "../common/text";
import { createTransitionOverlay } from "../common/transitionOverlay";
import { createEnemy } from "./enemy";
import { levelSpawnDuration, levelSpawns } from "./levelSpawns";

export const createLevel = (
  game: FullState,
  levelNr: number,
  onComplete: () => Scene,
  onFail: () => Scene,
) => {
  const gameplayState = game._state._gameplay;
  const remainingSpawns = utils._deepCopy(levelSpawns[levelNr]);
  const level = createEmptyNode();
  const textContainer = createEmptyNode();
  const enemyContainer = createEmptyNode();
  const transition = createTransitionOverlay();

  let done = false;
  const enemyCount = levelSpawns[levelNr].length;
  let textScale = 0.05;

  gameplayState._levelTotalEnemies = enemyCount;
  gameplayState._levelRemainingEnemies = enemyCount;
  gameplayState._levelTimeLeft = levelSpawnDuration(remainingSpawns) + 6;
  gameplayState._levelNumber = levelNr;

  const setText = (remainingEnemies: number) => {
    textContainer._children = [];
    const text = createText(`${remainingEnemies} ENEMIES LEFT`);
    textContainer._addChild(text);
    textScale = 0.4;
  };

  level._updater = (node, game, delta) => {
    if (textScale > 0.05) {
      textScale = utils._max(0.05, textScale - delta);
      textContainer._setUniformScale(textScale);
    }

    const newEnemyCount = remainingSpawns.length + enemyContainer._children.length;
    if (newEnemyCount !== game._state._gameplay._levelRemainingEnemies) {
      game._state._gameplay._levelRemainingEnemies = newEnemyCount;
      setText(newEnemyCount);
    }

    if (done) return;

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
      transition._transitionTo(onFail());
      done = true;
    } else if (game._state._gameplay._levelRemainingEnemies < 1) {
      transition._transitionTo(onComplete());
      done = true;
    }
  };

  level._addChild(enemyContainer);

  const textBg = createNode(assetLibrary._textures._ui_square, [0.2, 0.9], [1, 0.3], [0, 0], 0.8);
  level._addChild(textBg);

  textContainer._position = [0.21, 0.9];
  textContainer._setUniformScale(0.05);
  level._addChild(textContainer);

  setText(enemyCount);

  gameplayState._layerUi._addChild(transition);

  return level;
};
