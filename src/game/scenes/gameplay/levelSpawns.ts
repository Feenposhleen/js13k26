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

const boxFormation = (pos: Vec, delay: number = 3, trickle: number = 0) => [
  createSpawn(delay, 4, pos),
  createSpawn(trickle, 4, utils._vectorAdd(pos, [0, 0.17])),
  createSpawn(trickle, 4, utils._vectorAdd(pos, [0.17, 0])),
  createSpawn(trickle, 4, utils._vectorAdd(pos, [0.17, 0.17])),
];

const horizontalLine = (pos: Vec, delay: number = 3, trickle: number = 0) => [
  createSpawn(delay, 4, pos),
  createSpawn(trickle, 4, utils._vectorAdd(pos, [0.17, 0])),
  createSpawn(trickle, 4, utils._vectorAdd(pos, [0.33, 0])),
];

const verticalLine = (pos: Vec, delay: number = 3, trickle: number = 0) => [
  createSpawn(delay, 4, pos),
  createSpawn(trickle, 4, utils._vectorAdd(pos, [0, 0.17])),
  createSpawn(trickle, 4, utils._vectorAdd(pos, [0, 0.33])),
];

const leftTop: Vec = [0, 0];
const leftMid: Vec = [0, 0.5];
const leftBottom: Vec = [0, 1];

const centerTop: Vec = [0.5, 0];
const centerMid: Vec = [0.5, 0.5];
const centerBottom: Vec = [0.5, 1];

const rightTop: Vec = [1, 0];
const rightMid: Vec = [1, 0.5];
const rightBottom: Vec = [1, 1];

const blockedDuo = (pos: Vec, color: number, delay: number = 3, trickle: number = 0) => [
  createSpawn(delay, color, pos),
  createSpawn(trickle, 4, utils._vectorAdd(pos, [0.2, 0])),
  createSpawn(trickle, 4, utils._vectorAdd(pos, [0.4, 0])),
];

const doubleBlocked = (
  pos: Vec,
  color1: number,
  color2: number,
  delay: number = 3,
  trickle: number = 0,
) => [
  createSpawn(delay, color1, pos),
  createSpawn(trickle, color2, utils._vectorAdd(pos, [0.2, 0])),
  createSpawn(trickle, 4, utils._vectorAdd(pos, [0.4, 0])),
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
    ...boxFormation(leftTop, 1),
    ...horizontalLine(leftMid, 3, 1),
    ...verticalLine(centerMid, 3, 1),
    ...verticalLine(leftMid, 3, 1),
    ...verticalLine(rightMid, 3, 0),
    ...verticalLine(leftMid, 0, 0),
    ...horizontalLine(leftTop, 3, 1),
    ...horizontalLine(centerTop, 3, 1),
  ],
  [
    ...horizontalLine(leftTop, 3, 1),
    ...horizontalLine(leftBottom, 2, 1),
    ...horizontalLine(leftMid, 2, 1),
    ...boxFormation(centerTop, 2),
    ...boxFormation(centerMid, 0),
    ...verticalLine(centerMid, 2, 1),
    ...horizontalLine(leftTop, 2, 1),
    ...verticalLine(rightMid, 2, 1),
    ...verticalLine(centerMid, 2, 0),
    ...verticalLine(leftMid, 2, 0),
    ...horizontalLine(leftTop, 3, 1),
    ...horizontalLine(leftMid, 1, 1),
    ...horizontalLine(leftBottom, 1, 1),
  ],
  [
    ...horizontalLine(leftBottom, 3, 1),
    ...blockedDuo(leftTop, 0, 1, 1),
    ...horizontalLine(leftMid, 3, 1),
    ...verticalLine(rightMid, 1, 1),
    ...blockedDuo(leftBottom, 3, 3, 1),
    ...blockedDuo(leftMid, 2, 1, 1),
    ...horizontalLine(leftTop, 3, 0),
    ...horizontalLine(leftMid, 0, 0),
    ...verticalLine(rightMid, 3, 1),
    ...blockedDuo(centerMid, 3, 3, 1),
    ...blockedDuo(leftMid, 2, 3, 1),
    ...blockedDuo(leftBottom, 3, 3, 1),
    ...horizontalLine(centerBottom, 1, 1),
    ...boxFormation(leftTop, 2),
  ],
  [
    ...horizontalLine(centerBottom, 3, 1),
    ...blockedDuo(leftTop, 2, 1, 1),
    ...blockedDuo(leftMid, 0, 1, 0),
    ...boxFormation(leftTop, 2),
    ...blockedDuo(centerTop, 0, 1, 1),
    ...blockedDuo(centerMid, 3, 1, 0),
    ...boxFormation(leftMid, 2, 0),
    ...boxFormation(leftTop, 0, 0),
    ...horizontalLine(centerBottom, 3, 1),
    ...blockedDuo(leftBottom, 0, 1, 0),
    ...horizontalLine(centerTop, 3, 1),
    ...blockedDuo(leftTop, 0, 1, 0),
    ...zipSpawns(doubleBlocked(leftMid, 1, 0, 3, 0), doubleBlocked(leftBottom, 2, 3, 0, 0)),
  ],
  [
    ...horizontalLine(centerBottom, 3, 1),
    ...zipSpawns(doubleBlocked(leftTop, 1, 3, 3, 0), doubleBlocked(leftMid, 2, 0, 0, 0)),
    ...horizontalLine(centerTop, 3, 0),
    ...doubleBlocked(centerMid, 0, 1, 1, 0),
    ...horizontalLine(centerTop, 3, 0),
    ...horizontalLine(leftBottom, 0, 0),
    ...doubleBlocked(leftTop, 1, 2, 1, 0),
    ...horizontalLine(centerTop, 3, 0),
    ...verticalLine(rightTop, 0, 1),
    ...doubleBlocked(leftTop, 1, 3, 3, 0),
    ...doubleBlocked(leftMid, 0, 1, 1, 0),
    ...doubleBlocked(leftBottom, 2, 0, 1, 0),
    createSpawn(3, 5, centerMid),
  ],
];

export const levelSpawnDuration = (levelSpawns: Array<Spawn>): number => {
  return levelSpawns.reduce((res, curr) => res + curr._delay, 0);
};
