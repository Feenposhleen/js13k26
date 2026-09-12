import { utils, Vec } from "../../../core/utils";

export const safezoneTL: Vec = [0.3, 0.1];
export const safezoneWH: Vec = [0.5, 0.55];

export const createSpawn = (delay: number, type: number, offsetPosition: Vec) => {
  const finalPosition = utils._vectorAdd(
    safezoneTL,
    utils._vectorVectorMul(offsetPosition, safezoneWH),
  );

  return {
    _delay: delay,
    _type: type,
    _finalPosition: finalPosition,
  };
};

export type Spawn = ReturnType<typeof createSpawn>;

export const levelSpawns: Array<Array<Spawn>> = [
  [
    createSpawn(3, 4, [0, 1]),

    // createSpawn(2, 4, [0, 0]),
    // createSpawn(0, 4, [0.5, 0]),

    // createSpawn(3, 4, [0, 1]),

    // createSpawn(2, 4, [0.5, 0]),
    // createSpawn(0, 4, [1, 0]),

    // createSpawn(3, 4, [0, 1]),
    // createSpawn(1, 4, [0, 0.8]),
    // createSpawn(1, 4, [0, 0.6]),
    // createSpawn(1, 4, [0, 0.4]),
    // createSpawn(1, 4, [0, 0.2]),
    // createSpawn(1, 4, [0, 0]),

    // createSpawn(3, 4, [0.5, 0.8]),
    // createSpawn(0, 4, [0.25, 0.8]),
    // createSpawn(0, 4, [0, 0.8]),

    // createSpawn(3, 4, [0.5, 0.2]),
    // createSpawn(0, 4, [0.25, 0.2]),
    // createSpawn(0, 4, [0, 0.2]),

    // createSpawn(3, 4, [0.5, 1]),
    // createSpawn(0, 4, [0.75, 1]),
    // createSpawn(0, 4, [1, 1]),
    // createSpawn(0, 4, [0.5, 0.5]),
    // createSpawn(0, 4, [0.75, 0.5]),
    // createSpawn(0, 4, [1, 0.5]),
  ],
  [
    createSpawn(3, 4, [0.4, 0.5]),
    // createSpawn(2, 4, [0.55, 0.2]),
    // createSpawn(2, 4, [0.4, 0.6]),

    // createSpawn(2, 4, [0.7, 0.6]),
    // createSpawn(2, 4, [0.7, 0.8]),
    // createSpawn(2, 4, [0.7, 0.4]),
    // createSpawn(2, 4, [0.5, 0.6]),
    // createSpawn(2, 4, [0.5, 0.4]),
    // createSpawn(2, 4, [0.5, 0.4]),

    // createSpawn(4, 4, [0.4, 0.8]),
    // createSpawn(0.5, 4, [0.55, 0.8]),
    // createSpawn(0.5, 4, [0.4, 0.6]),
    // createSpawn(0.5, 4, [0.55, 0.6]),

    // createSpawn(4, 4, [0.4, 0.4]),
    // createSpawn(0.5, 4, [0.55, 0.4]),
    // createSpawn(0.5, 4, [0.7, 0.4]),
    // createSpawn(0.5, 4, [0.85, 0.4]),

    // createSpawn(4, 4, [0.8, 0.2]),
    // createSpawn(0.1, 4, [0.8, 0.4]),
    // createSpawn(0.1, 4, [0.8, 0.6]),
    // createSpawn(0.1, 4, [0.8, 0.8]),
  ],
  [
    createSpawn(3, 4, [0.4, 0.5]),
    // createSpawn(2, 4, [0.55, 0.2]),
    // createSpawn(2, 4, [0.4, 0.6]),

    // createSpawn(2, 4, [0.7, 0.6]),
    // createSpawn(2, 4, [0.7, 0.8]),
    // createSpawn(2, 4, [0.7, 0.4]),
    // createSpawn(2, 4, [0.5, 0.6]),
    // createSpawn(2, 4, [0.5, 0.4]),
    // createSpawn(2, 4, [0.5, 0.4]),

    // createSpawn(4, 4, [0.4, 0.8]),
    // createSpawn(0.5, 4, [0.55, 0.8]),
    // createSpawn(0.5, 4, [0.4, 0.6]),
    // createSpawn(0.5, 4, [0.55, 0.6]),

    // createSpawn(4, 4, [0.4, 0.4]),
    // createSpawn(0.5, 4, [0.55, 0.4]),
    // createSpawn(0.5, 4, [0.7, 0.4]),
    // createSpawn(0.5, 4, [0.85, 0.4]),

    // createSpawn(4, 4, [0.8, 0.2]),
    // createSpawn(0.1, 4, [0.8, 0.4]),
    // createSpawn(0.1, 4, [0.8, 0.6]),
    // createSpawn(0.1, 4, [0.8, 0.8]),
  ],
  [
    createSpawn(3, 4, [0.4, 0.5]),
    // createSpawn(2, 4, [0.55, 0.2]),
    // createSpawn(2, 4, [0.4, 0.6]),

    // createSpawn(2, 4, [0.7, 0.6]),
    // createSpawn(2, 4, [0.7, 0.8]),
    // createSpawn(2, 4, [0.7, 0.4]),
    // createSpawn(2, 4, [0.5, 0.6]),
    // createSpawn(2, 4, [0.5, 0.4]),
    // createSpawn(2, 4, [0.5, 0.4]),

    // createSpawn(4, 4, [0.4, 0.8]),
    // createSpawn(0.5, 4, [0.55, 0.8]),
    // createSpawn(0.5, 4, [0.4, 0.6]),
    // createSpawn(0.5, 4, [0.55, 0.6]),

    // createSpawn(4, 4, [0.4, 0.4]),
    // createSpawn(0.5, 4, [0.55, 0.4]),
    // createSpawn(0.5, 4, [0.7, 0.4]),
    // createSpawn(0.5, 4, [0.85, 0.4]),

    // createSpawn(4, 4, [0.8, 0.2]),
    // createSpawn(0.1, 4, [0.8, 0.4]),
    // createSpawn(0.1, 4, [0.8, 0.6]),
    // createSpawn(0.1, 4, [0.8, 0.8]),
  ],
  [
    createSpawn(3, 4, [0.4, 0.5]),
    // createSpawn(2, 4, [0.55, 0.2]),
    // createSpawn(2, 4, [0.4, 0.6]),

    // createSpawn(2, 4, [0.7, 0.6]),
    // createSpawn(2, 4, [0.7, 0.8]),
    // createSpawn(2, 4, [0.7, 0.4]),
    // createSpawn(2, 4, [0.5, 0.6]),
    // createSpawn(2, 4, [0.5, 0.4]),
    // createSpawn(2, 4, [0.5, 0.4]),

    // createSpawn(4, 4, [0.4, 0.8]),
    // createSpawn(0.5, 4, [0.55, 0.8]),
    // createSpawn(0.5, 4, [0.4, 0.6]),
    // createSpawn(0.5, 4, [0.55, 0.6]),

    // createSpawn(4, 4, [0.4, 0.4]),
    // createSpawn(0.5, 4, [0.55, 0.4]),
    // createSpawn(0.5, 4, [0.7, 0.4]),
    // createSpawn(0.5, 4, [0.85, 0.4]),

    // createSpawn(4, 4, [0.8, 0.2]),
    // createSpawn(0.1, 4, [0.8, 0.4]),
    // createSpawn(0.1, 4, [0.8, 0.6]),
    // createSpawn(0.1, 4, [0.8, 0.8]),
  ],
];

export const levelSpawnDuration = (levelSpawns: Array<Spawn>): number => {
  return levelSpawns.reduce((res, curr) => res + curr._delay, 0);
};
