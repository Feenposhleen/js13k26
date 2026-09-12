import assetLibrary from "../../../core/asset_library";
import { Scene } from "../../../core/scene";
import { createNode, Node } from "../../../core/node";
import { utils } from "../../../core/utils";

export type TransitionOverlayNode = Node & {
  _transitionTo: (nextScene: Scene) => void;
};

// Expects the anchor to be in a clean viewport space (not a child to a transformed node)
export const createTransitionOverlay = (): TransitionOverlayNode => {
  let nextScene: Scene;
  let transitionTimer = 1;

  const overlay = Object.assign(createNode(assetLibrary._textures._absolute_bg, [0.5, 0.5]), {
    _transitionTo: (scene: Scene) => (nextScene = scene),
  });

  overlay._setUniformScale(4);

  overlay._updater = (s, g, d) => {
    if (nextScene) {
      transitionTimer = utils._min(1, transitionTimer + d * 0.8);
      if (transitionTimer >= 1) {
        g._worker._setScene(nextScene);
      }
    } else {
      transitionTimer = utils._max(0, transitionTimer - d);
    }

    g._worker._setPostProgramValue(1, 0.02 + transitionTimer * 1.8);
    s._opacity = transitionTimer;
  };

  return overlay;
};
