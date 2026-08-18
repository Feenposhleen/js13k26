import assetLibrary from "../../../core/asset_library";
import createSprite from "../../../core/sprite";
import { utils } from "../../../core/utils";
import { createParticles } from "../common/particles";

const unicorn = createSprite(assetLibrary._textures._unicorn_one, [0.5, 0.5], [0.25, 0.25]);
const zooka = createSprite(assetLibrary._textures._unicorn_zooka, [-0.045, -0.15], [0.5, 0.7]);
const selected = createSprite(assetLibrary._textures._rainbow_red, [0, 0.025], [0.5, 0.6]);
zooka._addChild(selected);
unicorn._addChild(zooka);

let lastPointerDown = false;

unicorn._updater = (sprite, game, delta) => {
  sprite._texture =
    (game._state._ticks * 4) % 2 < 1
      ? assetLibrary._textures._unicorn_two
      : assetLibrary._textures._unicorn_one;
  // Smoothly track pointer position
  const pointerCoord = game._input._pointer._coord;
  game._state._playerPosition = [...sprite._position];
  sprite._position = utils._vectorLerp(sprite._position, pointerCoord, delta * 8);

  // Rotate towards movement direction with gentle bobbing
  const targetAngle = utils._sin(game._worker._ticks * 6) * 0.15;
  sprite._angle += (targetAngle - sprite._angle) * utils._clamp(delta * 5, 0, 1);

  // Trigger SFX on pointer click
  if (game._input._pointer._down && !lastPointerDown) {
    game._state._score++;
    game._worker._playSfx(1);
    sprite._scale = [0.32, 0.32];
    game._state._lastFire = game._state._ticks;

    const color = utils._wrap(game._state._color + 1, 0, 4);
    game._state._color = color;
    selected._texture = color == 0
      ? assetLibrary._textures._rainbow_red
      : color == 1
        ? assetLibrary._textures._rainbow_yellow
        : color == 2
          ? assetLibrary._textures._rainbow_green
          : assetLibrary._textures._rainbow_blue;

  } else {
    sprite._scale = utils._vectorLerp(sprite._scale, [0.25, 0.25], delta * 10);
  }
  lastPointerDown = game._input._pointer._down;
};

export default unicorn;
