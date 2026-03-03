const SUPABASE_URL = 'https://jaezymzfqnpgcymovfvk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZXp5bXpmcW5wZ2N5bW92ZnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDUyMjksImV4cCI6MjA4ODAyMTIyOX0.hZDZ0dRgwU3xdFBmqFJSN2OUBxH4zSD-MIxfYCujTzQ';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let isDeleteMode = false;
let viewer = null;
let scenesConfig = {};
let pendingDeleteId = null;
let pendingDeleteScene = null;
let pendingDeleteType = 'hotspot';
let isPolygonMode = false;
let polygonDraft = { sceneId: null, points: [], color: '#ff4d4d' };
let polygonOverlay = null;
let polygonRenderFrame = null;
let pointerTracker = { active: false, moved: false, startX: 0, startY: 0 };
let hoveredPolygonId = null;
let hoveredPolygonScene = null;
let polygonScreenCache = {};
const POLYGON_MIN_POINTS = 3;
const SIGN_COLOR_DEFAULTS = {
    title: '#1b263b',
    address: '#ffffff',
    area: '#ffffff'
};
let signOverlay = null;
const signElements = {};
let signPopupOverlay = null;
let signPopupImageEl = null;
let signPopupTitleEl = null;
let signPopupAddressEl = null;
let signPopupAreaEl = null;

