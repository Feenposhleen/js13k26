import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import { FullState } from "../../../core/game_worker";
import { createNode, Node } from "../../../core/node";
import { utils, Vec } from "../../../core/utils";
import { createParticles } from "../common/particles";
import { textureByColor } from "./projectile";

export type ColorNode = Node & { _color: number };

const enemyOriginAddend: Vec = [1, -0.5];

export const createEnemy = (
  game: FullState,
  texture: RawTexture,
  color: number | null,
  targetPosition: Vec,
): ColorNode => {
  const enemyOrigin = utils._vectorAdd(targetPosition, enemyOriginAddend);
  const enemy = createNode(
    texture,
    utils._vectorAdd(targetPosition, enemyOriginAddend),
    [0.2, 0.2],
  ) as ColorNode;
  enemy._color = color !== null ? color : -1;
  enemy._setTrackedMemberOf(game._state._gameplay._enemies);

  if (color !== null) {
    const colorTexture = createNode(textureByColor(color), [-0.09, -0.06], [0.5, 0.5]);
    colorTexture._rotation = -utils._pi / 2;
    enemy._addChild(colorTexture);
  }

  const rand = utils._rndFloat();
  enemy._updater = (s, g, d) => {
    s._position = utils._vectorLerp(
      enemyOrigin,
      targetPosition,
      utils._easeCubicOut(s._lifetime * 0.4),
    );

    s._position = utils._vectorAdd(s._position, [
      utils._cos(g._worker._ticks + rand * 2) * 0.01,
      utils._sin(g._worker._ticks + rand) * 0.01,
    ]);

    const targetAngle = utils._sin(g._worker._ticks * 6) * 0.05;
    s._rotation += (targetAngle - s._rotation) * utils._clamp(d * 5, 0, 1);
  };

  const trail = createParticles(
    assetLibrary._textures._particle,
    16,
    true,
    null,
    [-utils._pi - 0.05, -utils._pi + 0.05],
    [0.6, 0.8],
    [0.8, 1],
    [0.5, 0.5],
  );
  trail._position = [-0.18, 0];
  enemy._addChild(trail);

  return enemy;
};
