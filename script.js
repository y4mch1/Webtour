const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let isDeleteMode = false;
let viewer = null;
let scenesConfig = {};
let pendingDeleteId = null;
let pendingDeleteScene = null;

const defaultScenes = {
    "scene1": { "title": "test1", "type": "equirectangular", "panorama": "img/dji_fly_20260218_161340_18_1771409468615_pano_optimized.jpg", "hotSpots":[{ "id": "hs_1", "pitch": 0, "yaw": -45, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene2", "createTooltipArgs": { label: "Scene2", icon: "drone" } }] },
    "scene2": { "title": "test2", "type": "equirectangular", "panorama": "img/dji_fly_20260218_161154_17_1771409502511_pano_optimized.jpg", "hotSpots":[{ "id": "hs_2", "pitch": -10, "yaw": 95, "type": "info", "text": "Kembali ke Atas", "sceneId": "scene1", "createTooltipArgs": { label: "scene1", icon: "drone" } }, { "id": "hs_3", "pitch": 0, "yaw": -25, "type": "info", "text": "Kembali ke Atas", "sceneId": "scene3", "createTooltipArgs": { label: "scene3(sinpasa)", icon: "drone" } }, { "id": "hs_4", "pitch": 0, "yaw": 0, "type": "info", "text": "Kembali ke Atas", "sceneId": "scene4", "createTooltipArgs": { label: "scene4(belakang itb)", icon: "drone" } }] },
    "scene3": { "title": "test1", "type": "equirectangular", "panorama": "img/dji_fly_20260218_161948_21_1771409373814_pano_optimized.jpg", "hotSpots":[{ "id": "hs_5", "pitch": -10, "yaw": 0, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene2", "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" } }, { "id": "hs_6", "pitch": -20, "yaw": -130, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene4", "createTooltipArgs": { label: "Scene4(Belokan)", icon: "drone" } }] }, 
    "scene4": { "title": "test1", "type": "equirectangular", "panorama": "img/dji_fly_20260218_161754_20_1771409371421_pano_optimized.jpg", "hotSpots":[{ "id": "hs_7", "pitch": -10, "yaw": 0, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene2", "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" } }, { "id": "hs_8", "pitch": -10, "yaw": -30, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene1", "createTooltipArgs": { label: "scene1", icon: "drone" } }, { "id": "hs_9", "pitch": -25, "yaw": 8, "type": "info", "text": "Kembali ke Atas", "sceneId": "sceneitb", "createTooltipArgs": { label: "ITB", icon: "star" } }, { "id": "hs_10", "pitch": -32, "yaw": 48, "type": "info", "text": "Kembali ke Atas", "sceneId": "scenesinpasa", "createTooltipArgs": { label: "SINPASA", icon: "star" } }, { "id": "hs_11", "pitch": -10, "yaw": 45, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene3", "createTooltipArgs": { label: "scene3", icon: "drone" } }] },
    "sceneitb": { "title": "test1", "type": "equirectangular", "panorama": "img/IMG_7354.jpg", "hotSpots":[{ "id": "hs_12", "pitch": 10, "yaw": -40, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene4", "createTooltipArgs": { label: "scene4(belakang itb)", icon: "drone" } }, { "id": "hs_13", "pitch": 10, "yaw": 40, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene2", "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" } }] },
    "scenesinpasa": { "title": "test1", "type": "equirectangular", "panorama": "img/IMG_7355.jpg", "hotSpots":[{ "id": "hs_14", "pitch": 10, "yaw": -130, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene4", "createTooltipArgs": { label: "scene4(belakang itb)", icon: "drone" } }, { "id": "hs_15", "pitch": 10, "yaw": -80, "type": "info", "text": "Turun ke Bawah", "sceneId": "scene2", "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" } }] }
};

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
        scenesConfig = payload.new.scenes;
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
        
        const popup = document.getElementById('delete-popup');
        popup.style.display = 'block';
        
        return; 
    }
    
    viewer.loadScene(args.sceneId);
}

function executeDelete() {
    if (pendingDeleteId && pendingDeleteScene) {
        viewer.removeHotSpot(pendingDeleteId, pendingDeleteScene);
        scenesConfig[pendingDeleteScene].hotSpots = scenesConfig[pendingDeleteScene].hotSpots.filter(hs => hs.id !== pendingDeleteId);
        saveToDatabase();
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
}

function injectFunctions() {
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
}

function toggleMode() {
    const mode = document.getElementById('viewMode').value;
    document.getElementById('admin-panel').style.display = (mode === 'admin') ? 'block' : 'none';
    document.getElementById('crosshair').style.display = (mode === 'admin') ? 'block' : 'none';
    if(mode !== 'admin') {
        isDeleteMode = false;
        updateDeleteBtnUI();
        closeDeletePopup(); 
    }
    if(mode === 'admin') updateSceneDropdown();
}

function toggleDeleteMode() {
    isDeleteMode = !isDeleteMode;
    updateDeleteBtnUI();
    showStatus(isDeleteMode ? "Delete Mode Active: Click a node to remove" : "Delete Mode Off");
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

async function resetDatabase() {
    if(confirm("Reset all custom nodes to default?")) {
        scenesConfig = defaultScenes;
        await saveToDatabase();
        location.reload();
    }
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
        viewer.loadScene(best.sceneId);
        setTimeout(updateSceneDropdown, 1200);
    }
});

function showStatus(text) {
    const el = document.getElementById('status');
    el.innerText = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 2500);
}

initDatabase();
