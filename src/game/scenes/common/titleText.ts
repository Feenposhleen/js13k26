import { createEmptyNode, Node } from "../../../core/node";
import { utils } from "../../../core/utils";
import { createText } from "./text";

export const createTitleText = (title: string): Node => {
  const container = createEmptyNode();

  for (let i = 0; i < 4; i++) {
    const text = createText(title);
    text._setUniformScale(0.2);
    text._opacity = 1 - 0.9 * (i / 4);
    container._addChild(text);
  }

  container._updater = (node, _game, _delta) => {
    node._children.forEach((child, idx) => {
      child._rotation = utils._sin(node._lifetime - idx * 0.2) * 0.1;
    });
  };

  return container;
};