const defaultScenes = {
    "scene1": { "title": "test1", "type": "equirectangular", "panorama": "img/dji_fly_20260218_161340_18_1771409468615_pano_optimized.jpg", "hotSpots":[{ "id": "hs_1", "pitch": 0, "yaw": -45, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene2", "createTooltipArgs": { label: "Scene2", icon: "drone" } }] },
    "scene2": { "title": "test2", "type": "equirectangular", "panorama": "img/dji_fly_20260218_161154_17_1771409502511_pano_optimized.jpg", "hotSpots":[{ "id": "hs_2", "pitch": -10, "yaw": 95, "type": "info", "text": "Kembali ke Atas", "sceneId": "scene1", "createTooltipArgs": { label: "scene1", icon: "drone" } }, { "id": "hs_3", "pitch": 0, "yaw": -25, "type": "info", "text": "Kembali ke Atas", "sceneId": "scene3", "createTooltipArgs": { label: "scene3(sinpasa)", icon: "drone" } }, { "id": "hs_4", "pitch": 0, "yaw": 0, "type": "info", "text": "Kembali ke Atas", "sceneId": "scene4", "createTooltipArgs": { label: "scene4(belakang itb)", icon: "drone" } }] },
    "scene3": { "title": "test1", "type": "equirectangular", "panorama": "img/dji_fly_20260218_161948_21_1771409373814_pano_optimized.jpg", "hotSpots":[{ "id": "hs_5", "pitch": -10, "yaw": 0, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene2", "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" } }, { "id": "hs_6", "pitch": -20, "yaw": -130, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene4", "createTooltipArgs": { label: "Scene4(Belokan)", icon: "drone" } }] }, 
    "scene4": { "title": "test1", "type": "equirectangular", "panorama": "img/dji_fly_20260218_161754_20_1771409371421_pano_optimized.jpg", "hotSpots":[{ "id": "hs_7", "pitch": -10, "yaw": 0, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene2", "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" } }, { "id": "hs_8", "pitch": -10, "yaw": -30, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene1", "createTooltipArgs": { label: "scene1", icon: "drone" } }, { "id": "hs_9", "pitch": -25, "yaw": 8, "type": "info", "text": "Kembali ke Atas", "sceneId": "sceneitb", "createTooltipArgs": { label: "ITB", icon: "star" } }, { "id": "hs_10", "pitch": -32, "yaw": 48, "type": "info", "text": "Kembali ke Atas", "sceneId": "scenesinpasa", "createTooltipArgs": { label: "SINPASA", icon: "star" } }, { "id": "hs_11", "pitch": -10, "yaw": 45, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene3", "createTooltipArgs": { label: "scene3", icon: "drone" } }] },
    "sceneitb": { "title": "test1", "type": "equirectangular", "panorama": "img/IMG_7354.jpg", "hotSpots":[{ "id": "hs_12", "pitch": 10, "yaw": -40, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene4", "createTooltipArgs": { label: "scene4(belakang itb)", icon: "drone" } }, { "id": "hs_13", "pitch": 10, "yaw": 40, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene2", "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" } }] },
    "scenesinpasa": { "title": "test1", "type": "equirectangular", "panorama": "img/IMG_7355.jpg", "hotSpots":[{ "id": "hs_14", "pitch": 10, "yaw": -130, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene4", "createTooltipArgs": { label: "scene4(belakang itb)", icon: "drone" } }, { "id": "hs_15", "pitch": 10, "yaw": -80, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene2", "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" } }] }
};
Object.keys(defaultScenes).forEach(id => {
    if (!Array.isArray(defaultScenes[id].polygons)) {
        defaultScenes[id].polygons = [];
    }
    if (!Array.isArray(defaultScenes[id].signs)) {
        defaultScenes[id].signs = [];
    }
});

function ensureSceneStructures() {
    Object.keys(scenesConfig || {}).forEach(sceneId => {
        const scene = scenesConfig[sceneId];
        if (!scene) return;
        if (!Array.isArray(scene.hotSpots)) scene.hotSpots = [];
        if (!Array.isArray(scene.polygons)) scene.polygons = [];
        if (!Array.isArray(scene.signs)) scene.signs = [];
        scene.signs.forEach(sign => {
            if (!sign.id) sign.id = generateSignId();
            if (typeof sign.sceneId === 'undefined' || sign.sceneId === null) {
                sign.sceneId = sceneId;
            }
        });
    });
}

function generateSignId() {
    return 'sign_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

async function initDatabase() {
    try {
        const { data, error } = await supabaseClient.from('tour_settings').select('scenes').eq('id', 1).single();
        
        if (error && error.code !== 'PGRST116') {
            console.error("Error Database:", error);
        }

        if (data && data.scenes) {
            if (typeof data.scenes === 'string') {
                try {
                    scenesConfig = JSON.parse(data.scenes);
                } catch (e) {
                    console.error("Gagal parsing JSON dari string:", e);
                    scenesConfig = defaultScenes;
                }
            } else {
                scenesConfig = data.scenes;
            }
        } else {
            scenesConfig = defaultScenes;
            await supabaseClient.from('tour_settings').insert([{ id: 1, scenes: defaultScenes }]);
        }
        ensureSceneStructures();
    } catch (err) {
        console.error("Error Sistem:", err);
    } finally {
        document.getElementById('loading-screen').style.display = 'none';
        initPannellum();
        subscribeToRealtime();
    }
}

async function saveToDatabase() {
    showStatus("Menyimpan ke server...");
    const { error } = await supabaseClient.from('tour_settings').update({ scenes: scenesConfig }).eq('id', 1);
    if(error) showStatus("Gagal menyimpan!");
    else showStatus("Tersimpan di server!");
}

function subscribeToRealtime() {
    supabaseClient.channel('custom-all-channel')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tour_settings' }, (payload) => {
        try {
            scenesConfig = typeof payload.new.scenes === 'string' ? JSON.parse(payload.new.scenes) : payload.new.scenes;
        } catch (err) {
            console.error('Realtime payload parse error:', err);
            scenesConfig = defaultScenes;
        }
        ensureSceneStructures();
        clearAllSignElements();
        injectFunctions(); 
        
        if(viewer) {
            const currentScene = viewer.getScene();
            const pitch = viewer.getPitch();
            const yaw = viewer.getYaw();
            viewer.loadScene(currentScene, pitch, yaw);
        }
    }).subscribe();
}

function hotspot(hotSpotDiv, args) {
    hotSpotDiv.classList.add('custom-hotspot');
    let labelText = args.label ? args.label : args;
    let iconType = args.icon ? args.icon : 'drone'; 
    hotSpotDiv.setAttribute('data-text', labelText); 
    hotSpotDiv.classList.add(iconType === 'star' ? 'icon-star' : 'icon-drone');
}

function handleHotspotClick(e, args) {
    if (document.getElementById('viewMode').value === 'admin' && isDeleteMode) {
        pendingDeleteId = args.id;
        pendingDeleteScene = viewer.getScene();
        pendingDeleteType = 'hotspot';
        
        const popup = document.getElementById('delete-popup');
        popup.style.display = 'block';
        
        return; 
    }
    
    viewer.loadScene(args.sceneId);
}

function executeDelete() {
    if (pendingDeleteId && pendingDeleteScene) {
        if (pendingDeleteType === 'polygon') {
            if (scenesConfig[pendingDeleteScene] && scenesConfig[pendingDeleteScene].polygons) {
                scenesConfig[pendingDeleteScene].polygons = scenesConfig[pendingDeleteScene].polygons.filter(poly => poly.id !== pendingDeleteId);
                saveToDatabase();
                showStatus('Polygon deleted');
            }
        } else if (pendingDeleteType === 'sign') {
            const scene = scenesConfig[pendingDeleteScene];
            if (scene && scene.signs) {
                scene.signs = scene.signs.filter(sign => sign.id !== pendingDeleteId);
                removeSignElement(pendingDeleteId);
                saveToDatabase();
                showStatus('Papan Sign deleted');
            }
        } else {
            viewer.removeHotSpot(pendingDeleteId, pendingDeleteScene);
            scenesConfig[pendingDeleteScene].hotSpots = scenesConfig[pendingDeleteScene].hotSpots.filter(hs => hs.id !== pendingDeleteId);
            saveToDatabase();
        }
    }
    closeDeletePopup();
}

function cancelDelete() {
    closeDeletePopup();
}

function closeDeletePopup() {
    document.getElementById('delete-popup').style.display = 'none';
    pendingDeleteId = null;
    pendingDeleteScene = null;
    pendingDeleteType = 'hotspot';
}

function injectFunctions() {
    ensureSceneStructures();
    Object.keys(scenesConfig).forEach(s => {
        if(scenesConfig[s].hotSpots) {
            scenesConfig[s].hotSpots.forEach(h => {
                h.type = "info"; 
                
                let targetScene = h.sceneId;
                if (!targetScene && h.clickHandlerArgs) {
                    targetScene = h.clickHandlerArgs.sceneId;
                }
                
                if (h.sceneId) {
                    delete h.sceneId;
                }

                h.createTooltipFunc = hotspot;
                h.clickHandlerFunc = handleHotspotClick;
                h.clickHandlerArgs = { id: h.id, sceneId: targetScene };
                h.cssClass = "custom-hotspot";
            });
        }
    });
}

function initPannellum() {
    injectFunctions();
    viewer = pannellum.viewer('panorama', {   
        "default": {
            "firstScene": "scene1",
            "sceneFadeDuration": 1000,
            "autoLoad": true,
            "showControls": false 
        },
        "scenes": scenesConfig
    });
    ensurePolygonOverlay();
    ensureSignOverlay();
    setupViewerPointerTracker();
    startPolygonRenderLoop();
    viewer.on('scenechange', () => {
        clearHoveredPolygon();
        if (isPolygonMode && polygonDraft.sceneId && polygonDraft.sceneId !== viewer.getScene()) {
            showStatus(`Polygon locked to ${polygonDraft.sceneId}. Save or cancel to edit another scene.`);
        }
    });
}

function toggleMode() {
    const mode = document.getElementById('viewMode').value;
    document.getElementById('admin-panel').style.display = (mode === 'admin') ? 'block' : 'none';
    document.getElementById('crosshair').style.display = (mode === 'admin') ? 'block' : 'none';
    if(mode !== 'admin') {
        isDeleteMode = false;
        updateDeleteBtnUI();
        closeDeletePopup(); 
        disablePolygonMode(true);
    }
    if(mode === 'admin') updateSceneDropdown();
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.admin-tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `tab-${tab}`);
    });
}

