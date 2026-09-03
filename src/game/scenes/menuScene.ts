import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import { createEmptySprite, createSprite } from "../../core/sprite";
import { utils } from "../../core/utils";
import { createMenu } from "./common/menu";
import { createParticles } from "./common/particles";
import { createGameplayScene } from "./gameplayScene";

export const createMenuScene = () => {
  const scene = createScene((scene, game) => {
    game._worker._setMusic(2);

    const layerBg = createEmptySprite();
    const layerUi = createEmptySprite();

    scene._rootSprite._addChildren([layerBg, layerUi]);

    // Full-screen background quad
    const bg = createSprite(assetLibrary._textures._ui_square_bg, [1.5, 0.5], [10, 10]);
    layerBg._addChild(bg);

    const starSpewer = createParticles(
      assetLibrary._textures._star,
      32,
      true,
      null,
      [-utils._pi, utils._pi],
      [1.4, 1.6],
      [0.4, 0.9],
      [0.08, 0.1],
    );
    starSpewer._position = [0.5, 0.5];
    layerBg._addChild(starSpewer);

    let uni = createSprite(assetLibrary._textures._cloud_one, [0.5, 0.5]);
    uni._updater = (s, g, d) => {
      s._angle = s._angle + d;
    };

    scene._rootSprite._addChild(uni);

    let menuBg = createSprite(assetLibrary._textures._square_bg, [0.5, 0.5]);
    scene._rootSprite._addChild(menuBg);

    const menu = createMenu([
      {
        _text: "START GAME",
        _onSelected() {
          game._worker._setScene(createGameplayScene(0));
        },
      },
      {
        _text: "LEVEL SELECT",
        _onSelected() {},
      },
    ]);

    menu._setUniformScale(0.05);
    menu._position = [0.5, 0.45];
    scene._rootSprite._addChild(menu);
  });

  return scene;
};
