import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createParticles } from "../common/particles";
import { createExplosion } from "./fxPacks";
import { colorByTexture, textureByColor } from "./projectile";

export type EnemySprite = Sprite & { _color: number };

const enemyOriginAddend: Vec = [1, -0.5];

export const createEnemy = (
  texture: RawTexture,
  color: number | null,
  fxLayer: Sprite,
  targetPosition: Vec,
): EnemySprite => {
  const enemyOrigin = utils._vectorAdd(targetPosition, enemyOriginAddend);
  const enemy = createSprite(
    texture,
    utils._vectorAdd(targetPosition, enemyOriginAddend),
    [0.2, 0.2],
  );

  if (color) {
    const colorTexture = createSprite(textureByColor(color), [-0.09, -0.06], [0.5, 0.5]);
    colorTexture._angle = -utils._pi / 2;
    enemy._addChild(colorTexture);
  }

  const rand = utils._rndFloat();

  enemy._updater = (s, g, d) => {
    s._position = utils._vectorLerp(
      enemyOrigin,
      utils._vectorAdd(targetPosition, [rand * 0.1, rand * 0.05]),
      utils._easeCubicOut(s._lifetime * 0.4),
    );

    s._position = utils._vectorAdd(s._position, [
      utils._cos(g._worker._ticks * 2 + rand) * 0.02,
      utils._sin(g._worker._ticks + rand) * 0.01,
    ]);

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

  return { ...enemy, _color: color || -1 };
};
