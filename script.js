var scenesConfig = {
    "scene1": {
        "title": "test1",
        "type": "equirectangular",
        "panorama": "img/dji_fly_20260218_161340_18_1771409468615_pano_optimized.jpg", 
        "hotSpots": [
            {
                "pitch": 0,
                "yaw": -45, 
                "type": "scene",
                "text": "Turun ke Bawah",
                "sceneId": "scene2",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot, 
                "createTooltipArgs": { label: "Scene2", icon: "drone" } 
            }
        ]
    },
    "scene2": {
        "title": "test2",
        "type": "equirectangular",
        "panorama": "img/dji_fly_20260218_161154_17_1771409502511_pano_optimized.jpg", 
        "hotSpots": [
            {
                "pitch": -10,
                "yaw": 95, 
                "type": "scene",
                "text": "Kembali ke Atas",
                "sceneId": "scene1",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot,
                "createTooltipArgs": { label: "scene1", icon: "drone" }
            },{
                "pitch": 0,
                "yaw": -25, 
                "type": "scene",
                "text": "Kembali ke Atas",
                "sceneId": "scene3",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot,
                "createTooltipArgs": { label: "scene3(sinpasa)", icon: "drone" }
            },{
                "pitch": 0,
                "yaw": 0, 
                "type": "scene",
                "text": "Kembali ke Atas",
                "sceneId": "scene4",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot,
                "createTooltipArgs": { label: "scene4(belakang itb)", icon: "drone" }
            }
        ]
        
    },
    "scene3": {
        "title": "test1",
        "type": "equirectangular",
        "panorama": "img/dji_fly_20260218_161948_21_1771409373814_pano_optimized.jpg", 
        "hotSpots": [
            {
                "pitch": -10,
                "yaw": 0, 
                "type": "scene",
                "text": "Turun ke Bawah",
                "sceneId": "scene2",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot, 
                "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" }
            },{
                "pitch": -20,
                "yaw": -130, 
                "type": "scene",
                "text": "Turun ke Bawah",
                "sceneId": "scene4",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot, 
                "createTooltipArgs": { label: "Scene4(Belokan)", icon: "drone" }
            }
        ]
    }, "scene4": {
        "title": "test1",
        "type": "equirectangular",
        "panorama": "img/dji_fly_20260218_161754_20_1771409371421_pano_optimized.jpg", 
        "hotSpots": [
            {
                "pitch": -10,
                "yaw": 0, 
                "type": "scene",
                "text": "Turun ke Bawah",
                "sceneId": "scene2",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot, 
                "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" }
            },
            {
                "pitch": -10,
                "yaw": -30, 
                "type": "scene",
                "text": "Turun ke Bawah",
                "sceneId": "scene1",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot, 
                "createTooltipArgs": { label: "scene1", icon: "drone" }
            },
            {
                "pitch": -25,
                "yaw": 8, 
                "type": "scene",
                "text": "Kembali ke Atas",
                "sceneId": "sceneitb",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot,
                "createTooltipArgs": { label: "ITB", icon: "star" }
            },
            {
                "pitch": -32,
                "yaw": 48, 
                "type": "scene",
                "text": "Kembali ke Atas",
                "sceneId": "scenesinpasa",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot,
                "createTooltipArgs": { label: "SINPASA", icon: "star" }
            },
            {
                "pitch": -10,
                "yaw": 45, 
                "type": "scene",
                "text": "Turun ke Bawah",
                "sceneId": "scene3",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot, 
                "createTooltipArgs": { label: "scene3", icon: "drone" }
            }
        ]
    },"sceneitb": {
        "title": "test1",
        "type": "equirectangular",
        "panorama": "img/IMG_7354.jpg", 
        "hotSpots": [
            {
                "pitch": 10,
                "yaw": -40, 
                "type": "scene",
                "text": "Turun ke Bawah",
                "sceneId": "scene4",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot, 
                "createTooltipArgs": { label: "scene4(belakang itb)", icon: "drone" }
            },{
                "pitch": 10,
                "yaw": 40, 
                "type": "scene",
                "text": "Turun ke Bawah",
                "sceneId": "scene2",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot, 
                "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" }
            }
          
        ]
    },"scenesinpasa": {
        "title": "test1",
        "type": "equirectangular",
        "panorama": "img/IMG_7355.jpg", 
        "hotSpots": [
            {
                "pitch": 10,
                "yaw": -130, 
                "type": "scene",
                "text": "Turun ke Bawah",
                "sceneId": "scene4",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot, 
                "createTooltipArgs": { label: "scene4(belakang itb)", icon: "drone" }
            }, {
                "pitch": 10,
                "yaw": -80, 
                "type": "scene",
                "text": "Turun ke Bawah",
                "sceneId": "scene2",
                "cssClass": "custom-hotspot",
                "createTooltipFunc": hotspot, 
                "createTooltipArgs": { label: "Scene2(Belokan)", icon: "drone" }
            }
           
        ]
    }
};
function hotspot(hotSpotDiv, args) {
    hotSpotDiv.classList.add('custom-hotspot');
    
    var labelText = args.label ? args.label : args;
    var iconType = args.icon ? args.icon : 'drone'; 

    hotSpotDiv.setAttribute('data-text', labelText); 

    if(iconType === 'star') {
        hotSpotDiv.classList.add('icon-star');
    } else {
        hotSpotDiv.classList.add('icon-drone');
    }
}


var viewer = pannellum.viewer('panorama', {   
    "default": {
        "firstScene": "scene1",
        "sceneFadeDuration": 1000,
        "autoLoad": true,
        "showControls": false 
    },
    "scenes": scenesConfig
});

function getAngleDifference(angle1, angle2) {
    var diff = (angle2 - angle1 + 180) % 360 - 180;
    return diff < -180 ? diff + 360 : diff;
}

document.addEventListener('keydown', function(e) {
    var key = e.key.toLowerCase();
    var validKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    
    if (!validKeys.includes(key)) return;

    var directionOffset = 0;
    if (key === 'w' || key === 'arrowup') directionOffset = 0; 
    else if (key === 'd' || key === 'arrowright') directionOffset = 90;
    else if (key === 's' || key === 'arrowdown') directionOffset = 180; 
    else if (key === 'a' || key === 'arrowleft') directionOffset = -90; 
    var currentYaw = viewer.getYaw();
    var targetLookAngle = currentYaw + directionOffset; 
    var currentSceneId = viewer.getScene();
    var hotspots = scenesConfig[currentSceneId].hotSpots;

    if (!hotspots) return;

    var bestHotspot = null;
    var minDiff = 45; 

    hotspots.forEach(function(hs) {
        if (hs.type === 'scene') { 
    
            var diff = Math.abs(getAngleDifference(targetLookAngle, hs.yaw));

            if (diff < minDiff) {
                minDiff = diff;
                bestHotspot = hs;
            }
        }
    });

    if (bestHotspot) {
        showStatus("Berjalan ke " + bestHotspot.text); 
        viewer.loadScene(bestHotspot.sceneId);
    } else {
        console.log("Tidak ada jalan ke arah situ.");
    }
});

function showStatus(text) {
    var el = document.getElementById('status');
    el.innerText = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 1000);
}