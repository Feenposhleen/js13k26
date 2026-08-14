import { Game } from "../core/game";
import { createMainScene } from "./scenes/main_scene";
import { createState } from "./state";

new Game(
  createMainScene(),
  createState(),
);