function toggleDeleteMode() {
    isDeleteMode = !isDeleteMode;
    updateDeleteBtnUI();
    showStatus(isDeleteMode ? "Delete Mode Active: Click node/polygon/sign to remove" : "Delete Mode Off");
    if (!isDeleteMode) closeDeletePopup(); 
}

function updateDeleteBtnUI() {
    const btn = document.getElementById('btn-delete-mode');
    if(isDeleteMode) {
        btn.classList.add('active');
        btn.innerText = "Delete Mode: ON";
    } else {
        btn.classList.remove('active');
        btn.innerText = "Delete Mode: OFF";
    }
}

function updateSceneDropdown() {
    const select = document.getElementById('targetSceneSelect');
    select.innerHTML = '';
    Object.keys(scenesConfig).forEach(id => {
        if(id !== viewer.getScene()) {
            const opt = document.createElement('option');
            opt.value = id;
            opt.innerHTML = id;
            select.appendChild(opt);
        }
    });
}

function confirmAddNode() {
    const target = document.getElementById('targetSceneSelect').value;
    const selectedIcon = document.getElementById('iconSelect').value;
    
    const pitch = viewer.getPitch();
    const yaw = viewer.getYaw();
    const currentScene = viewer.getScene();
    const uniqueId = "hs_" + Date.now();

    const newHS = {
        "id": uniqueId,
        "pitch": pitch,
        "yaw": yaw,
        "type": "info",
        "text": "Ke " + target,
        "cssClass": "custom-hotspot",
        "createTooltipArgs": { label: target, icon: selectedIcon },
        "clickHandlerFunc": handleHotspotClick,
        "clickHandlerArgs": { id: uniqueId, sceneId: target }
    };

    if(!scenesConfig[currentScene].hotSpots) scenesConfig[currentScene].hotSpots =[];
    scenesConfig[currentScene].hotSpots.push(newHS);
    
    newHS.createTooltipFunc = hotspot;
    viewer.addHotSpot(newHS, currentScene);
    
    saveToDatabase();
}

