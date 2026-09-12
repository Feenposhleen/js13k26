import { Scene } from "../core/scene";
import { getCutsceneForLevel } from "./scenes/cutscene/cutsceneData";
import { createCutsceneScene } from "./scenes/cutsceneScene";
import { levelSpawns } from "./scenes/gameplay/levelSpawns";
import { createGameplayScene } from "./scenes/gameplayScene";
import { createMenuScene } from "./scenes/menuScene";
import { createTransitionScene } from "./scenes/transitionScene";

export const startMenu = (): Scene => createMenuScene(() => startCutscene(0));

export const startCutscene = (level: number): Scene => {
  const cutscene = getCutsceneForLevel(level);
  const onFinish = () => (level < levelSpawns.length ? startGameplay(level) : startMenu());
  if (!cutscene || cutscene._lines.length === 0) {
    return onFinish();
  }
  return createCutsceneScene(cutscene, onFinish);
};

export const startGameplay = (level: number): Scene =>
  createGameplayScene(
    level,
    () => {
      const nextLevel = level + 1;
      const cutscene = getCutsceneForLevel(nextLevel);
      return cutscene ? startCutscene(nextLevel) : startTransition(level, true);
    },
    () => startTransition(level, false),
  );

export const startTransition = (level: number, completed: boolean): Scene =>
  createTransitionScene(
    completed,
    () => (completed ? startCutscene(level + 1) : startGameplay(level)),
    () => startMenu(),
  );
