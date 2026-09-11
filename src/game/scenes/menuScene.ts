import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import { createEmptySprite, createSprite } from "../../core/sprite";
import { utils } from "../../core/utils";
import { createMenu } from "./common/menu";
import { createParticles } from "./common/particles";
import { createText } from "./common/text";
import { createTransitionOverlay } from "./common/transitionOverlay";
import { createGameplayScene } from "./gameplayScene";

export const createMenuScene = () => {
  const scene = createScene((scene, game) => {
    game._worker._setMusic(2);

    const layerBg = createEmptySprite();
    const layerUi = createEmptySprite();
    const title = createText('UNICOP');
    title._position = [0.52, 0.2];
    title._scale = [0.1, 0.1];

    scene._rootSprite._addChildren([layerBg, layerUi]);

    const transition = createTransitionOverlay(game);

    // Full-screen background quad
    const bg = createSprite(assetLibrary._textures._absolute_bg, [1.5, 0.5], [10, 10]);
    layerBg._addChild(bg);

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
    starSpewer._position = [0.5, 0.5];

    const uni = createSprite(assetLibrary._textures._unicorn_one, [0.5, 0.5]);
    uni._updater = (s, g, d) => s._angle = s._angle + d;
    uni._setUniformScale(1);

    const menuBg = createSprite(assetLibrary._textures._absolute_bg, [0.5, 0.7]);
    menuBg._scale = [4, 0.4];
    menuBg._opacity = 0.8;

    const menu = createMenu([
      {
        _text: "START GAME",
        _onSelected() {
          transition._transitionTo(createGameplayScene(0));
        },
      },
      {
        _text: "LEVEL SELECT",
        _onSelected() {},
      },
    ]);

    menu._setUniformScale(0.05);
    menu._position = [0.5, 0.67];

    layerBg._addChildren([starSpewer, uni]);
    layerUi._addChildren([menuBg, menu, title, transition]);

    scene._updater = (s, g, d) => {
      title._position = utils._vectorAdd([0.53, 0.2], utils._vectorRotate([0,0.01], g._worker._ticks));
    };
  });

  return scene;
};
