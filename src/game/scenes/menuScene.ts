import assetLibrary from "../../core/asset_library";
import createScene, { Scene } from "../../core/scene";
import { createEmptyNode, createNode } from "../../core/node";
import { utils, Vec } from "../../core/utils";
import { createMenu, MenuOption } from "./common/menu";
import { createParticles } from "./common/particles";
import { createText } from "./common/text";
import { createTransitionOverlay, TransitionOverlayNode } from "./common/transitionOverlay";

const createBaseMenuScene = (
  titleText: string,
  titleScale: Vec,
  menuOptionsFactory: (transition: TransitionOverlayNode) => MenuOption[],
  menuPos: Vec,
  menuScale: number,
) => {
  return createScene((scene, game) => {
    game._worker._setMusic(2);

    const layerBg = createEmptyNode();
    const layerUi = createEmptyNode();
    const title = createText(titleText);
    title._position = [0.52, 0.2];
    title._scale = titleScale;

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
    starSpewer._position = [0.5, 0.5];

    const uni = createNode(assetLibrary._textures._unicorn_one, [0.5, 0.5]);
    uni._updater = (s, g, d) => (s._rotation = s._rotation + d);
    uni._setUniformScale(1);

    const options = menuOptionsFactory(transition);
    const menuBg = createNode(assetLibrary._textures._absolute_bg, [
      0.5,
      menuPos[1] + ((options.length - 1) * 1.2 * menuScale) / 2,
    ]);
    menuBg._scale = [4, options.length * 1.2 * menuScale + 0.1];
    menuBg._opacity = 0.8;

    const menu = createMenu(options);
    menu._setUniformScale(menuScale);
    menu._position = [...menuPos];

    layerBg._addChildren([starSpewer, uni]);
    layerUi._addChildren([menuBg, menu, title, transition]);

    scene._updater = (_s, g, _d) => {
      title._position = utils._vectorAdd(
        [0.53, 0.2],
        utils._vectorRotate([0, 0.01], g._worker._ticks),
      );
    };
  });
};

export const createMenuScene = (onStartGame: () => Scene, onLevelSelect: () => Scene) =>
  createBaseMenuScene(
    "UNICOP",
    [0.1, 0.1],
    (transition) => [
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
    ],
    [0.5, 0.67],
    0.05,
  );

export const createLevelSelectScene = (
  onSelectLevel: (level: number) => Scene,
  onBack: () => Scene,
) =>
  createBaseMenuScene(
    "LEVEL SELECT",
    [0.07, 0.07],
    (transition) => [
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
    ],
    [0.5, 0.42],
    0.045,
  );