function handleAddSign() {
    if (!viewer) {
        showStatus('Viewer belum siap');
        return;
    }
    if (document.getElementById('viewMode').value !== 'admin') {
        showStatus('Sign hanya bisa ditambah di Admin Mode');
        return;
    }
    const form = getSignFormData();
    if (!form.valid) {
        showStatus(form.message);
        return;
    }
    const sceneId = viewer.getScene();
    ensureSceneStructures();
    const scene = scenesConfig[sceneId];
    if (!scene) return;
    if (!Array.isArray(scene.signs)) scene.signs = [];
    const newSign = {
        id: generateSignId(),
        pitch: viewer.getPitch(),
        yaw: viewer.getYaw(),
        title: form.title,
        address: form.address,
        landSize: form.area,
        imageUrl: form.imageUrl,
        colorTitle: form.colorTitle,
        colorAddress: form.colorAddress,
        colorArea: form.colorArea,
        sceneId
    };
    scene.signs.push(newSign);
    saveToDatabase();
    showStatus('Papan Sign ditambahkan');
    handleClearSignForm();
}

function handleClearSignForm() {
    const titleInput = document.getElementById('signTitle');
    const addressInput = document.getElementById('signAddress');
    const areaInput = document.getElementById('signArea');
    const imageInput = document.getElementById('signImageUrl');
    if (titleInput) titleInput.value = '';
    if (addressInput) addressInput.value = '';
    if (areaInput) areaInput.value = '';
    if (imageInput) imageInput.value = '';
    const titleColor = document.getElementById('signTitleColor');
    const addressColor = document.getElementById('signAddressColor');
    const areaColor = document.getElementById('signAreaColor');
    if (titleColor) titleColor.value = SIGN_COLOR_DEFAULTS.title;
    if (addressColor) addressColor.value = SIGN_COLOR_DEFAULTS.address;
    if (areaColor) areaColor.value = SIGN_COLOR_DEFAULTS.area;
}

function getSignFormData() {
    const title = (document.getElementById('signTitle')?.value || '').trim();
    const address = (document.getElementById('signAddress')?.value || '').trim();
    const area = (document.getElementById('signArea')?.value || '').trim();
    const imageUrl = (document.getElementById('signImageUrl')?.value || '').trim();
    if (!title || !address || !area || !imageUrl) {
        return { valid: false, message: 'Lengkapi Title, Alamat, Luas, dan Image URL' };
    }
    const colorTitle = document.getElementById('signTitleColor')?.value || SIGN_COLOR_DEFAULTS.title;
    const colorAddress = document.getElementById('signAddressColor')?.value || SIGN_COLOR_DEFAULTS.address;
    const colorArea = document.getElementById('signAreaColor')?.value || SIGN_COLOR_DEFAULTS.area;
    return {
        valid: true,
        title,
        address,
        area,
        imageUrl,
        colorTitle,
        colorAddress,
        colorArea
    };
}

async function resetDatabase() {
    if(confirm("Reset all custom nodes to default?")) {
        scenesConfig = defaultScenes;
        await saveToDatabase();
        location.reload();
    }
}

function togglePolygonMode() {
    if (!viewer) return;
    if (document.getElementById('viewMode').value !== 'admin') {
        showStatus('Polygon mode hanya tersedia di Admin');
        return;
    }
    if (isPolygonMode) {
        disablePolygonMode();
        return;
    }
    isPolygonMode = true;
    polygonDraft.sceneId = viewer.getScene();
    polygonDraft.points = [];
    polygonDraft.color = getPolygonColor();
    showStatus('Polygon mode aktif: klik untuk menambah titik');
    updatePolygonButtons();
}

function disablePolygonMode(silent = false) {
    if (!isPolygonMode) return;
    isPolygonMode = false;
    resetPolygonDraft();
    if (!silent) showStatus('Polygon mode dimatikan');
    updatePolygonButtons();
}

function resetPolygonDraft() {
    polygonDraft = { sceneId: null, points: [], color: getPolygonColor() };
}

