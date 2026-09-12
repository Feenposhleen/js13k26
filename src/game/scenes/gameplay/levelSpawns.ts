import { utils, Vec } from "../../../core/utils";

export const safezoneTL: Vec = [0.3, 0.1];
export const safezoneWH: Vec = [0.5, 0.55];

export type Spawn = ReturnType<typeof createSpawn>;

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

const boxFormation = (delay: number = 3, trickle: number = 0) => [
  createSpawn(delay, 4, [0, 0]),
  createSpawn(trickle, 4, [0, 1]),
  createSpawn(trickle, 4, [1, 1]),
  createSpawn(trickle, 4, [1, 0]),
];

const horizontalLine = (y: number, delay: number = 3, trickle: number = 0) => [
  createSpawn(delay, 4, [0, y]),
  createSpawn(trickle, 4, [0.25, y]),
  createSpawn(trickle, 4, [0.5, y]),
  createSpawn(trickle, 4, [0.75, y]),
  createSpawn(trickle, 4, [1, y]),
];

const verticalLine = (x: number, delay: number = 3, trickle: number = 0) => [
  createSpawn(delay, 4, [x, 0]),
  createSpawn(trickle, 4, [x, 0.25]),
  createSpawn(trickle, 4, [x, 0.5]),
  createSpawn(trickle, 4, [x, 0.75]),
  createSpawn(trickle, 4, [x, 1]),
];

const blockedHalfLine = (
  x: number,
  y: number,
  color: number,
  delay: number = 3,
  trickle: number = 0,
) => [
  createSpawn(delay, color, [x, y]),
  createSpawn(trickle, 4, [x + 0.2, y]),
  createSpawn(trickle, 4, [x + 0.4, y]),
];

const zipSpawns = (spawns1: Array<Spawn>, spawns2: Array<Spawn>): Array<Spawn> =>
  Array.from({ length: utils._max(spawns1.length, spawns2.length) }, (_, idx) => [
    spawns1[idx],
    spawns2[idx],
  ])
    .flat()
    .filter((x): x is Spawn => Boolean(x));

export const levelSpawns: Array<Array<Spawn>> = [
  [
    ...boxFormation(3, 1),
    ...horizontalLine(0.5, 3, 1),
    ...verticalLine(0, 3, 1),
    ...verticalLine(0.5, 3, 1),
    ...verticalLine(1, 3, 1),
    ...horizontalLine(0, 2, 1),
    ...horizontalLine(0.5, 2, 1),
    ...horizontalLine(1, 2, 1),
  ],
  [
    ...zipSpawns(boxFormation(), verticalLine(0.5)),
    ...blockedHalfLine(0, 0, 0),
    ...blockedHalfLine(0.5, 0.25, 1),
    ...blockedHalfLine(1, 0.5, 2),
  ],
  [...boxFormation()],
  [...boxFormation()],
  [...boxFormation()],
];

export const levelSpawnDuration = (levelSpawns: Array<Spawn>): number => {
  return levelSpawns.reduce((res, curr) => res + curr._delay, 0);
};
