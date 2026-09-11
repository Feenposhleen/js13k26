import { RawTexture } from "../../../core/assets/drawables.gen";
import { createSprite, createEmptySprite, Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";

export const createParticles = (
  texture: RawTexture,
  count: number,
  repeat: boolean = false,
  positioningTarget: Sprite | null = null,
  directionRange: Vec = [-utils._pi, utils._pi],
  lifetimeRange: Vec = [0.2, 0.4],
  speedRange: Vec = [0.3, 0.4],
  scaleRange: Vec = [0.05, 0.06],
  angleRange: Vec = [-utils._pi, utils._pi],
  angularVelocityRange: Vec = [-3, 3],
) => {
  const emitter = createEmptySprite();

  function addParticle() {
    const particleScale = utils._rndFromRange(scaleRange);
    const particleSpeed = utils._rndFromRange(speedRange);
    const particleAngle = utils._rndFromRange(angleRange);
    const particleLifetime = utils._rndFromRange(lifetimeRange);
    const particleDirection = utils._rndFromRange(directionRange);
    const particleAngularVelocity = utils._rndFromRange(angularVelocityRange);

    const particle = createSprite(
      texture,
      positioningTarget ? [...positioningTarget._position] : [0, 0],
      [particleScale, particleScale],
      utils._vectorRotate([particleSpeed, 0], particleDirection),
    );

    particle._angle = particleAngle;

    particle._updater = (sprite, _game, delta) => {
      if (sprite._lifetime > particleLifetime && !sprite._dead) {
        sprite._dead = true;

        if (repeat) {
          addParticle();
        }
        return;
      }

      sprite._angle += particleAngularVelocity * delta;
      sprite._setUniformScale(
        particleScale - (sprite._lifetime / particleLifetime) * particleScale,
      );
    };

    emitter._addChild(particle);
  }

  if (!repeat) {
    for (let i = 0; i < count; i++) {
      addParticle();
    }
  }

  let emitTicks = 0;
  let emitBudget = count;
  emitter._updater = (s, g, d) => {
    if ((positioningTarget !== null && positioningTarget._dead) || (!repeat && s._children.length == 0)) {
      s._dead = true;
    }

    if (repeat && emitBudget > 0) {
      emitTicks += d;
      if (emitTicks > (lifetimeRange[1] / count)) {
        emitBudget--;
        emitTicks = 0;
        addParticle();
      }
    }
  };

  return emitter;
};
