import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import { createEmptyNode, createNode } from "../../core/node";
import { createMenuPrompt } from "./common/menuPrompt";
import { createTransitionOverlay } from "./common/transitionOverlay";
import { getCutsceneForLevel } from "./cutscene/cutsceneData";
import { createCutsceneScene } from "./cutsceneScene";
import { createGameplayScene } from "./gameplayScene";
import { createMenuScene } from "./menuScene";

export const createTransitionScene = (previousLevel: number, completed: boolean) => {
  const scene = createScene((scene, game) => {
    game._worker._setMusic(2);

    const layerBg = createEmptyNode();
    const layerUi = createEmptyNode();
    const transition = createTransitionOverlay();

    scene._rootNode._addChildren([layerBg, layerUi]);

    // Full-screen background quad
    const bg = createNode(assetLibrary._textures._absolute_bg, [1.5, 0.5], [10, 10]);
    layerBg._addChild(bg);

    const menu = createMenuPrompt(
      [
        {
          _text: completed ? "NEXT LEVEL" : "RETRY",
          _onSelected() {
            if (completed) {
              const nextLevel = previousLevel + 1;
              const cutscene = getCutsceneForLevel(nextLevel);
              if (cutscene) {
                game._worker._setScene(createCutsceneScene(nextLevel, cutscene));
              } else {
                game._worker._setScene(createGameplayScene(nextLevel));
              }
            } else {
              game._worker._setScene(createGameplayScene(previousLevel));
            }
          },
        },
        {
          _text: "BACK TO MENU",
          _onSelected() {
            game._worker._setScene(createMenuScene());
          },
        },
      ],
      [0.5, 0.4],
    );

    layerUi._addChild(menu);
    layerUi._addChild(transition);
  });

  return scene;
};
