import { createEmptySprite } from "../../../core/sprite";
import { utils } from "../../../core/utils";
import { createText } from "./text";

export type MenuOption = {
  _text: string;
  _onSelected(): void;
};

// Expects the anchor to be in a clean viewport space (not a child to a transformed sprite)
export const createMenu = (options: Array<MenuOption>) => {
  const anchor = createEmptySprite();

  let clickIndex = -1;
  let hoverIndex = -1;
  let offset = 0;

  for (const option of options) {
    const text = createText(option._text);
    text._position = [0, offset];
    offset += 1.2;
    anchor._addChild(text);
  }

  anchor._updater = (s, g, d) => {
    const transformedCursorPos = utils._vectorMul(
      utils._vectorSub(g._input._pointer._coord, anchor._position),
      1 / anchor._scale[1],
    );

    let nearestDist = 999;
    let nearestOptionIndex = -1;
    for (const optionSprite of anchor._children) {
      const idx = anchor._children.indexOf(optionSprite);
      const dist = utils._vectorManhattanDistance(optionSprite._position, transformedCursorPos);
      if (dist < nearestDist && dist < 3) {
        nearestDist = dist;
        nearestOptionIndex = anchor._children.indexOf(optionSprite);
      }

      optionSprite._scale = utils._vectorLerp(
        optionSprite._scale,
        idx === hoverIndex ? [1.2, 1.2] : [1, 1],
        d * 10,
      );
    }

    if (g._input._pointer._down && hoverIndex > -1 && clickIndex != hoverIndex) {
      clickIndex = hoverIndex;
      options[hoverIndex]._onSelected();
    }

    hoverIndex = nearestOptionIndex;
  };

  return anchor;
};