function savePolygonDraft() {
    if (!isPolygonMode) return;
    if (!polygonDraft.sceneId || polygonDraft.points.length < POLYGON_MIN_POINTS) {
        showStatus('Minimal 3 titik untuk polygon');
        return;
    }
    ensureSceneStructures();
    const scene = scenesConfig[polygonDraft.sceneId];
    if (!scene) return;
    if (!Array.isArray(scene.polygons)) scene.polygons = [];
    const newPolygon = {
        id: 'poly_' + Date.now(),
        color: getPolygonColor(),
        points: polygonDraft.points.map(p => ({ pitch: p.pitch, yaw: p.yaw }))
    };
    scene.polygons.push(newPolygon);
    saveToDatabase();
    showStatus('Polygon tersimpan');
    disablePolygonMode(true);
}

function cancelPolygonDraft() {
    if (!isPolygonMode) return;
    disablePolygonMode(true);
    showStatus('Polygon dibatalkan');
}

function updatePolygonButtons() {
    const modeBtn = document.getElementById('btn-polygon-mode');
    const saveBtn = document.getElementById('btn-polygon-save');
    const cancelBtn = document.getElementById('btn-polygon-cancel');
    if (modeBtn) {
        modeBtn.classList.toggle('active', isPolygonMode);
        modeBtn.innerText = isPolygonMode ? 'Polygon Mode: ON' : 'Polygon Mode: OFF';
    }
    if (saveBtn) saveBtn.disabled = !isPolygonMode || polygonDraft.points.length < POLYGON_MIN_POINTS;
    if (cancelBtn) cancelBtn.disabled = !isPolygonMode || polygonDraft.points.length === 0;
}

function getPolygonColor() {
    const input = document.getElementById('polygonColor');
    return input ? input.value : polygonDraft.color || '#ff4d4d';
}

function setupViewerPointerTracker() {
    const container = document.getElementById('panorama');
    if (!container) return;
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('click', handlePolygonDeleteClick);
}

function handlePointerDown(e) {
    if (!isPolygonMode || document.getElementById('viewMode').value !== 'admin') return;
    if (e.button !== 0) return;
    pointerTracker.active = true;
    pointerTracker.moved = false;
    pointerTracker.startX = e.clientX;
    pointerTracker.startY = e.clientY;
}

function handlePointerMove(e) {
    trackPolygonHover(e);
    if (!pointerTracker.active) return;
    if (Math.abs(e.clientX - pointerTracker.startX) > 5 || Math.abs(e.clientY - pointerTracker.startY) > 5) {
        pointerTracker.moved = true;
    }
}

function handlePointerUp(e) {
    if (pointerTracker.active && !pointerTracker.moved && isPolygonMode && document.getElementById('viewMode').value === 'admin' && e.button === 0) {
        addPolygonVertexFromEvent(e);
    }
    pointerTracker.active = false;
    pointerTracker.moved = false;
}

function handlePointerLeave() {
    pointerTracker.active = false;
    pointerTracker.moved = false;
    clearHoveredPolygon();
}

function trackPolygonHover(event) {
    if (!viewer || !polygonOverlay) return;
    const sceneId = viewer.getScene();
    const cache = polygonScreenCache[sceneId];
    if (!cache) {
        clearHoveredPolygon();
        return;
    }
    const rect = polygonOverlay.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    let detectedId = null;
    Object.keys(cache).some(id => {
        const projected = cache[id];
        if (projected && pointInPolygon(projected, pointerX, pointerY)) {
            detectedId = id;
            return true;
        }
        return false;
    });
    if (detectedId) {
        hoveredPolygonId = detectedId;
        hoveredPolygonScene = sceneId;
    } else {
        clearHoveredPolygon();
    }
}

function clearHoveredPolygon() {
    hoveredPolygonId = null;
    hoveredPolygonScene = null;
}

function handlePolygonDeleteClick(event) {
    if (document.getElementById('viewMode').value !== 'admin') return;
    if (!isDeleteMode || isPolygonMode) return;
    trackPolygonHover(event);
    if (!hoveredPolygonId || hoveredPolygonScene !== viewer.getScene()) return;
    pendingDeleteId = hoveredPolygonId;
    pendingDeleteScene = hoveredPolygonScene;
    pendingDeleteType = 'polygon';
    document.getElementById('delete-popup').style.display = 'block';
    event.stopPropagation();
    event.preventDefault();
}

