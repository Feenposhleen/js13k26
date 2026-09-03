import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import { createEmptySprite, createSprite } from "../../core/sprite";
import { createMenu } from "./common/menu";
import { createParticles } from "./common/particles";
import { createGameplayScene } from "./gameplayScene";

export const createTransitionScene = (previousLevel: number, completed: boolean) => {
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
        _text: completed ? "NEXT LEVEL" : "RETRY",
        _onSelected() {
          game._worker._setScene(
            createGameplayScene(completed ? previousLevel + 1 : previousLevel),
          );
        },
      },
      {
        _text: "BACK TO MENU",
        _onSelected() {},
      },
    ]);

    menu._setUniformScale(0.05);
    menu._position = [0.3, 0.4];
    scene._rootSprite._addChild(menu);
  });

  return scene;
};
