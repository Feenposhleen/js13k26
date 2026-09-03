import { RawTexture } from "./assets/drawables.gen";
import { FullState } from "./game_worker";
import { utils, Vec } from "./utils";

export type SpriteUpdater = (sprite: Sprite, state: FullState, delta: number) => void;

export type Sprite = {
  _dead: Boolean;
  _seed: number;
  _lifetime: number;
  _velocity: Vec;
  _texture: RawTexture | null;
  _position: Vec;
  _scale: Vec;
  _angle: number;
  _opacity: number;
  _children: Sprite[];
  _updater: SpriteUpdater;
  _trackedMemberOf: Array<Array<Sprite>>;
  _update: (state: FullState, dt: number) => void;
  _addChild: (sprite: Sprite) => void;
  _addChildren: (sprites: Array<Sprite>) => void;
  _removeChild: (sprite: Sprite) => void;
  _setUniformScale: (scale: number) => void;
  _setTrackedMemberOf: (parentArray: Array<Sprite>, member?: boolean) => void;
  _copy: () => Sprite;
  ___r?: Array<Float32Array>;
};

export const createSprite = (
  texture: RawTexture | null,
  position: Vec,
  scale: Vec = [1, 1],
  velocity: Vec = [0, 0],
  opacity: number = 1,
  angle: number = 0,
): Sprite => {
  const _sprite: Sprite = {
    _texture: texture,
    _seed: utils._rndFloat(),
    _dead: false,
    _position: position,
    _velocity: velocity,
    _scale: scale,
    _angle: angle,
    _opacity: opacity,
    _children: [] as Sprite[],
    _lifetime: 0,
    _trackedMemberOf: [],
    _updater: () => {},

    _setTrackedMemberOf: (parentArray: Array<Sprite>, member: boolean = true): void => {
      if (member) {
        parentArray.push(_sprite);
        _sprite._trackedMemberOf.push(parentArray);
      } else {
        utils._removeFromArray(parentArray, _sprite);
        utils._removeFromArray(_sprite._trackedMemberOf, parentArray);
      }
    },

    _addChild: (sprite: Sprite): void => {
      _sprite._children.push(sprite);
      if (sprite._trackedMemberOf) {
        sprite._trackedMemberOf.push(_sprite._children);
      }
    },

    _addChildren: (sprites: Array<Sprite>): void => {
      for (const sprite of sprites) {
        _sprite._children.push(sprite);
      }
    },

    _removeChild: (sprite: Sprite): void => {
      const index = _sprite._children.indexOf(sprite);
      if (index !== -1) {
        _sprite._children.splice(index, 1);
        if (sprite._trackedMemberOf.length > 0) {
          sprite._trackedMemberOf.forEach((x) => utils._removeFromArray(x, sprite));
        }
      }
    },

    _update: (state: FullState, delta: number): void => {
      _sprite._position = [
        _sprite._position[0] + _sprite._velocity[0] * delta,
        _sprite._position[1] + _sprite._velocity[1] * delta,
      ];

      _sprite._lifetime += delta;

      _sprite._updater(_sprite, state, delta);

      for (const child of [..._sprite._children]) {
        if (child._dead) {
          _sprite._removeChild(child);
        } else {
          child._update(state, delta);
        }
      }
    },

    _copy: function (): Sprite {
      const newSprite = createSprite(
        this._texture,
        [this._position[0], this._position[1]],
        [this._scale[0], this._scale[1]],
        [this._velocity[0], this._velocity[1]],
        this._opacity,
        this._angle,
      );
      newSprite._updater = this._updater;
      newSprite._dead = this._dead;
      newSprite._seed = this._seed;
      newSprite._lifetime = this._lifetime;
      return newSprite;
    },

    _setUniformScale: function (scale: number): void {
      _sprite._scale[0] = scale;
      _sprite._scale[1] = scale;
    },
  };

  return _sprite;
};

export const createEmptySprite = () => createSprite(null, [0, 0]);
