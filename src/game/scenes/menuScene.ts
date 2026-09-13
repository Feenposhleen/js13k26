import assetLibrary from "../../core/asset_library";
import createScene, { Scene } from "../../core/scene";
import { createEmptyNode, createNode } from "../../core/node";
import { utils, Vec } from "../../core/utils";
import { createMenu, MenuOption } from "./common/menu";
import { createParticles } from "./common/particles";
import { createText } from "./common/text";
import { createTransitionOverlay, TransitionOverlayNode } from "./common/transitionOverlay";
import { createTitleText } from "./common/titleText";

const createBaseMenuScene = (
  titleText: string,
  menuOptionsFactory: (transition: TransitionOverlayNode) => MenuOption[],
) => {
  return createScene((scene, game) => {
    game._worker._setMusic(2);

    const layerBg = createEmptyNode();
    const layerUi = createEmptyNode();
    const title = createTitleText(titleText, 0);
    title._position = [0.52, 0.2];

    scene._rootNode._addChildren([layerBg, layerUi]);

    const transition = createTransitionOverlay();

    // Full-screen background quad
    const bg = createNode(assetLibrary._textures._absolute_bg, [1.5, 0.5], [10, 10]);
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
    starSpewer._position = [0.5, 0.3];

    const uni = createNode(assetLibrary._textures._unicorn_one, [0.5, 0.3]);
    uni._updater = (s, g, d) => (s._rotation = s._rotation + d);
    uni._setUniformScale(1);

    const options = menuOptionsFactory(transition);

    const menu = createMenu(options);
    menu._setUniformScale(0.05);
    menu._position = [0.5, 0.6];

    layerBg._addChildren([starSpewer, uni]);
    layerUi._addChildren([menu, title, transition]);
  });
};

export const createMenuScene = (onStartGame: () => Scene, onLevelSelect: () => Scene) =>
  createBaseMenuScene("UNICOP", (transition) => [
    {
      _text: "START GAME",
      _onSelected() {
        transition._transitionTo(onStartGame());
      },
    },
    {
      _text: "LEVEL SELECT",
      _onSelected() {
        transition._transitionTo(onLevelSelect());
      },
    },
  ]);

export const createLevelSelectScene = (
  onSelectLevel: (level: number) => Scene,
  onBack: () => Scene,
) =>
  createBaseMenuScene("LEVEL SELECT", (transition) => [
    ...[1, 2, 3, 4, 5].map((lvl) => ({
      _text: `LEVEL ${lvl}`,
      _onSelected() {
        transition._transitionTo(onSelectLevel(lvl - 1));
      },
    })),
    {
      _text: "BACK",
      _onSelected() {
        transition._transitionTo(onBack());
      },
    },
  ]);
