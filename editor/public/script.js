(() => {
  const refreshData = async () => {
    const response = await fetch('/drawables');
    const data = await response.json();

    const editorData = new EditorData(data);
    load(editorData);
  };

  const saveData = async (editorData) => {
    await fetch('/drawables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editorData.serialize()),
    });

    refreshData();
  };

  const load = (editorData) => {
    let editorUi;

    const polygonView = new SvgPolygonView({
      getPolygons: () => {
        return (editorUi && editorUi.selectedTexture) ? editorUi.selectedTexture.polygons : [];
      },
      onVertexDragEnd: () => {
        if (editorUi) {
          editorUi.onEditorDataUpdated();
        }
      },
      onPolygonCreated: (poly) => {
        if (editorUi && editorUi.selectedTexture) {
          editorUi.selectedTexture.addPolygon(poly);
          polygonView.updatePolygons();
          editorUi.onEditorDataUpdated();
        }
      },
      onPolygonDeleted: (poly) => {
        if (editorUi && editorUi.selectedTexture) {
          editorUi.selectedTexture.removePolygon(poly);
          polygonView.updatePolygons();
          editorUi.onEditorDataUpdated();
        }
      },
    });

    editorUi = new EditorUI({
      editorData,
      onAction: (action) => {
        if (action === EditorAction.SAVE) {
          saveData(editorData);
        }
        if (action === EditorAction.RELOAD) {
          refreshData();
        }
      },
      onModeSelected: (mode) => {
        polygonView.setMode(mode);
      },
      onColorSelected: (color) => {
        polygonView.setColor(color);
        polygonView.updatePolygons();
      },
      onColorChanged: (oldColor, newColor) => {
        editorData.changeColor(oldColor, newColor);
        editorUi.updateColors(editorData);
        polygonView.updatePolygons();
      },
      onColorRemoved: (color) => {
        editorData.removeColor(color);
        editorUi.updateColors(editorData);
        polygonView.updatePolygons();
      },
      onTextureSelected: (texture) => {
        polygonView.selectPolygon(null);
        polygonView.updatePolygons();
      },
      onEditorDataUpdated: () => {
        polygonView.updatePolygons();
      },
      onLayeringAction: (action) => {
        if (!polygonView.selectedPolygon) return;

        switch (action) {
          case LayeringAction.UP:
            polygonView.movePolygonZ(polygonView.selectedPolygon, 1);
            break;
          case LayeringAction.DOWN:
            polygonView.movePolygonZ(polygonView.selectedPolygon, -1);
            break;
          case LayeringAction.TOP:
            polygonView.movePolygonZ(polygonView.selectedPolygon, 9999);
            break;
          case LayeringAction.BOTTOM:
            polygonView.movePolygonZ(polygonView.selectedPolygon, -9999);
            break;
        }

        editorUi.onEditorDataUpdated();
      },
    });

    polygonView.setColor(editorUi.selectedColor);
    polygonView.setMode(editorUi.selectedMode);
  };

  refreshData();
})();