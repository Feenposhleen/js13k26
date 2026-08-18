class SvgPolygonView {
  static resolution = 50;

  svgEl = null;
  polysContainerEl = null;
  coordsContainerEl = null;
  previewContainerEl = null;
  handlesContainerEl = null;

  getPolygons = null;
  selectedPolygon = null;
  selectedPolyEl = null;
  activeColor = '#88c0d0';
  mode = 'edit';

  onCoordClick = null;
  onPolyClick = null;
  onVertexDragEnd = null;
  onPolygonCreated = null;
  onPolygonDeleted = null;

  coords = [];
  activeCoordEls = new Set();
  hoveredCoordEl = null;
  lastHoveredCoord = null;

  draggingVertex = null;
  drawingPoints = [];

  constructor({
    getPolygons,
    onCoordClick,
    onPolyClick,
    onVertexDragEnd,
    onPolygonCreated,
    onPolygonDeleted,
  }) {
    this.getPolygons = getPolygons || (() => []);
    this.svgEl = document.querySelector('svg');
    this.polysContainerEl = document.querySelector('#polys');
    this.coordsContainerEl = document.querySelector('#coords');
    this.previewContainerEl = document.querySelector('#preview');
    this.handlesContainerEl = document.querySelector('#handles');

    this.onCoordClick = onCoordClick;
    this.onPolyClick = onPolyClick;
    this.onVertexDragEnd = onVertexDragEnd;
    this.onPolygonCreated = onPolygonCreated;
    this.onPolygonDeleted = onPolygonDeleted;

    this.createCoords();
    this.bindEvents();
    this.updatePolygons();
  }

  setMode(mode) {
    this.mode = mode;
    this.cancelDrawing();
    this.updatePolygons();
  }

  setColor(color) {
    this.activeColor = color;
    if (this.selectedPolygon && this.mode === 'edit') {
      this.selectedPolygon.color = color;
      this.updatePolygons();
    }
  }

  createCoords() {
    this.coordsContainerEl.innerHTML = '';
    this.coords = [];

    const res = SvgPolygonView.resolution;
    const center = Math.round(res / 2);

    for (let y = 0; y <= res; y++) {
      const row = [];
      this.coords.push(row);
      for (let x = 0; x <= res; x++) {
        const coordEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        coordEl.classList.add('coord');
        coordEl.setAttribute('r', 0.6);
        coordEl.setAttribute('cx', x * 10);
        coordEl.setAttribute('cy', y * 10);

        if (x === center && y === center) {
          coordEl.classList.add('center');
        }

        row.push(coordEl);
        this.coordsContainerEl.appendChild(coordEl);
      }
    }

    this.svgEl.setAttribute('viewBox', `-10 -10 ${res * 10 + 20} ${res * 10 + 20}`);
  }

  getCoordFromEvent(ev) {
    const ctm = this.svgEl.getScreenCTM();
    if (!ctm) return null;

    const pt = this.svgEl.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const svgPoint = pt.matrixTransform(ctm.inverse());

    const res = SvgPolygonView.resolution;
    const gx = Math.min(res, Math.max(0, Math.round(svgPoint.x / 10)));
    const gy = Math.min(res, Math.max(0, Math.round(svgPoint.y / 10)));

    return [gx, gy];
  }

  bindEvents() {
    this.svgEl.addEventListener('pointerdown', (ev) => {
      const coord = this.getCoordFromEvent(ev);
      if (!coord) return;

      // 1. DRAW MODE
      if (this.mode === 'draw') {
        this.handleDrawClick(coord);
        ev.stopPropagation();
        return;
      }

      // 2. DELETE MODE
      if (this.mode === 'delete') {
        this.handleDeleteClick(ev, coord);
        ev.stopPropagation();
        return;
      }

      // 3. EDIT MODE
      // Clicked directly on a vertex handle
      if (ev.target && ev.target.classList.contains('vertex-handle') && this.selectedPolygon) {
        const index = parseInt(ev.target.getAttribute('data-index'), 10);
        if (!isNaN(index)) {
          this.startDraggingVertex(index, ev.target, ev.pointerId);
          ev.stopPropagation();
          return;
        }
      }

      // Clicked on a midpoint handle (instant split & drag)
      if (ev.target && ev.target.classList.contains('midpoint-handle') && this.selectedPolygon) {
        const insertIdx = parseInt(ev.target.getAttribute('data-insert-index'), 10);
        const mx = parseInt(ev.target.getAttribute('data-x'), 10);
        const my = parseInt(ev.target.getAttribute('data-y'), 10);

        if (!isNaN(insertIdx) && !isNaN(mx) && !isNaN(my)) {
          this.selectedPolygon.insertPoint(insertIdx, [mx, my]);
          this.updatePolygons();
          const newHandle = this.handlesContainerEl.querySelector(`.vertex-handle[data-index="${insertIdx}"]`);
          if (newHandle) {
            this.startDraggingVertex(insertIdx, newHandle, ev.pointerId);
          }
          ev.stopPropagation();
          return;
        }
      }

      // Clicked on a polygon body
      const clickedPoly = this.findPolygonAtEvent(ev);
      if (clickedPoly) {
        this.selectPolygon(clickedPoly);
        if (this.onPolyClick) this.onPolyClick(clickedPoly);
        ev.stopPropagation();
        return;
      }

      // Clicking on empty space deselects
      this.selectPolygon(null);
      if (this.onPolyClick) this.onPolyClick(null);
    });

    this.svgEl.addEventListener('pointermove', (ev) => {
      const coord = this.getCoordFromEvent(ev);

      // Vertex dragging (smooth in-place updates)
      if (this.draggingVertex) {
        if (coord) {
          const poly = this.draggingVertex.polygon;
          const idx = this.draggingVertex.index;
          if (poly.points[idx] !== coord[0] || poly.points[idx + 1] !== coord[1]) {
            poly.setPoint(idx, coord);
            this.updateActivePolygonPath();
            this.updateActiveHandlePosition(coord);
            this.highlightPolygonCoords(poly);
          }
        }
        return;
      }

      // Draw mode preview
      if (this.mode === 'draw' && this.drawingPoints.length > 0 && coord) {
        this.renderDrawPreview(coord);
      }

      // Hover dot on grid
      if (coord) {
        if (!this.lastHoveredCoord || this.lastHoveredCoord[0] !== coord[0] || this.lastHoveredCoord[1] !== coord[1]) {
          if (this.hoveredCoordEl) {
            this.hoveredCoordEl.classList.remove('over');
          }
          this.hoveredCoordEl = this.coords[coord[1]]?.[coord[0]] || null;
          if (this.hoveredCoordEl) {
            this.hoveredCoordEl.classList.add('over');
          }
          this.lastHoveredCoord = coord;
        }
      } else {
        this.clearHover();
      }
    });

    const finishDrag = () => {
      if (this.draggingVertex) {
        if (this.draggingVertex.handleEl) {
          this.draggingVertex.handleEl.classList.remove('dragging');
          try {
            this.draggingVertex.handleEl.releasePointerCapture(this.draggingVertex.pointerId);
          } catch (_) { }
        }
        this.draggingVertex = null;
        this.updatePolygons();
        if (this.onVertexDragEnd) {
          this.onVertexDragEnd();
        }
      }
    };

    this.svgEl.addEventListener('pointerup', finishDrag);
    this.svgEl.addEventListener('pointercancel', finishDrag);
    window.addEventListener('pointerup', finishDrag);

    this.svgEl.addEventListener('pointerleave', () => {
      this.clearHover();
      if (this.mode === 'draw') {
        this.renderDrawPreview(null);
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (ev) => {
      if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) {
        return;
      }

      if (ev.key === 'Delete' || ev.key === 'Backspace') {
        if (this.selectedPolygon) {
          if (this.onPolygonDeleted) {
            this.onPolygonDeleted(this.selectedPolygon);
          }
          this.selectPolygon(null);
        }
      } else if (ev.key === 'Escape') {
        if (this.drawingPoints.length > 0) {
          this.cancelDrawing();
        } else {
          this.selectPolygon(null);
        }
      } else if (ev.key === 'Enter') {
        if (this.mode === 'draw' && this.drawingPoints.length >= 6) {
          this.finishDrawing();
        }
      }
    });
  }

  startDraggingVertex(index, handleEl, pointerId) {
    this.draggingVertex = {
      polygon: this.selectedPolygon,
      index: index,
      handleEl: handleEl,
      pointerId: pointerId,
    };
    handleEl.classList.add('dragging');
    try {
      handleEl.setPointerCapture(pointerId);
    } catch (_) { }
  }

  updateActiveHandlePosition(coord) {
    if (this.draggingVertex && this.draggingVertex.handleEl) {
      this.draggingVertex.handleEl.setAttribute('cx', coord[0] * 10);
      this.draggingVertex.handleEl.setAttribute('cy', coord[1] * 10);
    }
  }

  updateActivePolygonPath() {
    if (!this.selectedPolygon || !this.selectedPolyEl) return;
    let pointString = '';
    for (let i = 0; i < this.selectedPolygon.points.length; i += 2) {
      pointString += `${this.selectedPolygon.points[i] * 10},${this.selectedPolygon.points[i + 1] * 10} `;
    }
    this.selectedPolyEl.setAttribute('points', pointString.trim());
  }

  findPolygonAtEvent(ev) {
    if (ev.target && ev.target.classList.contains('poly')) {
      const polys = this.getPolygons();
      const children = Array.from(this.polysContainerEl.children);
      const idx = children.indexOf(ev.target);
      if (idx !== -1 && polys[idx]) {
        return polys[idx];
      }
    }
    return null;
  }

  handleDrawClick(coord) {
    if (this.drawingPoints.length === 0) {
      this.drawingPoints.push(coord[0], coord[1]);
      this.renderDrawPreview(coord);
    } else {
      const startX = this.drawingPoints[0];
      const startY = this.drawingPoints[1];
      const isStart = Math.abs(coord[0] - startX) <= 1 && Math.abs(coord[1] - startY) <= 1;

      if (isStart && this.drawingPoints.length >= 6) {
        this.finishDrawing();
      } else {
        this.drawingPoints.push(coord[0], coord[1]);
        this.renderDrawPreview(coord);
      }
    }
  }

  finishDrawing() {
    if (this.drawingPoints.length < 6) {
      this.cancelDrawing();
      return;
    }

    const poly = new Polygon([...this.drawingPoints], this.activeColor, 0);
    this.drawingPoints = [];
    this.previewContainerEl.innerHTML = '';

    if (this.onPolygonCreated) {
      this.onPolygonCreated(poly);
    }
    this.selectPolygon(poly);
  }

  cancelDrawing() {
    this.drawingPoints = [];
    if (this.previewContainerEl) {
      this.previewContainerEl.innerHTML = '';
    }
  }

  renderDrawPreview(cursorCoord) {
    if (!this.previewContainerEl) return;
    this.previewContainerEl.innerHTML = '';

    if (this.drawingPoints.length === 0) return;

    let pts = [...this.drawingPoints];
    if (cursorCoord) {
      pts.push(cursorCoord[0], cursorCoord[1]);
    }

    // Polyline / Polygon preview
    if (pts.length >= 6) {
      let ptStr = '';
      for (let i = 0; i < pts.length; i += 2) {
        ptStr += `${pts[i] * 10},${pts[i + 1] * 10} `;
      }
      const polyEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polyEl.setAttribute('points', ptStr.trim());
      polyEl.setAttribute('fill', this.activeColor);
      polyEl.setAttribute('opacity', '0.5');
      polyEl.setAttribute('stroke', '#a6e3a1');
      polyEl.setAttribute('stroke-width', '1.5');
      polyEl.setAttribute('stroke-dasharray', '4,4');
      this.previewContainerEl.appendChild(polyEl);
    } else if (pts.length >= 4) {
      const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineEl.setAttribute('x1', pts[0] * 10);
      lineEl.setAttribute('y1', pts[1] * 10);
      lineEl.setAttribute('x2', pts[2] * 10);
      lineEl.setAttribute('y2', pts[3] * 10);
      lineEl.setAttribute('stroke', '#a6e3a1');
      lineEl.setAttribute('stroke-width', '2');
      lineEl.setAttribute('stroke-dasharray', '4,4');
      this.previewContainerEl.appendChild(lineEl);
    }

    // Draw handles on placed vertices
    for (let i = 0; i < this.drawingPoints.length; i += 2) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.classList.add('draw-handle');
      if (i === 0) dot.classList.add('start-handle');
      dot.setAttribute('cx', this.drawingPoints[i] * 10);
      dot.setAttribute('cy', this.drawingPoints[i + 1] * 10);
      dot.setAttribute('r', i === 0 ? 2.5 : 1.8);
      this.previewContainerEl.appendChild(dot);
    }
  }

  handleDeleteClick(ev, coord) {
    const polys = this.getPolygons();

    // 1. Check if clicking on a vertex handle directly
    if (ev.target && ev.target.classList.contains('vertex-handle') && this.selectedPolygon) {
      const ptIdx = parseInt(ev.target.getAttribute('data-index'), 10);
      if (!isNaN(ptIdx)) {
        if (this.selectedPolygon.points.length > 6) {
          this.selectedPolygon.removePoint(ptIdx);
          this.updatePolygons();
          if (this.onVertexDragEnd) this.onVertexDragEnd();
          return;
        } else {
          if (this.onPolygonDeleted) this.onPolygonDeleted(this.selectedPolygon);
          this.selectPolygon(null);
          return;
        }
      }
    }

    // 2. Check if clicked near a vertex of the selected polygon
    if (this.selectedPolygon) {
      const ptIdx = this.selectedPolygon.pointIndex(coord);
      if (ptIdx !== -1) {
        if (this.selectedPolygon.points.length > 6) {
          this.selectedPolygon.removePoint(ptIdx);
          this.updatePolygons();
          if (this.onVertexDragEnd) this.onVertexDragEnd();
          return;
        } else {
          if (this.onPolygonDeleted) this.onPolygonDeleted(this.selectedPolygon);
          this.selectPolygon(null);
          return;
        }
      }
    }

    // 3. Check if clicked a polygon body
    const clickedPoly = this.findPolygonAtEvent(ev);
    if (clickedPoly) {
      if (this.onPolygonDeleted) this.onPolygonDeleted(clickedPoly);
      this.selectPolygon(null);
      return;
    }
  }

  clearHover() {
    if (this.hoveredCoordEl) {
      this.hoveredCoordEl.classList.remove('over');
      this.hoveredCoordEl = null;
    }
    this.lastHoveredCoord = null;
  }

  selectPolygon(polygon) {
    const polys = this.getPolygons();
    this.selectedPolygon = (polygon && polys.includes(polygon)) ? polygon : null;
    this.updatePolygons();
  }

  updatePolygons() {
    const polys = this.getPolygons();

    this.polysContainerEl.innerHTML = '';
    if (this.handlesContainerEl) {
      this.handlesContainerEl.innerHTML = '';
    }

    if (this.selectedPolygon && !polys.includes(this.selectedPolygon)) {
      this.selectedPolygon = null;
    }

    this.selectedPolyEl = null;

    polys.forEach((poly) => {
      const el = this.renderPolygon(poly);
      if (poly === this.selectedPolygon) {
        el.classList.add('selected');
        this.selectedPolyEl = el;
      }
    });

    this.highlightPolygonCoords(this.selectedPolygon);

    // Render uniform handles for Edit and Delete modes
    if (this.mode === 'edit' || this.mode === 'delete') {
      this.renderVertexHandles(this.selectedPolygon);
    }
  }

  renderVertexHandles(polygon) {
    if (!this.handlesContainerEl || !polygon) return;
    this.handlesContainerEl.innerHTML = '';

    const pts = polygon.points;
    const n = pts.length / 2;

    // 1. Edge Midpoint Handles (for Edit mode only)
    if (this.mode === 'edit') {
      for (let i = 0; i < n; i++) {
        const ax = pts[2 * i], ay = pts[2 * i + 1];
        const j = (i + 1) % n;
        const bx = pts[2 * j], by = pts[2 * j + 1];

        const mx = Math.round((ax + bx) / 2);
        const my = Math.round((ay + by) / 2);

        if (Math.abs(ax - bx) > 2 || Math.abs(ay - by) > 2) {
          const midHandle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          midHandle.classList.add('midpoint-handle');
          midHandle.setAttribute('cx', mx * 10);
          midHandle.setAttribute('cy', my * 10);
          midHandle.setAttribute('r', 1.4);
          midHandle.setAttribute('data-insert-index', 2 * (i + 1));
          midHandle.setAttribute('data-x', mx);
          midHandle.setAttribute('data-y', my);
          this.handlesContainerEl.appendChild(midHandle);
        }
      }
    }

    // 2. Vertex Handles (Uniform across Edit and Delete modes)
    for (let i = 0; i < pts.length; i += 2) {
      const x = pts[i];
      const y = pts[i + 1];

      const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      handle.classList.add('vertex-handle');
      if (this.mode === 'delete') {
        handle.classList.add('delete-mode');
      }

      handle.setAttribute('cx', x * 10);
      handle.setAttribute('cy', y * 10);
      handle.setAttribute('r', 2.2);
      handle.setAttribute('data-index', i);

      this.handlesContainerEl.appendChild(handle);
    }
  }

  highlightPolygonCoords(polygon) {
    this.activeCoordEls.forEach((el) => {
      el.classList.remove('active');
    });
    this.activeCoordEls.clear();

    if (!polygon) return;
    for (let i = 0; i < polygon.points.length; i += 2) {
      const x = polygon.points[i];
      const y = polygon.points[i + 1];
      const coordEl = this.coords[y]?.[x];
      if (coordEl) {
        coordEl.classList.add('active');
        this.activeCoordEls.add(coordEl);
      }
    }
  }

  movePolygonZ(polygon, delta) {
    const polys = this.getPolygons();
    const idx = polys.indexOf(polygon);
    if (idx === -1) return;

    const newIdx = Math.min(Math.max(0, idx + delta), polys.length - 1);
    if (newIdx === idx) return;

    polys.splice(idx, 1);
    polys.splice(newIdx, 0, polygon);

    this.updatePolygons();
  }

  renderPolygon(polygon) {
    let pointString = '';
    for (let i = 0; i < polygon.points.length; i += 2) {
      pointString += `${polygon.points[i] * 10},${polygon.points[i + 1] * 10} `;
    }

    const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    el.classList.add('poly');

    if (polygon === this.selectedPolygon) {
      el.classList.add('active');
    }

    el.setAttribute('points', pointString.trim());
    el.setAttribute('fill', polygon.color);

    this.polysContainerEl.appendChild(el);
    return el;
  }
}
