import { GameState } from "../game/state";
import { FLOATS_PER_INSTANCE, MAX_SPRITE_COUNT } from "./config";
import { InputState, TransferDataFromWindow } from "./game_window";
import { _buildRenderData } from "./renderer";
import { Scene } from "./scene";
import { utils, Vec } from "./utils";

export type TransferDataFromWorker = {
  _renderArray: Float32Array;
  _spriteCount: number;
  _music: number | string | null;
  _sfx: (number | string)[] | null;
  _postProgramValues: number[];
};

export const defaultWorkerTransferData = (): TransferDataFromWorker => ({
  _renderArray: new Float32Array(MAX_SPRITE_COUNT * FLOATS_PER_INSTANCE),
  _spriteCount: 0,
  _postProgramValues: [],
  _music: null,
  _sfx: null,
});

export type FullState = {
  _worker: GameWorker;
  _state: GameState;
  _input: InputState;
};

const createGameWorker = () => {
  const _sceneRemoveList = new Set<Scene>();
  let _sceneTree: Scene[] = [];
  const _keys: Record<string, boolean> = {};
  const _pointer = { _coord: <Vec>[0, 0], _down: false };
  let _lastTs: number = 0;
  let _state: FullState | undefined = undefined;
  const _input: InputState = { _keys: _keys, _pointer: _pointer };
  let _pendingMusic: number | string | null = null;
  let _pendingSfx: (number | string)[] = [];
  const _postProgramValues: number[] = [];

  self.onmessage = ({ data }: { data: TransferDataFromWindow }) => {
    if (!_state) return;
    _state._input = data._input;
    _updateGame(data._freeRenderBuffer);
  };

  const _updateWindow = (renderBuffer: Float32Array, spriteCount: number) => {
    const data: TransferDataFromWorker = {
      _renderArray: renderBuffer,
      _spriteCount: spriteCount,
      _music: _pendingMusic,
      _sfx: _pendingSfx.length ? _pendingSfx : null,
      _postProgramValues: _postProgramValues,
    };

    (self as any).postMessage(data, [renderBuffer.buffer]);

    _pendingMusic = null;
    _pendingSfx = [];
  };

  const _updateGame = async (renderBuffer: Float32Array) => {
    if (!_state) return;

    const now = performance.now();
    const delta = utils._min(0.1,(now - _lastTs) / 1000);
    _lastTs = now;

    gameWorker._ticks += delta;

    if (!_sceneTree.length) return;
    for (const scene of _sceneTree) {
      if (!scene._paused) {
        scene._update(_state, delta);
      }

      if (scene._done) {
        _sceneRemoveList.add(scene);
      }
    }

    const spriteCount = _buildRenderData(
      _sceneTree.map((scene) => scene._rootNode),
      renderBuffer,
    );
    _updateWindow(renderBuffer, spriteCount);
  };

  const gameWorker = {
    _ticks: 0,
    _initialize(initialScene: Scene, initialState: GameState) {
      _state = {
        _worker: gameWorker,
        _state: initialState,
        _input: _input,
      };

      gameWorker._pushScene(initialScene);
    },
    _setScene(scene: Scene) {
      _sceneTree = [scene];
    },
    _pushScene(scene: Scene) {
      _sceneTree.push(scene);
    },
    _popScene() {
      if (_sceneTree.length > 1) _sceneTree.pop();
    },
    _removeScene(scene: Scene) {
      _sceneTree = _sceneTree.filter((existingScene) => existingScene !== scene);
    },
    _setMusic(musicId: number | string) {
      _pendingMusic = musicId;
    },
    _setPostProgramValue(idx: number, value: number) {
      _postProgramValues[idx] = value;
    },
    _getPostProgramValue(idx: number): number {
      return _postProgramValues[idx];
    },
    _playSfx(sfxId: number | string) {
      _pendingSfx.push(sfxId);
    },
  };

  return gameWorker;
};

export default createGameWorker;

export type GameWorker = ReturnType<typeof createGameWorker>;
