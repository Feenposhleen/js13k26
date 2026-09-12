import assetLibrary from "../../core/asset_library";
import createScene, { Scene } from "../../core/scene";
import { createEmptyNode, createNode } from "../../core/node";
import { createMenuPrompt } from "./common/menuPrompt";
import { createTransitionOverlay } from "./common/transitionOverlay";

export const createTransitionScene = (
  completed: boolean,
  onNextOrRetry: () => Scene,
  onMenu: () => Scene,
) => {
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
            game._worker._setScene(onNextOrRetry());
          },
        },
        {
          _text: "BACK TO MENU",
          _onSelected() {
            game._worker._setScene(onMenu());
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
