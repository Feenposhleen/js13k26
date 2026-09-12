import assetLibrary from "../../core/asset_library";
import createScene, { Scene } from "../../core/scene";
import { createEmptyNode, createNode } from "../../core/node";
import { utils } from "../../core/utils";
import { createText } from "./common/text";
import { createTransitionOverlay } from "./common/transitionOverlay";
import { CutsceneData, getCutsceneForLevel } from "./cutscene/cutsceneData";
import { createGameplayScene } from "./gameplayScene";
import { levelSpawns } from "./gameplay/levelSpawns";
import { createMenuScene } from "./menuScene";

export const createCutsceneScene = (nextLevel: number, customCutscene?: CutsceneData): Scene => {
  const cutscene = customCutscene || getCutsceneForLevel(nextLevel);

  // If no cutscene definition exists, immediately transition to next gameplay level or menu
  if (!cutscene || cutscene._lines.length === 0) {
    return nextLevel < levelSpawns.length ? createGameplayScene(nextLevel) : createMenuScene();
  }

  const scene = createScene((scene, game) => {
    game._worker._setMusic(cutscene._music || 2);

    const layerBg = createEmptyNode();
    const layerActors = createEmptyNode();
    const layerUi = createEmptyNode();

    scene._rootNode._addChildren([layerBg, layerActors, layerUi]);

    const transition = createTransitionOverlay();

    // Background quad
    const bg = createNode(assetLibrary._textures._absolute_bg, [1.5, 0.5], [10, 10]);
    layerBg._addChild(bg);

    // Characters: Unicop on the left, Captain on the right
    const unicopNode = createNode(assetLibrary._textures._unicorn_one, [0.22, 0.65], [0.55, 0.55]);

    const captainNode = createNode(
      assetLibrary._textures._unicorn_captain,
      [0.78, 0.65],
      [-0.55, 0.55],
    );

    layerActors._addChildren([unicopNode, captainNode]);

    // Dialogue Box UI
    const boxBackdrop = createNode(
      assetLibrary._textures._absolute_bg,
      [0.5, 0.25],
      [2.3, 0.45],
      [0, 0],
      0.75,
    );

    const speakerTagContainer = createEmptyNode();
    speakerTagContainer._setUniformScale(0.04);

    const dialogueContainer = createEmptyNode();
    dialogueContainer._position = [0.5, 0.75];
    dialogueContainer._setUniformScale(0.045);

    layerUi._addChildren([boxBackdrop, speakerTagContainer, dialogueContainer, transition]);

    let currentLineIdx = 0;
    let lineTimer = 0;
    let isTransitioning = false;
    let lastPointerDown = false;

    const showLine = (index: number) => {
      if (index >= cutscene._lines.length) {
        if (!isTransitioning) {
          isTransitioning = true;
          const target =
            nextLevel < levelSpawns.length ? createGameplayScene(nextLevel) : createMenuScene();
          transition._transitionTo(target);
        }
        return;
      }

      const line = cutscene._lines[index];
      game._worker._playSfx(8);

      const isUnicop = line._speaker === "unicop";
      speakerTagContainer._children = [];
      speakerTagContainer._position = isUnicop ? [0.32, 0.15] : [0.68, 0.15];
      speakerTagContainer._addChild(createText(isUnicop ? "> UNICOP" : "> CAPTAIN"));

      dialogueContainer._children = [];
      const lineSpacing = 1.3;
      line._text.forEach((textLine, i) => {
        const textNode = createText(textLine);
        textNode._position = [0, (i - (line._text.length - 1) / 2) * lineSpacing];
        dialogueContainer._addChild(textNode);
      });

      lineTimer = 0;
    };

    showLine(0);

    scene._updater = (_s, game, delta) => {
      const currentLine = cutscene._lines[currentLineIdx];
      let lineDuration = 3.2;
      if (currentLine) {
        const totalChars = currentLine._text.join(" ").length;
        lineDuration = currentLine._duration || utils._max(2.6, totalChars * 0.08);
      }

      const pointerJustDown = game._input._pointer._down && !lastPointerDown;
      lastPointerDown = game._input._pointer._down;

      if (!isTransitioning) {
        lineTimer += delta;
        if (pointerJustDown || lineTimer >= lineDuration) {
          currentLineIdx++;
          showLine(currentLineIdx);
        }
      }

      // Animate speakers based on who is speaking
      const isUnicop = currentLine && currentLine._speaker === "unicop";
      const isCaptain = currentLine && currentLine._speaker === "captain";

      if (isUnicop) {
        unicopNode._texture =
          (game._state._ticks * 6) % 2 < 1
            ? assetLibrary._textures._unicorn_two
            : assetLibrary._textures._unicorn_one;
        unicopNode._opacity = 1;
        unicopNode._position[1] = 0.65 + utils._sin(game._state._ticks * 8) * 0.01;
      } else {
        unicopNode._texture = assetLibrary._textures._unicorn_one;
        unicopNode._opacity = 0.55;
        unicopNode._position[1] = 0.65 + utils._sin(game._state._ticks * 2) * 0.005;
      }

      if (isCaptain) {
        captainNode._opacity = 1;
        captainNode._position[1] = 0.65 + utils._sin(game._state._ticks * 8 + 1) * 0.01;
        captainNode._rotation = utils._sin(game._state._ticks * 6) * 0.03;
      } else {
        captainNode._opacity = 0.55;
        captainNode._position[1] = 0.65 + utils._sin(game._state._ticks * 2 + 1) * 0.005;
        captainNode._rotation = 0;
      }
    };
  });

  return scene;
};
