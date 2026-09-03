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
    selected._texture = textureByColor(gameplayState._playerColor);

    // Wiggle and bob
    const targetAngle = utils._sin(game._worker._ticks * 6) * 0.15;
    sprite._angle += (targetAngle - sprite._angle) * utils._clamp(delta * 5, 0, 1);

    const inverseCooldownMod = utils._clamp(1 - gameplayState._playerCooldown, 0, 1);
    sprite._scale = utils._vectorLerp([0.4, 0.4], [0.25, 0.25], inverseCooldownMod);
    zooka._position = utils._vectorLerp(zookaRecoilPos, zookaPos, inverseCooldownMod);
    flash._setUniformScale(utils._lerpRange([1.4, 0], inverseCooldownMod * 3));
    flash._angle += delta * 6;

    lastPointerDown = game._input._pointer._down;
    gameplayState._playerCooldown -= delta;
  };

  return unicorn;
};
