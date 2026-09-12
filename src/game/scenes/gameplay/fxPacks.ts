import assetLibrary from "../../../core/asset_library";
import { Node } from "../../../core/node";
import { utils, Vec } from "../../../core/utils";
import { createParticles } from "../common/particles";

export const createExplosion = (layer: Node, position: Vec, size: number) => {
  const fireball = createParticles(
    assetLibrary._textures._explosion,
    6,
    false,
    null,
    [-utils._pi, utils._pi],
    [0.2, 0.3],
    [0.3, 0.5],
    [0.6, 0.8],
    [-utils._pi, utils._pi],
    [-0.2, 1.2],
  );

  const gore = createParticles(
    assetLibrary._textures._gore,
    16,
    false,
    null,
    [-utils._pi, utils._pi],
    [0.5, 0.6],
    [0.2, 0.4],
    [0.1, 0.2],
    [-utils._pi, utils._pi],
    [-0.2, 0.2],
  );

  const shrapnel = createParticles(
    assetLibrary._textures._shrapnel,
    8,
    false,
    null,
    [-utils._pi - 0.2, -utils._pi + 0.2],
    [0.3, 0.5],
    [0.2, 0.4],
    [0.4, 0.5],
  );

  fireball._position = [...position];
  shrapnel._position = [...position];
  gore._position = [...position];
  layer._addChild(gore);
  layer._addChild(shrapnel);
  layer._addChild(fireball);
};
