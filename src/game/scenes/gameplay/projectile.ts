import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createParticles } from "../common/particles";
import { EnemySprite } from "./enemy";
import { createExplosion } from "./fxPacks";

const projectileTextures = [
  assetLibrary._textures._rainbow_red,
  assetLibrary._textures._rainbow_yellow,
  assetLibrary._textures._rainbow_green,
  assetLibrary._textures._rainbow_blue,
];

export const textureByColor = (color: number) => projectileTextures[color];

export const colorByTexture = (texture: RawTexture) => projectileTextures.indexOf(texture);

export const createProjectile = (position: Vec, color: number) => {
  const texture = textureByColor(color);
  const projectile = createSprite(texture, [position[0], position[1] - 0.04], [0.1, 0.1]);
  projectile._velocity = [1, 0];
  projectile._updater = (s, g, d) => {
    // Check projectile collisions
    const [enemy, distance] = utils._nearestEnemySprite(s._position, g._state._levelState._enemies);
    if (enemy && distance < 0.06) {
      const projectileSplash = createParticles(
        s._texture!,
        4,
        false,
        null,
        [-0.1, 0.1],
        [0.6, 0.8],
        [0.4, 0.6],
        [0.1, 0.2],
        [-0.1, 0.1],
        [-0.05, 0.05],
      );

      projectileSplash._position = [...enemy._position];
      g._state._layersState._fxFront._addChild(projectileSplash);
      s._dead = true;

      g._state._levelState._onEnemyHit(enemy, color);

      if (enemy._color < 0 || enemy._color === color) {
        enemy._dead = true;
        particles._dead = true;

        createExplosion(g._state._layersState._fxFront, enemy._position, 0.8);
        g._worker._setPostProgramValue(0, 1);

        g._worker._playSfx(7);
      } else {
        projectile._dead = true;
        g._worker._playSfx(8);
      }
    }

    s._dead = s._position[0] > 1.5;
  };

  const particles = createParticles(
    texture,
    8,
    true,
    null,
    [-utils._pi - 0.02, -utils._pi + 0.02],
    [0.1, 0.15],
    [9.0, 12.4],
    [1.4, 1.4],
    [0, 0],
    [0, 0],
  );

  projectile._addChild(particles);

  return projectile;
};
