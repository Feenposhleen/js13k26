import assetLibrary from "../../../core/asset_library";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createParticles } from "../common/particles";

export const createEnemyOne = (fxLayer: Sprite, startY: number, finalY: number) => {
  const enemy = createSprite(assetLibrary._textures._enemy_one, [0, startY], [0.2, 0.2]);
  enemy._updater = (s, g, d) => {
    s._position = utils._vectorLerp([0, startY], [0.7, finalY], s._lifetime / 4);
    const targetAngle = utils._sin(g._worker._ticks * 6) * 0.15;
    s._angle += (targetAngle - s._angle) * utils._clamp(d * 5, 0, 1);
  };

  const trail = createParticles(
    assetLibrary._textures._particle,
    32,
    true,
    enemy,
    [-utils._pi - 0.05, -utils._pi + 0.05],
    [0.4, 0.6],
    [0.3, 0.6],
    [0.08, 0.1],
  );
  fxLayer._addChild(trail);

  return enemy;
};
