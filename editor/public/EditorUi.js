class EditorMode {
  static EDIT = 'edit';
  static DRAW = 'draw';
  static DELETE = 'delete';
}

class EditorAction {
  static SAVE = 'save';
  static RELOAD = 'reload';
}

class LayeringAction {
  static UP = 'up';
  static DOWN = 'down';
  static TOP = 'top';
  static BOTTOM = 'bottom';
}

class EditorUI {
  constructor({
    editorData,
    onAction,
    onColorSelected,
    onColorChanged,
    onColorRemoved,
    onModeSelected,
    onTextureSelected,
    onEditorDataUpdated,
    onLayeringAction,
  }) {
    this.selectedMode = EditorMode.EDIT;
    this.selectedColor = editorData.palette[0] || '#000';
    this.selectedTexture = editorData.getTexture(Object.keys(editorData.textures)[0]) || null;
    this.pendingMoveCoord = null;

    this.onAction = onAction;
    this.onModeSelected = onModeSelected;
    this.onColorSelected = onColorSelected;
    this.onColorChanged = onColorChanged;
    this.onColorRemoved = onColorRemoved;
    this.onTextureSelected = onTextureSelected;
    this.onEditorDataUpdated = onEditorDataUpdated;
    this.onLayeringAction = onLayeringAction;

    this.modesContainerEl = document.querySelector('#modes');
    this.actionsContainerEl = document.querySelector('#actions');
    this.colorsContainerEl = document.querySelector('#colors');
    this.texturesContainerEl = document.querySelector('#textures');
    this.backgroundsContainerEl = document.querySelector('#backgrounds');
    this.layeringContainerEl = document.querySelector('#layering');

    this.updateModes();
    this.updateLayering();
    this.updateBackgrounds();
    this.updateColors(editorData);
    this.updateActions();
    this.updateTextures(editorData);
  }

  updateBackgrounds() {
    this.clearElement(this.backgroundsContainerEl);

    const backgrounds = ["#ffffff", "#c0c0c0", "#808080", "#404040", "#000000",];

    backgrounds.forEach((bg) => {
      const bgEl = document.createElement('div');
      bgEl.classList.add('color');
      bgEl.style.backgroundColor = bg;
      this.backgroundsContainerEl.appendChild(bgEl);
      bgEl.addEventListener('click', () => {
        document.body.style.backgroundColor = bg;
      });
    });
  }

  updateLayering() {
    this.clearElement(this.layeringContainerEl);

    const actions = [
      { text: '↑↑↑', classNames: ['layering', 'top'], action: LayeringAction.TOP },
      { text: '↑', classNames: ['layering', 'up'], action: LayeringAction.UP },
      { text: '↓', classNames: ['layering', 'down'], action: LayeringAction.DOWN },
      { text: '↓↓↓', classNames: ['layering', 'bottom'], action: LayeringAction.BOTTOM },
    ];

    for (const action of actions) {
      const button = this.createButton(action.text, action.classNames, () => {
        this.onLayeringAction(action.action);
        this.onEditorDataUpdated();
      });
      this.layeringContainerEl.appendChild(button);
    }
  }

  updateModes() {
    const modes = [
      {
        text: 'Edit',
        classNames: ['mode', 'edit'],
        mode: EditorMode.EDIT,
      },
      {
        text: 'Draw',
        classNames: ['mode', 'draw'],
        mode: EditorMode.DRAW,
      },
      {
        text: 'Delete',
        classNames: ['mode', 'delete'],
        mode: EditorMode.DELETE,
      },
    ];

    this.clearElement(this.modesContainerEl);
    for (const mode of modes) {
      const button = this.createButton(mode.text, mode.classNames, () => {
        this.selectedMode = mode.mode;
        this.onModeSelected(this.selectedMode);
        this.updateModes();
      });

      if (this.selectedMode === mode.mode) {
        button.classList.add('active');
      }
      this.modesContainerEl.appendChild(button);
    }
  }

  updateActions() {
    const actions = [
      {
        text: 'Save',
        classNames: ['action', 'save'],
        onClick: () => this.onAction(EditorAction.SAVE),
      },
      {
        text: 'Reload',
        classNames: ['action', 'reload'],
        onClick: () => this.onAction(EditorAction.RELOAD),
      },
    ];

    this.clearElement(this.actionsContainerEl);
    for (const action of actions) {
      const button = this.createButton(action.text, action.classNames, action.onClick);
      this.actionsContainerEl.appendChild(button);
    }
  }

