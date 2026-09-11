import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import { createEmptySprite, createSprite } from "../../core/sprite";
import { createMenuPrompt } from "./common/menuPrompt";
import { createTransitionOverlay } from "./common/transitionOverlay";
import { createGameplayScene } from "./gameplayScene";

export const createTransitionScene = (previousLevel: number, completed: boolean) => {
  const scene = createScene((scene, game) => {
    game._worker._setMusic(2);

    const layerBg = createEmptySprite();
    const layerUi = createEmptySprite();

    const transition = createTransitionOverlay(game);

    scene._rootSprite._addChildren([layerBg, layerUi]);

    // Full-screen background quad
    const bg = createSprite(assetLibrary._textures._ui_square_bg, [1.5, 0.5], [10, 10]);
    layerBg._addChild(bg);

    const menu = createMenuPrompt(
      [
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
      ],
      [0.5, 0.4],
    );

    layerUi._addChild(menu);
    layerUi._addChild(transition);
  });

  return scene;
};
