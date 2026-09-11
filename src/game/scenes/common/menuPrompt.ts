import assetLibrary from "../../../core/asset_library";
import { createEmptySprite, createSprite, Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createMenu, MenuOption } from "./menu";
import { createParticles } from "./particles";

export const createMenuPrompt = (
  options: Array<MenuOption>,
  position: Vec = [0.5, 0.4],
  emitterPosition: Vec = [0.5, 0.5],
  menuScale: number = 0.05,
): Sprite => {
  const container = createEmptySprite();

  const starSpewer = createParticles(
    assetLibrary._textures._star,
    32,
    true,
    null,
    [-utils._pi, utils._pi],
    [1, 1.2],
    [0.4, 0.9],
    [0.5, 0.8],
  );
  starSpewer._position = [...emitterPosition];

  const menuYCenter = position[1] + ((options.length - 1) * 1.2 * menuScale) / 2;
  const menuBg = createSprite(
    assetLibrary._textures._absolute_bg,
    [position[0], menuYCenter],
    [4, 0.4],
    [0, 0],
    0.8,
  );

  const menu = createMenu(options);
  menu._setUniformScale(menuScale);
  menu._position = [...position];

  container._addChildren([starSpewer, menuBg, menu]);

  let lastPos: Vec = [...position];
  container._updater = (_s, _g, _d) => {
    if (container._position[0] !== 0 || container._position[1] !== 0) {
      lastPos = [...container._position];
      menu._position = [...lastPos];
      menuBg._position = [lastPos[0], lastPos[1] + ((options.length - 1) * 1.2 * menuScale) / 2];
      container._position = [0, 0];
    }
  };

  container._setUniformScale = (scale: number) => {
    menuScale = scale;
    menu._setUniformScale(scale);
    menuBg._position = [lastPos[0], lastPos[1] + ((options.length - 1) * 1.2 * menuScale) / 2];
  };

  return container;
};