function addPolygonVertexFromEvent(event) {
    if (!viewer) return;
    const currentScene = viewer.getScene();
    if (!polygonDraft.sceneId) {
        polygonDraft.sceneId = currentScene;
    }
    if (polygonDraft.sceneId !== currentScene) {
        showStatus(`Polygon terkunci di ${polygonDraft.sceneId}`);
        return;
    }
    const coords = viewer.mouseEventToCoords(event);
    if (!coords || coords.length < 2) return;
    const pitch = coords[0];
    const yaw = coords[1];
    polygonDraft.points.push({ pitch, yaw });
    polygonDraft.color = getPolygonColor();
    updatePolygonButtons();
    showStatus(`Titik ${polygonDraft.points.length} ditambahkan`);
}

function ensurePolygonOverlay() {
    if (polygonOverlay || !document.getElementById('panorama')) return;
    polygonOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    polygonOverlay.setAttribute('id', 'polygon-overlay');
    polygonOverlay.setAttribute('preserveAspectRatio', 'none');
    document.getElementById('panorama').appendChild(polygonOverlay);
}

function ensureSignOverlay() {
    if (signOverlay || !document.getElementById('panorama')) return;
    signOverlay = document.createElement('div');
    signOverlay.setAttribute('id', 'sign-overlay');
    document.getElementById('panorama').appendChild(signOverlay);
}

function startPolygonRenderLoop() {
    if (polygonRenderFrame) cancelAnimationFrame(polygonRenderFrame);
    const loop = () => {
        renderPolygons();
        renderSigns();
        polygonRenderFrame = requestAnimationFrame(loop);
    };
    loop();
}

function renderPolygons() {
    if (!viewer || !polygonOverlay) return;
    const sceneId = viewer.getScene();
    const scene = scenesConfig[sceneId];
    if (!scene) {
        polygonOverlay.replaceChildren();
        return;
    }
    const container = viewer.getContainer();
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const viewerState = getViewerState();
    if (!viewerState) return;
    polygonOverlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
    polygonOverlay.setAttribute('width', width);
    polygonOverlay.setAttribute('height', height);
    polygonScreenCache[sceneId] = {};
    Object.keys(polygonScreenCache).forEach(key => {
        if (key !== sceneId) delete polygonScreenCache[key];
    });
    const fragment = document.createDocumentFragment();
    (scene.polygons || []).forEach(poly => {
        if (!poly.points || poly.points.length < 3) return;
        const computed = buildPathData(poly.points, width, height, false, viewerState);
        if (!computed) return;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', computed.path);
        path.setAttribute('fill', poly.color || '#ff4d4d');
        path.setAttribute('stroke', poly.color || '#ff4d4d');
        path.classList.add('polygon-path');
        path.dataset.id = poly.id;
        path.dataset.scene = sceneId;
        if (hoveredPolygonId === poly.id && hoveredPolygonScene === sceneId) {
            path.classList.add('is-hovered');
        }
        polygonScreenCache[sceneId][poly.id] = computed.points;
        fragment.appendChild(path);
    });
    if (isPolygonMode && polygonDraft.points.length >= 2 && polygonDraft.sceneId === sceneId) {
        const previewPath = buildPathData(polygonDraft.points, width, height, true, viewerState);
        if (previewPath) {
            const preview = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            preview.setAttribute('d', previewPath.path);
            preview.classList.add('polygon-preview');
            preview.style.stroke = polygonDraft.color || '#ffffff';
            fragment.appendChild(preview);
        }
    }
    polygonOverlay.replaceChildren(fragment);
}

function renderSigns() {
    if (!viewer) return;
    if (!signOverlay) ensureSignOverlay();
    if (!signOverlay) return;
    const sceneId = viewer.getScene();
    const scene = scenesConfig[sceneId];
    if (!scene) {
        clearAllSignElements();
        return;
    }
    const container = viewer.getContainer();
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const viewerState = getViewerState();
    if (!viewerState) return;
    const activeIds = new Set();
    (scene.signs || []).forEach(sign => {
        if (!sign.id) sign.id = generateSignId();
        if (typeof sign.sceneId === 'undefined' || sign.sceneId === null) sign.sceneId = sceneId;
        if (typeof sign.pitch !== 'number' || typeof sign.yaw !== 'number') return;
        const coords = projectToScreen(sign.pitch, sign.yaw, width, height, viewerState);
        if (!coords || !coords.visible) {
            const hiddenEl = signElements[sign.id];
            if (hiddenEl) hiddenEl.style.display = 'none';
            return;
        }
        let el = signElements[sign.id];
        if (!el) {
            el = buildSignElement(sign);
        }
        updateSignElement(el, sign, coords, sceneId);
        activeIds.add(sign.id);
    });
    Object.keys(signElements).forEach(id => {
        if (!activeIds.has(id)) {
            removeSignElement(id);
        }
    });
}

