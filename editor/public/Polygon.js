class Polygon {
  constructor(points = [], color = "#000", style = 0) {
    this.points = points; // [x,y, x,y, x,y, ...] in 0..resolution grid
    this.color = color; // e.g. "#ff00aa" or "rgba(...)"
    this.style = style || 0; // e.g. 0=fill, 1=stroke
  }

  insertPoint(index, coords) {
    this.points.splice(index, 0, coords[0], coords[1]);
  }

  setPoint(index, coords) {
    this.points[index] = coords[0];
    this.points[index + 1] = coords[1];
  }

  distance(p1, p2) {
    return Math.sqrt((Math.pow(p1[0] - p2[0], 2)) + (Math.pow(p1[1] - p2[1], 2)));
  }

  removePoint(index) {
    this.points.splice(index, 2);
  }

  addPoint(coords) {
    this.points.push(coords[0], coords[1]);
  }

  pointIndex(coords) {
    for (let i = 0; i < this.points.length; i += 2) {
      if (this.points[i] === coords[0] && this.points[i + 1] === coords[1]) {
        return i;
      }
    }

    return -1;
  }

  // Returns the index where to insert a new point to be as close as possible to an edge
  closestIndex(coords) {
    if (this.points.length < 4) return 2;

    let best = { i: -1, j: -1, dist2: Infinity, point: null, t: 0 };
    const n = this.points.length / 2;
    for (let i = 0; i < n; i++) {
      const ax = this.points[2 * i], ay = this.points[2 * i + 1];
      const j = (i + 1) % n;
      const bx = this.points[2 * j], by = this.points[2 * j + 1];

      const vx = bx - ax, vy = by - ay;
      const wx = coords[0] - ax, wy = coords[1] - ay;
      const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy)));

      const cx = ax + t * vx, cy = ay + t * vy;
      const dx = coords[0] - cx, dy = coords[1] - cy, d2 = dx * dx + dy * dy;

      if (d2 < best.dist2) {
        best = {
          i: 2 * i, j: 2 * j, dist2: d2,
          point: { x: cx, y: cy }, t
        };
      }
    }

    return best.j;
  }

  serialize(palette) {
    let colorIdx = palette.indexOf(this.color);
    if (colorIdx === -1) colorIdx = 0;

    let str = String.fromCharCode(40 + colorIdx) + String.fromCharCode(40 + (this.style || 0));
    for (let i = 0; i < this.points.length; i += 2) {
      const px = Math.min(Math.max(0, Math.round(this.points[i])), SvgPolygonView.resolution);
      const py = Math.min(Math.max(0, Math.round(this.points[i + 1])), SvgPolygonView.resolution);
      str += String.fromCharCode(40 + px) + String.fromCharCode(40 + py);
    }
    return str;
  }

  static deserialize(serializedData, palette) {
    if (typeof serializedData === 'string') {
      const colorIdx = serializedData.charCodeAt(0) - 40;
      const style = serializedData.charCodeAt(1) - 40;
      const color = palette[colorIdx] || palette[0] || '#000';
      const points = [];

      for (let i = 2; i < serializedData.length; i += 2) {
        points.push(
          serializedData.charCodeAt(i) - 40,
          serializedData.charCodeAt(i + 1) - 40
        );
      }

      return new Polygon(points, color, style);
    }

    // Legacy array format fallback ([colorIndex, style, coordStr])
    const color = palette[serializedData[0]] || palette[0] || '#000';
    const style = serializedData[1] || 0;
    const data = serializedData[2];
    const points = [];

    if (typeof data === 'string') {
      for (let i = 0; i < data.length; i += 2) {
        points.push(data.charCodeAt(i) - 40, data.charCodeAt(i + 1) - 40);
      }
    } else {
      for (let i = 2; i < serializedData.length; i += 2) {
        points.push(
          Math.round(serializedData[i] * SvgPolygonView.resolution),
          Math.round(serializedData[i + 1] * SvgPolygonView.resolution)
        );
      }
    }

    return new Polygon(points, color, style);
  }
}
