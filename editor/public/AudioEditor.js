class AudioEditor {
  constructor(container) {
    this.container = container;
    this.ctx = null;
    this.noiseBuffer = null;

    this.audioData = {
      _sfx: {},
      _songs: {}
    };

    this.selectedSfxKey = null;
    this.selectedSongKey = null;
    this.isPlayingSong = false;
    this.songTimer = null;
    this.currentStep = 0;

    this.waveformNames = ["Sine", "Triangle", "Sawtooth", "Square", "Noise"];
    this.filterNames = ["None", "Lowpass", "Highpass", "Bandpass"];
    this.scaleNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    this.initAudioContext();
    this.buildUI();
    this.loadData();
  }

  initAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    // 1-second white noise buffer
    const sr = this.ctx.sampleRate || 44100;
    this.noiseBuffer = this.ctx.createBuffer(1, sr, sr);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < sr; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Parameter String Encoding/Decoding ---
  // Format: 8 chars, offset 40
  // 0: Wave (0..4)
  // 1: Start pitch (0..80)
  // 2: End pitch (0..80)
  // 3: Attack (0..50)
  // 4: Decay (0..50)
  // 5: Filter type (0..3)
  // 6: Filter cutoff (0..50)
  // 7: Volume (0..50)

  decodeSfx(str) {
    if (!str || str.length < 8) {
      return { wave: 0, p0: 20, p1: 20, att: 0, dec: 10, fType: 0, fCut: 30, vol: 30 };
    }
    return {
      wave: Math.min(4, Math.max(0, str.charCodeAt(0) - 40)),
      p0: Math.min(80, Math.max(0, str.charCodeAt(1) - 40)),
      p1: Math.min(80, Math.max(0, str.charCodeAt(2) - 40)),
      att: Math.min(50, Math.max(0, str.charCodeAt(3) - 40)),
      dec: Math.min(50, Math.max(0, str.charCodeAt(4) - 40)),
      fType: Math.min(3, Math.max(0, str.charCodeAt(5) - 40)),
      fCut: Math.min(50, Math.max(0, str.charCodeAt(6) - 40)),
      vol: Math.min(50, Math.max(0, str.charCodeAt(7) - 40)),
    };
  }

  encodeSfx(params) {
    return String.fromCharCode(40 + (params.wave || 0)) +
           String.fromCharCode(40 + (params.p0 || 0)) +
           String.fromCharCode(40 + (params.p1 || 0)) +
           String.fromCharCode(40 + (params.att || 0)) +
           String.fromCharCode(40 + (params.dec || 0)) +
           String.fromCharCode(40 + (params.fType || 0)) +
           String.fromCharCode(40 + (params.fCut || 0)) +
           String.fromCharCode(40 + (params.vol || 0));
  }

  // Play a single voice using the unified engine logic
  playVoice(patchStr, t, noteOffset = 0) {
    if (!this.ctx) return;
    this.ensureContext();
    const p = this.decodeSfx(patchStr);

    const att = p.att * 0.01;
    const dec = Math.max(0.02, p.dec * 0.04);
    const vol = Math.max(0.001, (p.vol / 50) * 0.5);
    const duration = att + dec;

    const freq0 = 55 * Math.pow(2, (p.p0 + noteOffset) / 12);
    const freq1 = 55 * Math.pow(2, (p.p1 + noteOffset) / 12);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.max(0.001, att));
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    let filterNode = null;
    if (p.fType > 0 && p.fType <= 3) {
      filterNode = this.ctx.createBiquadFilter();
      filterNode.type = ["lowpass", "highpass", "bandpass"][p.fType - 1];
      filterNode.frequency.setValueAtTime(100 * Math.pow(1.09, p.fCut), t);
      filterNode.connect(g);
    }

    g.connect(this.ctx.destination);
    const dest = filterNode || g;

    if (p.wave === 4) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.connect(dest);
      src.start(t);
      src.stop(t + duration + 0.01);
    } else {
      const osc = this.ctx.createOscillator();
      osc.type = ["sine", "triangle", "sawtooth", "square"][p.wave] || "sine";
      osc.frequency.setValueAtTime(Math.max(1, freq0), t);
      if (p.p0 !== p.p1) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq1), t + duration);
      }
      osc.connect(dest);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    }
  }

  // --- Network API ---
  async loadData() {
    try {
      const res = await fetch('/audio');
      if (res.ok) {
        this.audioData = await res.json();
        this.renderAll();
      }
    } catch (e) {
      console.error('Failed to load audio data:', e);
    }
  }

  async saveData() {
    try {
      const res = await fetch('/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.audioData)
      });
      const data = await res.json();
      this.showToast(data.ok ? 'Saved audio assets!' : 'Save failed');
    } catch (e) {
      this.showToast('Save error: ' + e.message, true);
    }
  }

  showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'audio-toast' + (isError ? ' error' : '');
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // --- Presets ---
  applyPreset(type) {
    let p = { wave: 0, p0: 20, p1: 20, att: 0, dec: 10, fType: 0, fCut: 30, vol: 35 };
    switch (type) {
      case 'laser':
        p = { wave: 3, p0: 45, p1: 10, att: 0, dec: 4, fType: 1, fCut: 40, vol: 35 };
        break;
      case 'jump':
        p = { wave: 0, p0: 15, p1: 35, att: 0, dec: 6, fType: 1, fCut: 45, vol: 35 };
        break;
      case 'coin':
        p = { wave: 1, p0: 38, p1: 45, att: 0, dec: 8, fType: 1, fCut: 45, vol: 35 };
        break;
      case 'hit':
        p = { wave: 4, p0: 25, p1: 5, att: 0, dec: 4, fType: 1, fCut: 25, vol: 40 };
        break;
      case 'explosion':
        p = { wave: 4, p0: 15, p1: 0, att: 0, dec: 20, fType: 1, fCut: 15, vol: 45 };
        break;
      case 'powerup':
        p = { wave: 2, p0: 10, p1: 40, att: 2, dec: 12, fType: 1, fCut: 40, vol: 35 };
        break;
      case 'random':
        p = {
          wave: Math.floor(Math.random() * 5),
          p0: Math.floor(Math.random() * 60),
          p1: Math.floor(Math.random() * 60),
          att: Math.floor(Math.random() * 5),
          dec: 2 + Math.floor(Math.random() * 25),
          fType: Math.floor(Math.random() * 4),
          fCut: 10 + Math.floor(Math.random() * 40),
          vol: 25 + Math.floor(Math.random() * 20),
        };
        break;
    }
    if (this.selectedSfxKey) {
      this.audioData._sfx[this.selectedSfxKey] = this.encodeSfx(p);
      this.updateSynthSliders();
      this.playVoice(this.audioData._sfx[this.selectedSfxKey], this.ctx.currentTime);
    }
  }

  // --- UI Builder ---
  buildUI() {
    this.container.innerHTML = `
      <div id="audio-layout">
        <!-- SFX Panel -->
        <div class="audio-panel" id="sfx-panel">
          <div class="panel-header">
            <h3>Sound Effects (SFX)</h3>
            <div class="header-btns">
              <button id="add-sfx-btn" title="Add new sound effect">+ Add</button>
              <button id="dup-sfx-btn" title="Duplicate selected sound effect">📋 Copy</button>
              <button id="rename-sfx-btn" title="Rename selected sound effect">✎ Name</button>
              <button id="del-sfx-btn" title="Delete selected sound effect">- Del</button>
            </div>
          </div>
          <div class="list-container" id="sfx-list"></div>

          <div class="synth-controls" id="synth-controls">
            <div class="preset-row">
              <button class="preset-btn" data-preset="laser">🔫 Laser</button>
              <button class="preset-btn" data-preset="jump">🦘 Jump</button>
              <button class="preset-btn" data-preset="coin">🪙 Coin</button>
              <button class="preset-btn" data-preset="hit">🥊 Hit</button>
              <button class="preset-btn" data-preset="explosion">💥 Boom</button>
              <button class="preset-btn" data-preset="powerup">⭐ Power</button>
              <button class="preset-btn" data-preset="random">🎲 Rnd</button>
            </div>

            <div class="control-grid">
              <label>Waveform:
                <select id="sfx-wave">
                  ${this.waveformNames.map((w, i) => `<option value="${i}">${w}</option>`).join('')}
                </select>
              </label>

              <label>Start Pitch: <span class="val-badge" id="val-p0">0</span>
                <input type="range" id="sfx-p0" min="0" max="80" value="20" />
              </label>

              <label>End Pitch: <span class="val-badge" id="val-p1">0</span>
                <input type="range" id="sfx-p1" min="0" max="80" value="20" />
              </label>

              <label>Attack: <span class="val-badge" id="val-att">0</span>
                <input type="range" id="sfx-att" min="0" max="50" value="0" />
              </label>

              <label>Decay: <span class="val-badge" id="val-dec">0</span>
                <input type="range" id="sfx-dec" min="0" max="50" value="10" />
              </label>

              <label>Filter:
                <select id="sfx-ftype">
                  ${this.filterNames.map((f, i) => `<option value="${i}">${f}</option>`).join('')}
                </select>
              </label>

              <label>Cutoff: <span class="val-badge" id="val-fcut">0</span>
                <input type="range" id="sfx-fcut" min="0" max="50" value="30" />
              </label>

              <label>Volume: <span class="val-badge" id="val-vol">0</span>
                <input type="range" id="sfx-vol" min="0" max="50" value="35" />
              </label>
            </div>

            <div class="audition-row">
              <button id="sfx-play-btn" class="play-action-btn">▶ Audition Sound (Space)</button>
              <span class="raw-code" id="sfx-raw"></span>
            </div>
          </div>
        </div>

        <!-- Music Tracker Panel -->
        <div class="audio-panel" id="music-panel">
          <div class="panel-header">
            <h3>Music Tracker</h3>
            <div class="header-btns">
              <button id="add-song-btn" title="Add new song">+ Song</button>
              <button id="dup-song-btn" title="Duplicate selected song">📋 Copy Song</button>
              <button id="rename-song-btn" title="Rename selected song">✎ Name</button>
              <button id="del-song-btn" title="Delete selected song">- Del</button>
              <button id="add-track-btn" title="Add track to current song">+ Track</button>
            </div>
          </div>

          <div class="song-meta-row">
            <div class="list-container-inline" id="song-list"></div>
            <label>BPM: <input type="number" id="song-bpm" min="40" max="300" value="130" style="width:52px;" /></label>
            <label>Length: 
              <select id="song-length-select" style="width:115px;">
                <option value="16">16 (1 bar)</option>
                <option value="32">32 (2 bars)</option>
                <option value="48">48 (3 bars)</option>
                <option value="64">64 (4 bars)</option>
                <option value="96">96 (6 bars)</option>
                <option value="128">128 (8 bars)</option>
                <option value="256">256 (16 bars)</option>
              </select>
            </label>
            <button id="add-bar-btn" title="Add 1 bar (+16 steps)">+ Bar</button>
            <button id="del-bar-btn" title="Remove 1 bar (-16 steps)">- Bar</button>
            <button id="song-play-btn" class="play-action-btn">▶ Play Song</button>
            <button id="save-audio-btn" class="save-all-btn">💾 Save Audio Assets</button>
          </div>

          <div id="tracker-grid-container"></div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Presets
    this.container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.onclick = () => this.applyPreset(btn.dataset.preset);
    });

    // Slider inputs
    ['p0', 'p1', 'att', 'dec', 'fcut', 'vol'].forEach(k => {
      const slider = this.container.querySelector(`#sfx-${k}`);
      slider.oninput = () => {
        this.container.querySelector(`#val-${k}`).textContent = slider.value;
        this.updateFromSliders();
      };
    });

    this.container.querySelector('#sfx-wave').onchange = () => this.updateFromSliders();
    this.container.querySelector('#sfx-ftype').onchange = () => this.updateFromSliders();

    // SFX buttons
    this.container.querySelector('#sfx-play-btn').onclick = () => {
      if (this.selectedSfxKey && this.audioData._sfx[this.selectedSfxKey]) {
        this.playVoice(this.audioData._sfx[this.selectedSfxKey], this.ctx.currentTime);
      }
    };

    this.container.querySelector('#add-sfx-btn').onclick = () => {
      const name = prompt('SFX Name (must start with _, e.g., _jump):', '_sfx' + (Object.keys(this.audioData._sfx).length + 1));
      if (name) {
        const cleanName = name.startsWith('_') ? name : '_' + name;
        if (this.audioData._sfx[cleanName]) {
          alert('An SFX with that name already exists.');
          return;
        }
        this.audioData._sfx[cleanName] = '0,( %01(4';
        this.selectedSfxKey = cleanName;
        this.renderAll();
      }
    };

    this.container.querySelector('#dup-sfx-btn').onclick = () => {
      if (!this.selectedSfxKey) return;
      const oldName = this.selectedSfxKey;
      const newName = prompt('Enter duplicated SFX Name (must start with _):', oldName + '_copy');
      if (!newName) return;
      const cleanName = newName.startsWith('_') ? newName : '_' + newName;
      if (this.audioData._sfx[cleanName]) {
        alert('An SFX with that name already exists.');
        return;
      }
      this.audioData._sfx[cleanName] = this.audioData._sfx[oldName];
      this.selectedSfxKey = cleanName;
      this.renderAll();
    };

    this.container.querySelector('#rename-sfx-btn').onclick = () => {
      if (!this.selectedSfxKey) return;
      const oldName = this.selectedSfxKey;
      const newName = prompt('Enter new SFX Name (must start with _):', oldName);
      if (!newName || newName === oldName) return;
      const cleanName = newName.startsWith('_') ? newName : '_' + newName;
      if (this.audioData._sfx[cleanName]) {
        alert('An SFX with that name already exists.');
        return;
      }
      this.audioData._sfx[cleanName] = this.audioData._sfx[oldName];
      delete this.audioData._sfx[oldName];

      // Update references in all song tracks
      Object.values(this.audioData._songs).forEach(song => {
        song._tracks.forEach(track => {
          if (track[0] === oldName) {
            track[0] = cleanName;
          }
        });
      });

      this.selectedSfxKey = cleanName;
      this.renderAll();
    };

    this.container.querySelector('#del-sfx-btn').onclick = () => {
      if (this.selectedSfxKey) {
        if (Object.keys(this.audioData._sfx).length <= 1) {
          alert('Cannot delete the last sound effect.');
          return;
        }
        if (confirm(`Delete sound effect "${this.selectedSfxKey}"?`)) {
          delete this.audioData._sfx[this.selectedSfxKey];
          this.selectedSfxKey = Object.keys(this.audioData._sfx)[0] || null;
          this.renderAll();
        }
      }
    };

    // Song buttons
    this.container.querySelector('#add-song-btn').onclick = () => {
      const name = prompt('Song Name (must start with _, e.g., _battle):', '_song' + (Object.keys(this.audioData._songs).length + 1));
      if (name) {
        const cleanName = name.startsWith('_') ? name : '_' + name;
        if (this.audioData._songs[cleanName]) {
          alert('A song with that name already exists.');
          return;
        }
        const sfxKeys = Object.keys(this.audioData._sfx);
        this.audioData._songs[cleanName] = {
          _bpm: 130,
          _tracks: [
            [sfxKeys[0] || '_kick', '(.......(.......'],
            [sfxKeys[1] || '_snare', '....(.......(...']
          ]
        };
        this.selectedSongKey = cleanName;
        this.renderAll();
      }
    };

    this.container.querySelector('#dup-song-btn').onclick = () => {
      if (!this.selectedSongKey) return;
      const oldName = this.selectedSongKey;
      const original = this.audioData._songs[oldName];
      if (!original) return;

      const newName = prompt('Enter duplicated Song Name (must start with _):', oldName + '_copy');
      if (!newName) return;
      const cleanName = newName.startsWith('_') ? newName : '_' + newName;
      if (this.audioData._songs[cleanName]) {
        alert('A song with that name already exists.');
        return;
      }

      this.audioData._songs[cleanName] = {
        _bpm: original._bpm,
        _tracks: original._tracks.map(t => [t[0], t[1]])
      };
      this.selectedSongKey = cleanName;
      this.renderAll();
    };

    this.container.querySelector('#rename-song-btn').onclick = () => {
      if (!this.selectedSongKey) return;
      const oldName = this.selectedSongKey;
      const newName = prompt('Enter new Song Name (must start with _):', oldName);
      if (!newName || newName === oldName) return;
      const cleanName = newName.startsWith('_') ? newName : '_' + newName;
      if (this.audioData._songs[cleanName]) {
        alert('A song with that name already exists.');
        return;
      }
      this.audioData._songs[cleanName] = this.audioData._songs[oldName];
      delete this.audioData._songs[oldName];
      this.selectedSongKey = cleanName;
      this.renderAll();
    };

    this.container.querySelector('#del-song-btn').onclick = () => {
      if (!this.selectedSongKey) return;
      const keys = Object.keys(this.audioData._songs);
      if (keys.length <= 1) {
        alert('Cannot delete the last song.');
        return;
      }
      if (confirm(`Delete song "${this.selectedSongKey}"?`)) {
        if (this.isPlayingSong) this.stopSong();
        delete this.audioData._songs[this.selectedSongKey];
        this.selectedSongKey = Object.keys(this.audioData._songs)[0] || null;
        this.renderAll();
      }
    };

    this.container.querySelector('#add-track-btn').onclick = () => {
      if (!this.selectedSongKey) return;
      const song = this.audioData._songs[this.selectedSongKey];
      const sfxKeys = Object.keys(this.audioData._sfx);
      const currentLen = song._tracks[0] ? song._tracks[0][1].length : 16;
      song._tracks.push([sfxKeys[0] || '_kick', '.'.repeat(currentLen)]);
      this.renderTracker();
    };

    this.container.querySelector('#song-bpm').onchange = (e) => {
      if (this.selectedSongKey && this.audioData._songs[this.selectedSongKey]) {
        this.audioData._songs[this.selectedSongKey]._bpm = parseInt(e.target.value, 10) || 120;
      }
    };

    this.container.querySelector('#song-length-select').onchange = (e) => {
      const len = parseInt(e.target.value, 10) || 16;
      this.setSongLength(len);
    };

    this.container.querySelector('#add-bar-btn').onclick = () => {
      if (!this.selectedSongKey || !this.audioData._songs[this.selectedSongKey]) return;
      const song = this.audioData._songs[this.selectedSongKey];
      const curLen = Math.max(...song._tracks.map(t => t[1].length), 16);
      this.setSongLength(curLen + 16);
    };

    this.container.querySelector('#del-bar-btn').onclick = () => {
      if (!this.selectedSongKey || !this.audioData._songs[this.selectedSongKey]) return;
      const song = this.audioData._songs[this.selectedSongKey];
      const curLen = Math.max(...song._tracks.map(t => t[1].length), 16);
      if (curLen > 16) {
        this.setSongLength(curLen - 16);
      }
    };

    this.container.querySelector('#song-play-btn').onclick = () => this.toggleSongPlay();
    this.container.querySelector('#save-audio-btn').onclick = () => this.saveData();

    // Hotkeys
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (this.selectedSfxKey) {
          this.playVoice(this.audioData._sfx[this.selectedSfxKey], this.ctx.currentTime);
        }
      }
    });
  }

  setSongLength(newLength) {
    if (!this.selectedSongKey || !this.audioData._songs[this.selectedSongKey]) return;
    const song = this.audioData._songs[this.selectedSongKey];
    const targetLen = Math.max(16, newLength);

    song._tracks.forEach(track => {
      let notes = track[1];
      if (notes.length < targetLen) {
        notes = notes.padEnd(targetLen, '.');
      } else if (notes.length > targetLen) {
        notes = notes.substring(0, targetLen);
      }
      track[1] = notes;
    });

    this.renderTracker();
  }

  updateFromSliders() {
    if (!this.selectedSfxKey) return;
    const p = {
      wave: parseInt(this.container.querySelector('#sfx-wave').value, 10),
      p0: parseInt(this.container.querySelector('#sfx-p0').value, 10),
      p1: parseInt(this.container.querySelector('#sfx-p1').value, 10),
      att: parseInt(this.container.querySelector('#sfx-att').value, 10),
      dec: parseInt(this.container.querySelector('#sfx-dec').value, 10),
      fType: parseInt(this.container.querySelector('#sfx-ftype').value, 10),
      fCut: parseInt(this.container.querySelector('#sfx-fcut').value, 10),
      vol: parseInt(this.container.querySelector('#sfx-vol').value, 10),
    };
    const encoded = this.encodeSfx(p);
    this.audioData._sfx[this.selectedSfxKey] = encoded;
    this.container.querySelector('#sfx-raw').textContent = `Wire: "${encoded}"`;
  }

  updateSynthSliders() {
    if (!this.selectedSfxKey || !this.audioData._sfx[this.selectedSfxKey]) return;
    const p = this.decodeSfx(this.audioData._sfx[this.selectedSfxKey]);
    this.container.querySelector('#sfx-wave').value = p.wave;
    this.container.querySelector('#sfx-p0').value = p.p0;
    this.container.querySelector('#val-p0').textContent = p.p0;
    this.container.querySelector('#sfx-p1').value = p.p1;
    this.container.querySelector('#val-p1').textContent = p.p1;
    this.container.querySelector('#sfx-att').value = p.att;
    this.container.querySelector('#val-att').textContent = p.att;
    this.container.querySelector('#sfx-dec').value = p.dec;
    this.container.querySelector('#val-dec').textContent = p.dec;
    this.container.querySelector('#sfx-ftype').value = p.fType;
    this.container.querySelector('#sfx-fcut').value = p.fCut;
    this.container.querySelector('#val-fcut').textContent = p.fCut;
    this.container.querySelector('#sfx-vol').value = p.vol;
    this.container.querySelector('#val-vol').textContent = p.vol;
    this.container.querySelector('#sfx-raw').textContent = `Wire: "${this.audioData._sfx[this.selectedSfxKey]}"`;
  }

  renderAll() {
    this.renderSfxList();
    this.renderSongList();
    this.renderTracker();
  }

  renderSfxList() {
    const list = this.container.querySelector('#sfx-list');
    list.innerHTML = '';
    const keys = Object.keys(this.audioData._sfx);
    if (!this.selectedSfxKey && keys.length) this.selectedSfxKey = keys[0];

    keys.forEach(k => {
      const item = document.createElement('div');
      item.className = 'list-item' + (k === this.selectedSfxKey ? ' active' : '');
      item.innerHTML = `<span class="name">${k}</span><button class="mini-play">▶</button>`;
      item.onclick = (e) => {
        this.selectedSfxKey = k;
        this.renderSfxList();
        this.updateSynthSliders();
        if (e.target.classList.contains('mini-play')) {
          this.playVoice(this.audioData._sfx[k], this.ctx.currentTime);
        }
      };
      list.appendChild(item);
    });

    this.updateSynthSliders();
  }

  renderSongList() {
    const list = this.container.querySelector('#song-list');
    list.innerHTML = '';
    const keys = Object.keys(this.audioData._songs);
    if (!this.selectedSongKey && keys.length) this.selectedSongKey = keys[0];

    keys.forEach(k => {
      const btn = document.createElement('button');
      btn.className = 'song-tab-btn' + (k === this.selectedSongKey ? ' active' : '');
      btn.textContent = k;
      btn.onclick = () => {
        if (this.isPlayingSong) this.stopSong();
        this.selectedSongKey = k;
        this.renderSongList();
        this.renderTracker();
      };
      list.appendChild(btn);
    });

    if (this.selectedSongKey && this.audioData._songs[this.selectedSongKey]) {
      this.container.querySelector('#song-bpm').value = this.audioData._songs[this.selectedSongKey]._bpm || 120;
    }
  }

  renderTracker() {
    const container = this.container.querySelector('#tracker-grid-container');
    container.innerHTML = '';
    if (!this.selectedSongKey || !this.audioData._songs[this.selectedSongKey]) return;

    const song = this.audioData._songs[this.selectedSongKey];
    const sfxKeys = Object.keys(this.audioData._sfx);
    const maxSteps = Math.max(...song._tracks.map(t => t[1].length), 16);

    // Update length select dropdown
    const lengthSelect = this.container.querySelector('#song-length-select');
    if (lengthSelect) {
      lengthSelect.value = String(maxSteps);
      if (lengthSelect.value !== String(maxSteps)) {
        // Custom length option
        const opt = document.createElement('option');
        opt.value = String(maxSteps);
        opt.textContent = `${maxSteps} (${(maxSteps / 16).toFixed(1)} bars)`;
        lengthSelect.appendChild(opt);
        lengthSelect.value = String(maxSteps);
      }
    }

    // 1. Timeline Header Row
    const timelineRow = document.createElement('div');
    timelineRow.className = 'tracker-timeline-row';
    timelineRow.innerHTML = `<div class="track-header-spacer">Bars / Beats</div>`;

    const timelineSteps = document.createElement('div');
    timelineSteps.className = 'tracker-steps-timeline';

    for (let i = 0; i < maxSteps; i++) {
      const marker = document.createElement('div');
      marker.className = 'timeline-step-marker';
      marker.dataset.step = i;

      const isBarStart = (i % 16 === 0);
      const isBeatStart = (i % 4 === 0);

      if (isBarStart) {
        marker.classList.add('bar-start');
        marker.textContent = `B${Math.floor(i / 16) + 1}`;
      } else if (isBeatStart) {
        marker.classList.add('beat-start');
        marker.textContent = `${Math.floor((i % 16) / 4) + 1}`;
      } else {
        marker.textContent = '·';
      }

      timelineSteps.appendChild(marker);
    }

    timelineRow.appendChild(timelineSteps);
    container.appendChild(timelineRow);

    // 2. Track Rows
    song._tracks.forEach((track, trackIdx) => {
      const [sfxKey, notes] = track;
      const trackRow = document.createElement('div');
      trackRow.className = 'tracker-track-row';

      // Track header (instrument selector & delete)
      const trackHeader = document.createElement('div');
      trackHeader.className = 'track-header';
      trackHeader.innerHTML = `
        <select class="track-sfx-select">
          ${sfxKeys.map(k => `<option value="${k}" ${k === sfxKey ? 'selected' : ''}>${k}</option>`).join('')}
        </select>
        <button class="track-del-btn" title="Remove track">×</button>
      `;

      trackHeader.querySelector('.track-sfx-select').onchange = (e) => {
        song._tracks[trackIdx][0] = e.target.value;
      };
      trackHeader.querySelector('.track-del-btn').onclick = () => {
        song._tracks.splice(trackIdx, 1);
        this.renderTracker();
      };

      // Steps
      const stepsRow = document.createElement('div');
      stepsRow.className = 'tracker-steps-row';

      for (let i = 0; i < maxSteps; i++) {
        const stepChar = notes[i] || '.';
        const isNote = stepChar !== '.';
        const stepBtn = document.createElement('button');
        stepBtn.className = 'tracker-step-btn' + (isNote ? ' on' : '');

        if (i % 16 === 0) {
          stepBtn.classList.add('bar-start');
        } else if (i % 4 === 0) {
          stepBtn.classList.add('beat-start');
        }

        stepBtn.dataset.step = i;
        stepBtn.dataset.track = trackIdx;
        stepBtn.title = `Bar ${Math.floor(i / 16) + 1}, Beat ${Math.floor((i % 16) / 4) + 1}.${(i % 4) + 1}`;

        const semitone = isNote ? stepChar.charCodeAt(0) - 40 : 0;
        stepBtn.textContent = isNote ? this.scaleNotes[semitone % 12] + Math.floor(semitone / 12) : '·';

        stepBtn.onclick = () => {
          let newNotes = song._tracks[trackIdx][1].split('');
          while (newNotes.length < maxSteps) newNotes.push('.');

          if (newNotes[i] === '.') {
            // Add note default pitch (0 semitone = '(' in ascii base 40)
            newNotes[i] = '(';
            this.playVoice(this.audioData._sfx[song._tracks[trackIdx][0]], this.ctx.currentTime, 0);
          } else {
            // Cycle pitch or turn off
            const currentPitch = newNotes[i].charCodeAt(0) - 40;
            if (currentPitch < 12) {
              newNotes[i] = String.fromCharCode(40 + currentPitch + 2);
              this.playVoice(this.audioData._sfx[song._tracks[trackIdx][0]], this.ctx.currentTime, currentPitch + 2);
            } else {
              newNotes[i] = '.';
            }
          }
          song._tracks[trackIdx][1] = newNotes.join('');
          this.renderTracker();
        };

        stepsRow.appendChild(stepBtn);
      }

      trackRow.appendChild(trackHeader);
      trackRow.appendChild(stepsRow);
      container.appendChild(trackRow);
    });
  }

  toggleSongPlay() {
    if (this.isPlayingSong) {
      this.stopSong();
    } else {
      this.playSong();
    }
  }

  playSong() {
    if (!this.selectedSongKey || !this.audioData._songs[this.selectedSongKey]) return;
    this.ensureContext();
    this.isPlayingSong = true;
    this.currentStep = 0;
    this.container.querySelector('#song-play-btn').textContent = '⏹ Stop Song';
    this.container.querySelector('#song-play-btn').classList.add('playing');

    const song = this.audioData._songs[this.selectedSongKey];
    const bpm = song._bpm || 130;
    const stepDurMs = ((60 / bpm) / 4) * 1000;
    const maxSteps = Math.max(...song._tracks.map(t => t[1].length), 16);

    const tick = () => {
      if (!this.isPlayingSong) return;
      const t = this.ctx.currentTime;
      const activeStepIndex = this.currentStep % maxSteps;

      // Highlight step buttons and timeline markers
      this.container.querySelectorAll('.tracker-step-btn').forEach(btn => {
        btn.classList.toggle('active-playhead', parseInt(btn.dataset.step, 10) === activeStepIndex);
      });
      this.container.querySelectorAll('.timeline-step-marker').forEach(marker => {
        marker.classList.toggle('active-playhead', parseInt(marker.dataset.step, 10) === activeStepIndex);
      });

      // Play notes
      song._tracks.forEach(([sfxKey, notes]) => {
        if (!notes) return;
        const char = notes[this.currentStep % notes.length];
        if (char && char !== '.') {
          const patch = this.audioData._sfx[sfxKey];
          if (patch) {
            const noteOffset = char.charCodeAt(0) - 40;
            this.playVoice(patch, t, noteOffset);
          }
        }
      });

      this.currentStep++;
      this.songTimer = setTimeout(tick, stepDurMs);
    };

    tick();
  }

  stopSong() {
    this.isPlayingSong = false;
    if (this.songTimer) clearTimeout(this.songTimer);
    this.container.querySelector('#song-play-btn').textContent = '▶ Play Song';
    this.container.querySelector('#song-play-btn').classList.remove('playing');
    this.container.querySelectorAll('.tracker-step-btn').forEach(btn => {
      btn.classList.remove('active-playhead');
    });
    this.container.querySelectorAll('.timeline-step-marker').forEach(marker => {
      marker.classList.remove('active-playhead');
    });
  }
}
