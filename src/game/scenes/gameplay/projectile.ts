import assetLibrary from "../../../core/asset_library";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createParallax } from "../common/parallax";

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
  const projectile = createSprite(
    textureByColor(color),
    [position[0], position[1] - 0.04],
    [0.1, 0.1],
  );
  projectile._velocity = [1, 0];
  return projectile;
};
