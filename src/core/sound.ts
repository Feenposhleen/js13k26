import { RawAudioData, RawSong } from "./assets/audio.gen";

const WAVE_TYPES: OscillatorType[] = ["sine", "triangle", "sawtooth", "square"];
const FILTER_TYPES: BiquadFilterType[] = ["lowpass", "highpass", "bandpass"];
const STEP_DUR = 15 / 134; // 134 BPM 16th-note steps

const createMiniSequencer = (ctxArg?: AudioContext) => {
  const _ctx: AudioContext =
    ctxArg || new (window.AudioContext || (window as any).webkitAudioContext)();

  // Pre-generate 1-second white noise buffer for drums, snares, explosions
  const _sampleRate = _ctx.sampleRate || 44100;
  const _noiseBuffer = _ctx.createBuffer(1, _sampleRate, _sampleRate);
  const _noiseData = _noiseBuffer.getChannelData(0);
  for (let i = 0; i < _sampleRate; i++) {
    _noiseData[i] = Math.random() * 2 - 1;
  }

  let _timer: number | null = null;
  let _step = 0;
  let _nextTime = 0;
  let _song: RawSong | null = null;
  let _nextSong: RawSong | null = null;
  let _audioData: RawAudioData | null = null;

  const _playVoice = (patch: string, t: number, noteOffset: number = 0) => {
    if (!patch || patch.length < 8) return;

    const w = patch.charCodeAt(0) - 40;
    const p0 = patch.charCodeAt(1) - 40;
    const p1 = patch.charCodeAt(2) - 40;
    const att = (patch.charCodeAt(3) - 40) * 0.01;
    const dec = Math.max(0.02, (patch.charCodeAt(4) - 40) * 0.04);
    const fType = patch.charCodeAt(5) - 40;
    const fCut = patch.charCodeAt(6) - 40;
    const vol = Math.max(0.001, ((patch.charCodeAt(7) - 40) / 50) * 0.5);

    const freq0 = 55 * Math.pow(2, (p0 + noteOffset) / 12);
    const freq1 = 55 * Math.pow(2, (p1 + noteOffset) / 12);
    const duration = att + dec;

    // Gain envelope
    const g = _ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.max(0.001, att));
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    // Optional Filter
    let filterNode: BiquadFilterNode | null = null;
    if (fType > 0 && fType <= 3) {
      filterNode = _ctx.createBiquadFilter();
      filterNode.type = FILTER_TYPES[fType - 1];
      filterNode.frequency.setValueAtTime(100 * Math.pow(1.09, fCut), t);
    }

    // Connect chain: source -> [filter] -> gain -> destination
    if (filterNode) {
      filterNode.connect(g);
    }
    g.connect(_ctx.destination);

    const destinationNode: AudioNode = filterNode || g;

    if (w === 4) {
      // Noise source
      const noiseSource = _ctx.createBufferSource();
      noiseSource.buffer = _noiseBuffer;
      noiseSource.connect(destinationNode);
      noiseSource.start(t);
      noiseSource.stop(t + duration + 0.01);
    } else {
      // Tonal Oscillator
      const osc = _ctx.createOscillator();
      osc.type = WAVE_TYPES[w] || "sine";
      osc.frequency.setValueAtTime(Math.max(1, freq0), t);
      if (p0 !== p1) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq1), t + duration);
      }
      osc.connect(destinationNode);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    }
  };

  const _schedule = () => {
    if (!_song || !_audioData) return;
    while (_nextTime < _ctx.currentTime + 0.12) {
      if (_nextSong && _step % 16 === 0) {
        _song = _nextSong;
        _nextSong = null;
        _step = 0;
      }

      const t = _nextTime;
      const tracks = _song._tracks;

      for (let i = 0; i < tracks.length; i++) {
        const [sfxKey, notes] = tracks[i];
        if (!notes || !notes.length) continue;

        const char = notes[_step % notes.length];
        if (char && char !== ".") {
          const patch = (_audioData._sfx as Record<string, string>)[sfxKey];
          if (patch) {
            const noteOffset = char.charCodeAt(0) - 40;
            _playVoice(patch, t, noteOffset);
          }
        }
      }

      _nextTime += STEP_DUR;
      _step++;
    }
  };

  const playSong = (song: RawSong, audioData: RawAudioData) => {
    _audioData = audioData;
    if (_song === song) {
      _nextSong = null;
      return;
    }

    if (!_song) {
      _song = song;
      _nextSong = null;
      _step = 0;
      _nextTime = _ctx.currentTime;
      if (!_timer) {
        _timer = window.setInterval(_schedule, 25);
      }
    } else {
      _nextSong = song;
    }
  };

  const playSfx = (patch: string) => {
    _playVoice(patch, _ctx.currentTime, 0);
  };

  const stop = () => {
    if (_timer) {
      clearInterval(_timer);
      _timer = null;
    }
    _song = null;
    _nextSong = null;
  };

  return {
    playSong,
    playSfx,
    stop,
  };
};

export type MiniSequencer = ReturnType<typeof createMiniSequencer>;

export default createMiniSequencer;
