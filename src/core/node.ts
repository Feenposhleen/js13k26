import { RawTexture } from "./assets/drawables.gen";
import { FullState } from "./game_worker";
import { utils, Vec } from "./utils";

export type NodeUpdater = (node: Node, state: FullState, delta: number) => void;

export type Node = {
  _dead: boolean;
  _seed: number;
  _lifetime: number;
  _velocity: Vec;
  _texture: RawTexture | null;
  _position: Vec;
  _scale: Vec;
  _rotation: number;
  _opacity: number;
  _children: Node[];
  _updater: NodeUpdater;
  _trackedMemberOf: Array<Array<Node>>;
  _update: (state: FullState, dt: number) => void;
  _addChild: (node: Node) => void;
  _addChildren: (nodes: Array<Node>) => void;
  _removeChild: (node: Node) => void;
  _setUniformScale: (scale: number) => void;
  _setTrackedMemberOf: (parentArray: Array<Node>, member?: boolean) => void;
  _copy: () => Node;
  ___r?: Array<Float32Array>;
};

export const createNode = (
  texture: RawTexture | null,
  position: Vec,
  scale: Vec = [1, 1],
  velocity: Vec = [0, 0],
  opacity: number = 1,
  angle: number = 0,
): Node => {
  const _node: Node = {
    _texture: texture,
    _seed: utils._rndFloat(),
    _dead: false,
    _position: position,
    _velocity: velocity,
    _scale: scale,
    _rotation: angle,
    _opacity: opacity,
    _children: [] as Node[],
    _lifetime: 0,
    _trackedMemberOf: [],
    _updater: () => {},

    _setTrackedMemberOf: (parentArray: Array<Node>, member: boolean = true): void => {
      if (member) {
        parentArray.push(_node);
        _node._trackedMemberOf.push(parentArray);
      } else {
        utils._removeFromArray(parentArray, _node);
        utils._removeFromArray(_node._trackedMemberOf, parentArray);
      }
    },

    _addChild: (node: Node): void => {
      _node._children.push(node);
      if (node._trackedMemberOf) {
        node._trackedMemberOf.push(_node._children);
      }
    },

    _addChildren: (nodes: Array<Node>): void => {
      for (const node of nodes) {
        _node._children.push(node);
      }
    },

    _removeChild: (node: Node): void => {
      const index = _node._children.indexOf(node);
      if (index !== -1) {
        _node._children.splice(index, 1);
        if (node._trackedMemberOf.length > 0) {
          node._trackedMemberOf.forEach((x) => utils._removeFromArray(x, node));
        }
      }
    },

    _update: (state: FullState, delta: number): void => {
      _node._position = [
        _node._position[0] + _node._velocity[0] * delta,
        _node._position[1] + _node._velocity[1] * delta,
      ];

      _node._lifetime += delta;

      _node._updater(_node, state, delta);

      for (const child of [..._node._children]) {
        if (child._dead) {
          _node._removeChild(child);
        } else {
          child._update(state, delta);
        }
      }
    },

    _copy: function (): Node {
      const newNode = createNode(
        this._texture,
        [this._position[0], this._position[1]],
        [this._scale[0], this._scale[1]],
        [this._velocity[0], this._velocity[1]],
        this._opacity,
        this._rotation,
      );
      newNode._updater = this._updater;
      newNode._dead = this._dead;
      newNode._seed = this._seed;
      newNode._lifetime = this._lifetime;
      return newNode;
    },

    _setUniformScale: function (scale: number): void {
      _node._scale[0] = scale;
      _node._scale[1] = scale;
    },
  };

  return _node;
};

export const createEmptyNode = () => createNode(null, [0, 0]);
