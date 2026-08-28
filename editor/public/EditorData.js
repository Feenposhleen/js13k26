const FONT_GLYPH_LIST = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!";

class EditorData {
  constructor(serializedData = null) {
    this.textures = {};
    this.palette = [];

    if (serializedData) {
      this.loadSerialized(serializedData);
    }
  }

  getColor(index) {
    return this.palette[index];
  }

  addColor(color) {
    this.palette.push(color);
  }

  changeColor(oldColor, newColor) {
    const idx = this.palette.indexOf(oldColor);
    if (idx !== -1) {
      this.palette.splice(idx, 1, newColor);
    }
    Object.values(this.textures).forEach(texture => {
      texture.polygons.forEach((polygon) => {
        if (polygon.color === oldColor) {
          polygon.color = newColor;
        }
      });
    });
  }

  removeColor(color) {
    const idx = this.palette.indexOf(color);
    if (idx !== -1) {
      this.palette.splice(idx, 1);
    }
    Object.values(this.textures).forEach(texture => {
      texture.polygons.forEach((polygon) => {
        if (polygon.color === color) {
          polygon.color = this.palette[0] || '#000';
        }
      });
    });
  }

  getTexture(name) {
    return this.textures[name];
  }

  addTexture(texture) {
    this.textures[texture.name] = texture;
  }

  removeTexture(name) {
    delete this.textures[name];
  }

  renameTexture(oldName, newName) {
    const texture = this.getTexture(oldName);
    if (!texture) return null;
    texture.setName(newName);
    delete this.textures[oldName];
    this.textures[newName] = texture;
    return texture;
  }

  duplicateTexture(oldName, newName) {
    const original = this.getTexture(oldName);
    if (!original) return null;
    const clonedPolygons = original.polygons.map(p => new Polygon([...p.points], p.color, p.style));
    const newTexture = new Texture(newName, clonedPolygons);
    this.addTexture(newTexture);
    return newTexture;
  }

  clear() {
    this.textures = {};
    this.palette = [];
  }

  serialize() {
    const output = {
      _palette: this.palette,
      _textures: {},
    };

    Object.keys(this.textures).forEach((textureName) => {
      const texture = this.textures[textureName];
      output._textures[textureName] = texture.serialize(this.palette);
    });

    // These are sideloaded from the bitmap source
    for (var i = 0; i < FONT_GLYPH_LIST.length; i++) {
      const glyph = FONT_GLYPH_LIST[i];
      const glyphKey = `__font_${ glyph }`;
      output._textures[glyphKey] = [];
    }

    return output;
  }

  loadSerialized(serializedData) {
    if (typeof serializedData._palette === 'string') {
      const p = serializedData._palette;
      this.palette = [];
      for (let i = 0; i < p.length; i += 6) {
        this.palette.push('#' + p.substr(i, 6));
      }
    } else {
      this.palette = serializedData._palette || [];
    }

    const serializedTextures = serializedData._textures || {};
    this.textures = {};

    Object.keys(serializedTextures).forEach((name) => {
      // Skip parsing sideloaded font glyphs
      if (name.includes("__font")) return;

      const polygons = serializedTextures[name].map((data) => Polygon.deserialize(data, this.palette));
      const texture = new Texture(name, polygons);
      this.addTexture(texture);
    });
  }
}
