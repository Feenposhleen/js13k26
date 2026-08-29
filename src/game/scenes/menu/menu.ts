import assetLibrary from "../../../core/asset_library";
import createScene from "../../../core/scene";
import createSprite from "../../../core/sprite";
import { utils } from "../../../core/utils";
import { createParticles } from "../common/particles";
import unicorn from "../gameplay/unicorn";

export const createMenuScene = () => {
  const scene = createScene((scene, game) => {
    game._worker._setMusic(2);

    const layerBg = game._state._layerBg;
    const layerFxBack = game._state._layerFxBack;
    const layerUi = game._state._layerUi;

    scene._rootSprite._addChildren([layerBg, layerFxBack, layerUi]);

    // Full-screen background quad
    const bg = createSprite(assetLibrary._textures._ui_square_bg, [1.5, 0.5], [10, 10]);
    layerBg._addChild(bg);
  });


  return scene;
};