function buildSignElement(sign) {
    const card = document.createElement('div');
    card.className = 'sign-card';
    card.dataset.id = sign.id;
    card.addEventListener('click', (event) => handleSignClick(event, sign.id));

    const titleEl = document.createElement('div');
    titleEl.className = 'sign-segment sign-title';
    card.appendChild(titleEl);

    const addressEl = document.createElement('div');
    addressEl.className = 'sign-segment sign-address';
    card.appendChild(addressEl);

    const areaEl = document.createElement('div');
    areaEl.className = 'sign-segment sign-area';
    card.appendChild(areaEl);

    signElements[sign.id] = card;
    if (!signOverlay) ensureSignOverlay();
    if (signOverlay) signOverlay.appendChild(card);
    return card;
}

function updateSignElement(element, sign, coords, sceneId) {
    if (!element) return;
    element.style.left = `${coords.x}px`;
    element.style.top = `${coords.y}px`;
    element.style.display = 'block';
    element.dataset.scene = sceneId;

    const titleEl = element.querySelector('.sign-title');
    const addressEl = element.querySelector('.sign-address');
    const areaEl = element.querySelector('.sign-area');

    if (titleEl) {
        titleEl.textContent = sign.title || '-';
        titleEl.style.backgroundColor = sign.colorTitle || SIGN_COLOR_DEFAULTS.title;
        titleEl.style.color = '#fff';
    }
    if (addressEl) {
        addressEl.textContent = sign.address || '-';
        addressEl.style.backgroundColor = sign.colorAddress || SIGN_COLOR_DEFAULTS.address;
    }
    if (areaEl) {
        areaEl.textContent = sign.landSize ? `Luas: ${sign.landSize}` : '-';
        areaEl.style.backgroundColor = sign.colorArea || SIGN_COLOR_DEFAULTS.area;
    }
}

function clearAllSignElements() {
    Object.keys(signElements).forEach(id => {
        removeSignElement(id);
    });
}

function removeSignElement(signId) {
    if (signElements[signId]) {
        signElements[signId].remove();
    }
    delete signElements[signId];
}

function handleSignClick(event, signId) {
    event.stopPropagation();
    event.preventDefault();
    const sceneId = viewer ? viewer.getScene() : null;
    if (!sceneId) return;
    const scene = scenesConfig[sceneId];
    if (!scene || !Array.isArray(scene.signs)) return;
    const sign = scene.signs.find(s => s.id === signId);
    if (!sign) return;

    if (document.getElementById('viewMode').value === 'admin' && isDeleteMode) {
        pendingDeleteId = signId;
        pendingDeleteScene = sceneId;
        pendingDeleteType = 'sign';
        document.getElementById('delete-popup').style.display = 'block';
        return;
    }

    openSignPopup(sign);
}

function openSignPopup(sign) {
    if (!signPopupOverlay) return;
    if (signPopupImageEl) {
        signPopupImageEl.src = sign.imageUrl || '';
    }
    if (signPopupTitleEl) signPopupTitleEl.innerText = sign.title || '';
    if (signPopupAddressEl) signPopupAddressEl.innerText = sign.address || '';
    if (signPopupAreaEl) signPopupAreaEl.innerText = sign.landSize ? `Luas Tanah: ${sign.landSize}` : '';
    signPopupOverlay.style.display = 'flex';
}

function closeSignPopup() {
    if (!signPopupOverlay) return;
    signPopupOverlay.style.display = 'none';
    if (signPopupImageEl) signPopupImageEl.src = '';
}

function cacheSignPopupElements() {
    signPopupOverlay = document.getElementById('sign-image-overlay');
    signPopupImageEl = document.getElementById('sign-popup-image');
    signPopupTitleEl = document.getElementById('sign-popup-title');
    signPopupAddressEl = document.getElementById('sign-popup-address');
    signPopupAreaEl = document.getElementById('sign-popup-area');
    if (signPopupOverlay) {
        signPopupOverlay.addEventListener('click', (event) => {
            if (event.target === signPopupOverlay) {
                closeSignPopup();
            }
        });
    }
}

