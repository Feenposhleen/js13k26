import { Game } from "../core/game";
import { startMenu } from "./gameFlow";
import { createState } from "./state";

new Game(startMenu(), createState());
