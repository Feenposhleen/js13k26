import assetLibrary from "../../../core/asset_library";
import { FullState } from "../../../core/game_worker";
import { createSprite, Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createParticles } from "../common/particles";
import { createProjectile, textureByColor } from "./projectile";

const zookaPos: Vec = [-0.045, -0.15];
const zookaRecoilPos: Vec = [-0.1, -0.16];

export const createUnicorn = (game: FullState): Sprite => {
  const gameplayState = game._state._gameplay;
  let lastPointerDown = false;

  const unicorn = createSprite(assetLibrary._textures._unicorn_one, [0.5, 0.5], [0.25, 0.25]);
  const zooka = createSprite(assetLibrary._textures._unicorn_zooka, [...zookaPos], [0.5, 0.7]);
  const selected = createSprite(assetLibrary._textures._rainbow_red, [0, 0.025], [0.5, 0.6]);
  const flash = createSprite(assetLibrary._textures._particle, [0.05, -0.12], [0.5, 0.6]);

  zooka._addChild(selected);
  unicorn._addChild(zooka);
  unicorn._addChild(flash);

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
  gameplayState._layerFxBack._addChild(trail);

  unicorn._updater = (sprite, game, delta) => {
    // Switch sprite continuously
    sprite._texture =
      (game._state._ticks * 4) % 2 < 1
        ? assetLibrary._textures._unicorn_two
        : assetLibrary._textures._unicorn_one;

    // Smoothly track pointer position
    const pointerCoord = game._input._pointer._coord;
    const targetCoord: Vec = [0.1 + pointerCoord[0] * 0.1, utils._clamp(pointerCoord[1], 0.1, 0.8)];
    gameplayState._playerPosition = [...sprite._position];
    sprite._position = utils._vectorLerp(sprite._position, targetCoord, delta * 8);

    // Rotate towards movement direction with gentle bobbing
    const targetAngle = utils._sin(game._worker._ticks * 6) * 0.15;
    sprite._angle += (targetAngle - sprite._angle) * utils._clamp(delta * 5, 0, 1);

    // Fire on pointer click
    if (game._input._pointer._down && !lastPointerDown && gameplayState._playerCooldown < 0) {
      const projectile = createProjectile(game, unicorn._position, gameplayState._playerColor);
      gameplayState._layerFxFront._addChild(projectile);

      game._worker._setPostProgramValue(0, 0.2);
      game._worker._playSfx(6);
      sprite._scale = [0.32, 0.32];
      gameplayState._playerCooldown = 1;

      const color = utils._wrap(gameplayState._playerColor + 1, 0, 4);
      gameplayState._playerColor = color;
      zooka._position = [...zookaRecoilPos];
      flash._setUniformScale(1.4);
      selected._texture = textureByColor(color);
    } else {
      sprite._scale = utils._vectorLerp(sprite._scale, [0.25, 0.25], delta * 10);
      flash._scale = utils._vectorLerp(flash._scale, [0.0, 0.0], delta * 10);
      flash._angle += delta * 6;
      zooka._position = utils._vectorLerp(zooka._position, zookaPos, delta * 10);
    }

    lastPointerDown = game._input._pointer._down;
    gameplayState._playerCooldown -= delta;
  };

  return unicorn;
};