function buildPathData(points, width, height, isPreview, viewerState) {
    const projected = [];
    for (let i = 0; i < points.length; i++) {
        const pt = projectToScreen(points[i].pitch, points[i].yaw, width, height, viewerState);
        if (!pt || !pt.visible) return null;
        projected.push(pt);
    }
    if (projected.length < 2) return null;
    let d = `M ${projected[0].x} ${projected[0].y}`;
    for (let i = 1; i < projected.length; i++) {
        d += ` L ${projected[i].x} ${projected[i].y}`;
    }
    if (!isPreview && projected.length >= 3) {
        d += ' Z';
    }
    return { path: d, points: projected };
}

function projectToScreen(pitch, yaw, width, height, viewerState) {
    if (!viewer) return null;
    const state = viewerState || getViewerState();
    if (!state) return null;
    const pitchRad = pitch * Math.PI / 180;
    const yawRad = yaw * Math.PI / 180;
    const viewerPitchRad = state.pitch * Math.PI / 180;
    const viewerYawRad = state.yaw * Math.PI / 180;
    const viewerHfovRad = state.hfov * Math.PI / 180;
    const yawDiff = -yawRad + viewerYawRad;
    const sinPitch = Math.sin(pitchRad);
    const cosPitch = Math.cos(pitchRad);
    const sinViewerPitch = Math.sin(viewerPitchRad);
    const cosViewerPitch = Math.cos(viewerPitchRad);
    const cosYawDiff = Math.cos(yawDiff);
    const sinYawDiff = Math.sin(yawDiff);
    const h = sinPitch * sinViewerPitch + cosPitch * cosYawDiff * cosViewerPitch;
    if (h <= 0) return { visible: false };
    const k = Math.tan(viewerHfovRad / 2);
    if (k === 0) return { visible: false };
    let x = (-width / k) * sinYawDiff * cosPitch / h / 2;
    let y = (-width / k) * (sinPitch * cosViewerPitch - cosPitch * cosYawDiff * sinViewerPitch) / h / 2;
    const rollRad = (state.roll || 0) * Math.PI / 180;
    if (rollRad !== 0) {
        const sinRoll = Math.sin(rollRad);
        const cosRoll = Math.cos(rollRad);
        const rotatedX = x * cosRoll - y * sinRoll;
        const rotatedY = x * sinRoll + y * cosRoll;
        x = rotatedX;
        y = rotatedY;
    }
    return {
        x: x + width / 2,
        y: y + height / 2,
        visible: true
    };
}

function getViewerState() {
    if (!viewer) return null;
    const config = typeof viewer.getConfig === 'function' ? viewer.getConfig() : {};
    return {
        yaw: viewer.getYaw(),
        pitch: viewer.getPitch(),
        hfov: viewer.getHfov(),
        roll: typeof config.roll === 'number' ? config.roll : (config.roll || 0)
    };
}

function pointInPolygon(points, x, y) {
    if (!points || points.length < 3) return false;
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x;
        const yi = points[i].y;
        const xj = points[j].x;
        const yj = points[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 0.00001) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function getAngleDifference(a, b) {
    let diff = (b - a + 180) % 360 - 180;
    return diff < -180 ? diff + 360 : diff;
}

document.addEventListener('keydown', function(e) {
    if(!viewer) return;
    const key = e.key.toLowerCase();
    const moveKeys =['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (!moveKeys.includes(key)) return;

    let offset = 0;
    if (key === 'w' || key === 'arrowup') offset = 0; 
    else if (key === 'd' || key === 'arrowright') offset = 90;
    else if (key === 's' || key === 'arrowdown') offset = 180; 
    else if (key === 'a' || key === 'arrowleft') offset = -90; 

    const targetYaw = viewer.getYaw() + offset;
    const hotspots = scenesConfig[viewer.getScene()].hotSpots;
    let best = null;
    let minDiff = 35; 

    if (hotspots) {
        hotspots.forEach(hs => {
            let diff = Math.abs(getAngleDifference(targetYaw, hs.yaw));
            if (diff < minDiff) { minDiff = diff; best = hs; }
        });
    }

    if (best) {
        const targetScene = best.clickHandlerArgs ? best.clickHandlerArgs.sceneId : best.sceneId;
        if (targetScene) {
            viewer.loadScene(targetScene);
            setTimeout(updateSceneDropdown, 1200);
        }
    }
});

function showStatus(text) {
    const el = document.getElementById('status');
    el.innerText = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 2500);
}

const polygonColorInput = document.getElementById('polygonColor');
if (polygonColorInput) {
    polygonColorInput.addEventListener('input', () => {
        polygonDraft.color = polygonColorInput.value;
    });
}
updatePolygonButtons();

cacheSignPopupElements();

initDatabase();