  updateColors(editorData) {
    this.clearElement(this.colorsContainerEl);

    editorData.palette.forEach((color, i) => {
      const colorEl = document.createElement('div');
      colorEl.classList.add('color');
      colorEl.style.backgroundColor = color;
      if (this.selectedColor === color) {
        colorEl.classList.add('active');
      }
      colorEl.title = color;

      this.colorsContainerEl.appendChild(colorEl);
      colorEl.addEventListener('click', (ev) => {
        if (ev.target !== colorEl) return;
        this.selectedColor = color;
        this.updateColors(editorData);
        this.onColorSelected(color);
      });

      const removeButton = this.createButton('×', ['remove-color'], () => {
        if (editorData.palette.length <= 1) return;
        this.onColorRemoved(color);
      });

      const editButton = this.createButton('✎', ['edit-color'], () => {
        const newColor = prompt('Enter a new color (hex, #000000)', color);
        if (!/^#[0-9a-f]{6}$/i.test(newColor)) return;
        this.onColorChanged(color, newColor);
      });

      colorEl.appendChild(removeButton);
      colorEl.appendChild(editButton);
    });

    const addColorButton = this.createButton('+', ['add-color'], () => {
      const newColor = prompt('Enter a new color (hex, #000000)', '');
      if (!/^#[0-9a-f]{6}$/i.test(newColor)) return;

      editorData.addColor(newColor);
      this.updateColors(editorData);
    });
    this.colorsContainerEl.appendChild(addColorButton);
  }

  updateTextures(editorData) {
    this.clearElement(this.texturesContainerEl);

    Object.values(editorData.textures).forEach((texture) => {
      const textureButton = this.createButton(texture.name, ['texture'], () => {
        this.selectedTexture = texture;
        this.updateTextures(editorData);
        this.onTextureSelected(texture);
      }, [
        // Renaming
        ['✎', () => {
          const newName = prompt('Enter a valid name for the texture (e.g. "_name", "_another_name")', texture.name);
          if (!/^_[a-z0-9_]+$/i.test(newName)) return;

          if (newName && newName !== texture.name) {
            editorData.renameTexture(texture.name, newName);
            this.updateTextures(editorData);
            this.onEditorDataUpdated(editorData);
          }
        }],
        // Duplicating
        ['📋', () => {
          const newName = prompt('Enter a valid name for the duplicated texture (e.g. "_name", "_another_name")', texture.name + '_copy');
          if (!/^_[a-z0-9_]+$/i.test(newName)) return;

          if (newName && !editorData.getTexture(newName)) {
            const duplicated = editorData.duplicateTexture(texture.name, newName);
            this.selectedTexture = duplicated;
            this.updateTextures(editorData);
            this.onTextureSelected(duplicated);
            this.onEditorDataUpdated(editorData);
          }
        }],
        // Deleting
        ['🗑', () => {
          if (confirm(`Are you sure you want to delete the texture "${texture.name}"?`)) {
            editorData.removeTexture(texture.name);
            if (this.selectedTexture && this.selectedTexture.name === texture.name) {
              this.selectedTexture = Object.values(editorData.textures)[0] || null;
            }
            this.updateTextures(editorData);
            this.onTextureSelected(this.selectedTexture);
            this.onEditorDataUpdated(editorData);
          }
        }],
      ]);

      if (this.selectedTexture && this.selectedTexture.name === texture.name) {
        textureButton.classList.add('active');
      }

      this.texturesContainerEl.appendChild(textureButton);
    });

    const addTextureButton = this.createButton('+', ['add-texture'], () => {
      const newTextureName = prompt('Enter a valid name for the texture (e.g. "_name", "_another_name")', '');
      if (!/^_[a-z_]+$/.test(newTextureName)) return;

      if (newTextureName) {
        const newTexture = new Texture(newTextureName, []);
        editorData.addTexture(newTexture);
        this.selectedTexture = newTexture;
        this.updateTextures(editorData);
        this.onTextureSelected(newTexture);
        this.onEditorDataUpdated(editorData);
      }
    });
    this.texturesContainerEl.appendChild(addTextureButton);
  }

  createButton(text, classNames, onClick, extraActions = []) {
    const container = document.createElement('div');
    const extrasContainer = document.createElement('div');

    container.classList.add('button-container', ...(classNames || []));

    const mainBtn = document.createElement('button');
    mainBtn.classList.add('main');
    mainBtn.innerText = text;
    mainBtn.title = text;
    if (onClick) mainBtn.addEventListener('click', onClick);
    container.appendChild(mainBtn);
    container.appendChild(extrasContainer);

    for (const action of extraActions) {
      const text = action[0];
      const handler = action[1];

      const extraBtn = document.createElement('button');
      extraBtn.classList.add('extra');
      extraBtn.innerText = text;
      extraBtn.addEventListener('click', handler);
      extrasContainer.appendChild(extraBtn);
    }

    return container;
  }

  setEditorData(editorData) {
    this.editorData = editorData;
    if (!this.selectedTexture || !editorData.getTexture(this.selectedTexture.name)) {
      this.selectedTexture = editorData.getTexture(Object.keys(editorData.textures)[0]) || null;
    } else {
      this.selectedTexture = editorData.getTexture(this.selectedTexture.name);
    }
    this.updateColors(editorData);
    this.updateTextures(editorData);
  }

  clearElement(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }
}
