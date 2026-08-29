import { Game } from "../core/game";
import { createGameplayScene } from "./scenes/gameplayScene";
import { createMenuScene } from "./scenes/menuScene";
import { createState } from "./state";

new Game(createMenuScene(), createState());
