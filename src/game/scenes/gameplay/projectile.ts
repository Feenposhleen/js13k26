import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createParticles } from "../common/particles";

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
  projectile._updater = (s, g, d) =>
    s._dead = s._position[0] > 1.5;

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
