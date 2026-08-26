(() => {
  // --- Tab Switching ---
  const tabBtnGraphics = document.getElementById('tab-btn-graphics');
  const tabBtnAudio = document.getElementById('tab-btn-audio');
  const wrapGraphics = document.getElementById('wrap-graphics');
  const wrapAudio = document.getElementById('wrap-audio');
  const audioContainer = document.getElementById('audio-app-container');

  let audioEditorInstance = null;
  let polygonViewInstance = null;
  let editorUiInstance = null;
  let currentEditorData = null;

  tabBtnGraphics.onclick = () => {
    tabBtnGraphics.classList.add('active');
    tabBtnAudio.classList.remove('active');
    wrapGraphics.classList.add('active');
    wrapAudio.classList.remove('active');
  };

  tabBtnAudio.onclick = () => {
    tabBtnAudio.classList.add('active');
    tabBtnGraphics.classList.remove('active');
    wrapAudio.classList.add('active');
    wrapGraphics.classList.remove('active');

    if (!audioEditorInstance) {
      audioEditorInstance = new AudioEditor(audioContainer);
    }
  };

  // --- Graphics Editor Setup ---
  const refreshData = async () => {
    const response = await fetch('/drawables');
    const data = await response.json();

    currentEditorData = new EditorData(data);
    load(currentEditorData);
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
    if (!polygonViewInstance) {
      polygonViewInstance = new SvgPolygonView({
        getPolygons: () => {
          return (editorUiInstance && editorUiInstance.selectedTexture) ? editorUiInstance.selectedTexture.polygons : [];
        },
        onVertexDragEnd: () => {
          if (editorUiInstance) {
            editorUiInstance.onEditorDataUpdated();
          }
        },
        onPolygonCreated: (poly) => {
          if (editorUiInstance && editorUiInstance.selectedTexture) {
            editorUiInstance.selectedTexture.addPolygon(poly);
            polygonViewInstance.updatePolygons();
            editorUiInstance.onEditorDataUpdated();
          }
        },
        onPolygonDeleted: (poly) => {
          if (editorUiInstance && editorUiInstance.selectedTexture) {
            editorUiInstance.selectedTexture.removePolygon(poly);
            polygonViewInstance.updatePolygons();
            editorUiInstance.onEditorDataUpdated();
          }
        },
      });

      editorUiInstance = new EditorUI({
        editorData,
        onAction: (action) => {
          if (action === EditorAction.SAVE) {
            saveData(currentEditorData);
          }
          if (action === EditorAction.RELOAD) {
            refreshData();
          }
        },
        onModeSelected: (mode) => {
          polygonViewInstance.setMode(mode);
        },
        onColorSelected: (color) => {
          polygonViewInstance.setColor(color);
          polygonViewInstance.updatePolygons();
        },
        onColorChanged: (oldColor, newColor) => {
          currentEditorData.changeColor(oldColor, newColor);
          editorUiInstance.updateColors(currentEditorData);
          polygonViewInstance.updatePolygons();
        },
        onColorRemoved: (color) => {
          currentEditorData.removeColor(color);
          editorUiInstance.updateColors(currentEditorData);
          polygonViewInstance.updatePolygons();
        },
        onTextureSelected: (texture) => {
          polygonViewInstance.selectPolygon(null);
          polygonViewInstance.updatePolygons();
        },
        onEditorDataUpdated: () => {
          polygonViewInstance.updatePolygons();
        },
        onLayeringAction: (action) => {
          if (!polygonViewInstance.selectedPolygon) return;

          switch (action) {
            case LayeringAction.UP:
              polygonViewInstance.movePolygonZ(polygonViewInstance.selectedPolygon, 1);
              break;
            case LayeringAction.DOWN:
              polygonViewInstance.movePolygonZ(polygonViewInstance.selectedPolygon, -1);
              break;
            case LayeringAction.TOP:
              polygonViewInstance.movePolygonZ(polygonViewInstance.selectedPolygon, 9999);
              break;
            case LayeringAction.BOTTOM:
              polygonViewInstance.movePolygonZ(polygonViewInstance.selectedPolygon, -9999);
              break;
          }

          editorUiInstance.onEditorDataUpdated();
        },
      });
    } else {
      editorUiInstance.setEditorData(editorData);
    }

    polygonViewInstance.setColor(editorUiInstance.selectedColor);
    polygonViewInstance.setMode(editorUiInstance.selectedMode);
    polygonViewInstance.selectPolygon(null);
    polygonViewInstance.updatePolygons();
  };

  refreshData();
})();
