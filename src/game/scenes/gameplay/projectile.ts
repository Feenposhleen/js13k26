import assetLibrary from "../../../core/asset_library";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createParallax } from "../common/parallax";
import { createParticles } from "../common/particles";

export const textureByColor = (color: number) => {
  return color == 0
    ? assetLibrary._textures._rainbow_red
    : color == 1
      ? assetLibrary._textures._rainbow_yellow
      : color == 2
        ? assetLibrary._textures._rainbow_green
        : assetLibrary._textures._rainbow_blue;
};

export const createProjectile = (position: Vec, color: number) => {
  const texture =
    textureByColor(color);
  const projectile = createSprite(
    texture,
    [position[0], position[1] - 0.04],
    [0.1, 0.1],
  );
  projectile._velocity = [1, 0];


  const particles = createParticles(texture, 8, true, null, [-utils._pi - 0.02, -utils._pi + 0.02], [0.1, 0.15], [9.0, 12.4], [1.4, 1.4], [0,0], [0,0]);

  projectile._addChild(particles);

  return projectile;
};
