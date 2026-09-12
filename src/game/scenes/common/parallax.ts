import { RawTexture } from "../../../core/assets/drawables.gen";
import { createNode, createEmptyNode, NodeUpdater } from "../../../core/node";
import { utils, Vec } from "../../../core/utils";

export const createParallax = (
  texture: RawTexture,
  count: number,
  distanceRange: Vec | undefined = [0.3, 0.4],
  verticalRange: Vec | undefined = [0.0, 1.0],
  scaleRange: Vec | undefined = [0.05, 0.06],
  updater: NodeUpdater | undefined = undefined,
) => {
  const parallax = createEmptyNode();
  const step = 1 / count;

  // Individual nodes
  for (let fraction = 1; fraction > 0; fraction -= step) {
    const scale = utils._lerpRange(scaleRange, fraction);
    const distance = utils._lerpRange(distanceRange, fraction);
    const node = createNode(
      texture,
      [
        utils._rndRange(-scaleRange[1], 1 + scaleRange[1]),
        utils._lerpRange(verticalRange, fraction),
      ],
      [scale, scale],
    );

    node._updater = (s, g, delta) => {
      s._position[0] = utils._wrap(
        s._position[0] - delta * g._state._gameplay._playerSpeed * (1 - distance),
        -scaleRange[1],
        1 + scaleRange[1],
      );

      if (updater) {
        updater(s, g, delta);
      }
    };

    parallax._addChild(node);
  }

  return parallax;
};
