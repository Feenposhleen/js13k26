import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import { createEmptySprite, createSprite } from "../../core/sprite";
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

    const menu = createMenu([
      {
        _text: "START GAME",
        _onSelected() {
          game._worker._setScene(createGameplayScene());
          console.log("One clicked");
        },
      },
      {
        _text: "LEVEL SELECT",
        _onSelected() {
          console.log("Two clicked");
        },
      },
    ]);

    menu._setUniformScale(0.05);
    menu._position = [0.3, 0.4];
    scene._rootSprite._addChild(menu);
  });

  return scene;
};
