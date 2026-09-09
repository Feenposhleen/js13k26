import assetLibrary from "../../../core/asset_library";
import { FullState } from "../../../core/game_worker";
import { Scene } from "../../../core/scene";
import { createSprite, Sprite } from "../../../core/sprite";
import { utils } from "../../../core/utils";
import { createText } from "./text";

type TransitionOverlaySprite = Sprite & {
  _transitionTo: (nextScene: Scene) => void;
};

// Expects the anchor to be in a clean viewport space (not a child to a transformed sprite)
export const createTransitionOverlay = (game: FullState): TransitionOverlaySprite => {
  let nextScene: Scene;
  let transitionTimer = 1;

  const overlay = Object.assign(createSprite(assetLibrary._textures._absolute_bg, [0.5, 0.5]), {
    _transitionTo: (scene: Scene) => (nextScene = scene),
  });

  overlay._setUniformScale(4);

  overlay._updater = (s, g, d) => {
    if (nextScene) {
      transitionTimer = utils._min(1, transitionTimer + d);
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
