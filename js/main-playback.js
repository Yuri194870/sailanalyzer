// js/main-playback.js
document.addEventListener('DOMContentLoaded', async () => {
    // --- Globale variabelen ---
    let map;
    let currentTrackPlaybackInstance = null;
    let playbackControl = null;
    let trackFilterControl = null;
    let labelOptionsControl = null;
    let segmentAnalysisHandler = null;
    let segmentAnalysisDisplayControl = null;
    let originalUploadedTrackDataForSave = null; // Data voor de 'Save' knop
    let layersControl = null;

    // --- Data voorbereiding (uit IndexedDB) ---
    let tracksToUseForInit = [];
    let shouldRestoreSession = false;
    let fullSessionDataToRestore = null;

    const pendingLoadType = localStorage.getItem('pendingMapLoadType');
    localStorage.removeItem('pendingMapLoadType'); // Wis meteen

    if (pendingLoadType) {
        console.log(`MAIN: Attempting to load data of type: ${pendingLoadType} from IndexedDB...`);
        try {
            if (typeof db === 'undefined' || !db.tempSessionData) {
                throw new Error("IndexedDB (db.tempSessionData) is not initialized. Ensure db-config.js is loaded.");
            }
            let recordKey = (pendingLoadType === 'gpx') ? 'gpxDataForMap' : 'sazDataForMap';
            const record = await db.tempSessionData.get(recordKey);

            if (record && record.data) {
                if (pendingLoadType === 'gpx') {
                    tracksToUseForInit = record.data;
                    shouldRestoreSession = false;
                    console.log(`MAIN: GPX data loaded. Tracks: ${tracksToUseForInit.length}`);
                } else if (pendingLoadType === 'saz') {
                    fullSessionDataToRestore = record.data;
                    if (fullSessionDataToRestore.playbackData && fullSessionDataToRestore.playbackData.originalTracks) {
                        tracksToUseForInit = fullSessionDataToRestore.playbackData.originalTracks;
                        shouldRestoreSession = true;
                        console.log("MAIN: Full SAZ session data loaded.");
                    } else {
                        throw new Error("Loaded SAZ session data is invalid (missing track info).");
                    }
                }
                await db.tempSessionData.delete(recordKey);
                console.log(`MAIN: Data for key '${recordKey}' deleted from IndexedDB.`);
            } else {
                console.warn(`MAIN: No data in IndexedDB for key '${recordKey}'.`);
            }
        } catch (error) {
            console.error(`MAIN: Error retrieving ${pendingLoadType} data from IndexedDB:`, error);
            // Fallback
            tracksToUseForInit = [];
            shouldRestoreSession = false;
            fullSessionDataToRestore = null;
        }
    } else {
        console.warn("MAIN: No pending map load type. Starting empty or showing placeholder.");
    }

    // --- Roep de (nu uitgebreide) initialisatiefunctie aan ---
    initializeMapAndPlayback(tracksToUseForInit, shouldRestoreSession, fullSessionDataToRestore);

    // --- DEFINITIE VAN DE HOOFD INITIALISATIEFUNCTIE (NU MET 3 PARAMETERS) ---
    function initializeMapAndPlayback(trackDataForBaseInit, isRestoringFullSession, completeSessionData) {
        console.log(`INIT_MAP_PLAYBACK: Called. isRestoringFullSession: ${isRestoringFullSession}, Tracks for base init: ${trackDataForBaseInit ? trackDataForBaseInit.length : 'N/A'}`);

        // Bepaal welke data de 'Save' knop moet gebruiken
        originalUploadedTrackDataForSave = isRestoringFullSession ? completeSessionData : trackDataForBaseInit;

        // 1. Opschonen van bestaande instanties (jouw bestaande, goede opschoonlogica)
        if (currentTrackPlaybackInstance) {
            console.log("INIT_MAP_PLAYBACK: Cleaning up existing instances...");
            if (playbackControl && map && map.hasControl(playbackControl)) map.removeControl(playbackControl);
            if (trackFilterControl && map && map.hasControl(trackFilterControl)) map.removeControl(trackFilterControl);
            if (labelOptionsControl && map && map.hasControl(labelOptionsControl)) map.removeControl(labelOptionsControl);
            if (segmentAnalysisDisplayControl && map && map.hasControl(segmentAnalysisDisplayControl)) map.removeControl(segmentAnalysisDisplayControl);
            
            if (segmentAnalysisHandler && segmentAnalysisHandler.disable) segmentAnalysisHandler.disable();
            
            currentTrackPlaybackInstance.dispose();
            // Reset globale variabelen voor de controls en instance
            currentTrackPlaybackInstance = null;
            playbackControl = null; trackFilterControl = null; labelOptionsControl = null;
            segmentAnalysisDisplayControl = null; segmentAnalysisHandler = null;
        }
        if (map && map.pm) { // Wis ook Geoman lagen
            map.pm.getGeomanLayers().forEach(layer => {
                try { if(map.hasLayer(layer)) map.removeLayer(layer); } catch(e) { console.warn("Cleanup: Could not remove geoman layer", e); }
            });
        }

        // 2. Kaart initialisatie (alleen als deze nog niet bestaat)
        if (!map) {
            console.log("INIT_MAP_PLAYBACK: Creating new map instance.");
            map = L.map('mapid', { zoomControl: false });
            
            const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { name: 'Road Map', attribution: '© OSM © CARTO', maxZoom: 20, subdomains: 'abcd' });
            const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { name: 'Satellite Map', attribution: 'Tiles © Esri', maxZoom: 20 });
            const CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { name: 'Gray Map', attribution: '© OSM © CARTO', maxZoom: 20, subdomains: 'abcd' });
            const CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { name: 'Dark Map', attribution: '© OSM © CARTO', maxZoom: 20, subdomains: 'abcd' });
            
            streetLayer.addTo(map);
            const baseLayers = { "Road Map": streetLayer, "Satellite Map": satelliteLayer, "Gray Map": CartoDB_Positron, "Dark Map": CartoDB_DarkMatter };
            layersControl = L.control.layers(baseLayers, null, { position: 'topright', collapsed: true }).addTo(map); // Sla layersControl op
            L.control.scale({ position: 'topleft', imperial: false }).addTo(map);
            map.pm.addControls({
                position: 'topleft',
                rotateMode: true,
                drawCircleMarker: true, // Hiermee kan je circlemarkers tekenen
                drawMarker: false,
                drawPolyline: true,
                drawPolygon: false,
                drawCircle: false,
                drawRectangle: false,
                drawText: false,
                editMode: false,
                dragMode: true,
                cutPolygon: false,
                removalMode: true,
                
                
              });
            
              map.pm.setGlobalOptions({
              circleMarkerStyle: {
                radius: 40
              }
            });
            map.on('pm:create', e => {
                if (e.layer instanceof L.CircleMarker) {
                  e.layer.setStyle({
                    radius: 4,
                    color: 'orange',
                    fillColor: 'yellow',
                    fillOpacity: 1
                  });
                }
              });
            console.log("INIT_MAP_PLAYBACK: New map instance created.");
            // --- BEGIN TOEGEVOEGDE TEST ---
            map.setView([52.35, 5.06], 10); // Zet een initiële view
            map.invalidateSize(); // Forceer Leaflet om grootte te herberekenen
            console.log("INIT_MAP_PLAYBACK: map.invalidateSize() called.");
            // --- EINDE TOEGEVOEGDE TEST ---
        }
        
        // Zorg dat trackDataForBaseInit een array is, zelfs als leeg, voor L.trackplayback
        if (!trackDataForBaseInit || !Array.isArray(trackDataForBaseInit)) {
            trackDataForBaseInit = [];
        }

        // 3. Wacht tot de kaart klaar is
        console.log("INIT_MAP_PLAYBACK: ABOUT TO CALL map.whenReady(). Map valid:", !!(map && map.whenReady)); // LOG VOOR WHENREADY
        map.whenReady(function() {
            console.log("INIT_MAP_PLAYBACK: map.whenReady() CALLBACK EXECUTED!"); // EERSTE LOG BINNEN WHENREADY
            console.log("INIT_MAP_PLAYBACK: Map is ready. Setting up TrackPlayback and Controls.");

            // 4. Controleer of er überhaupt data is om weer te geven
            if (trackDataForBaseInit.length === 0 && !isRestoringFullSession) {
                console.warn("INIT_MAP_PLAYBACK: No track data for new session. Displaying placeholder.");
                if (document.getElementById('mapid')) {
                     document.getElementById('mapid').innerHTML = '<p style="padding: 20px;">No data to display. <a href="index.html">Upload GPX files</a> or load a session.</p>';
                }
                // Zet een default view als er echt niks is
                map.setView([52.35, 5.06], 10);
                return; // Stop verdere initialisatie van playback als er geen tracks zijn voor een *nieuwe* sessie
            } else if (document.getElementById('mapid').querySelector('p')) {
                // Verwijder placeholder als die er was en we wel data hebben/een sessie laden
                const placeholder = document.getElementById('mapid').querySelector('p');
                if (placeholder) placeholder.remove();
            }


            // 5. Initialiseer TrackPlayback instantie & basisopties
            // Gebruik altijd defaults voor history/labels tenzij je ze LATER expliciet wilt herstellen.
            // Voor nu focussen we op jouw prioriteiten.
            const defaultLabelOpts = { showName: true, showSpeed: true, showBearing: false };
            const defaultTrackHistDur = 300;

            try {
                currentTrackPlaybackInstance = L.trackplayback(trackDataForBaseInit, map, {
                    targetOptions: { useImg: true, imgUrl: '../css/images/ship.png', width: 12, height: 24 },
                    trackHistoryDuration: defaultTrackHistDur,
                    labelOptions: defaultLabelOpts
                });
                console.log("INIT_MAP_PLAYBACK: L.trackplayback instance created.");
            } catch (error) {
                console.error("INIT_MAP_PLAYBACK: CRITICAL Error initializing L.trackplayback:", error, error.stack);
                alert("Critical error initializing track playback: " + error.message);
                return; 
            }
            
            // 6. Koppel alle controls
            playbackControl = L.trackplaybackcontrol(currentTrackPlaybackInstance, { showSegmentAnalysisButton: true });
            playbackControl.addTo(map);
            if (playbackControl) playbackControl.originalTrackDataForSave = originalUploadedTrackDataForSave;

            trackFilterControl = L.trackFilterControl(currentTrackPlaybackInstance, { position: 'topright', collapsed: true });
            trackFilterControl.addTo(map);
            labelOptionsControl = L.control.labelOptions(currentTrackPlaybackInstance, { position: 'topright', collapsed: true });
            labelOptionsControl.addTo(map);
            segmentAnalysisHandler = L.segmentAnalysisHandler(currentTrackPlaybackInstance, map, {});
            segmentAnalysisDisplayControl = L.control.segmentAnalysisDisplay(segmentAnalysisHandler, { position: 'bottomleft' });
            segmentAnalysisDisplayControl.addTo(map);
            segmentAnalysisHandler.setDisplayControl(segmentAnalysisDisplayControl);

            if (currentTrackPlaybackInstance) {
                currentTrackPlaybackInstance.segmentAnalysisHandler = segmentAnalysisHandler;
                currentTrackPlaybackInstance._map = map; // Zorg dat plugin de kaart referentie heeft
                if (layersControl) currentTrackPlaybackInstance.layersControl = layersControl;
            }
            console.log("INIT_MAP_PLAYBACK: Controls initialized.");

            // 7. Herstel essentiële sessie-elementen (jouw Prio 2 & 3) of fit bounds
            if (isRestoringFullSession && completeSessionData && currentTrackPlaybackInstance) {
                console.log("INIT_MAP_PLAYBACK: Calling simplified currentTrackPlaybackInstance.loadSession() for SAZ...");
                // Roep de (nog te vereenvoudigen) loadSession aan. Deze zal focussen op Prio 2 & 3.
                currentTrackPlaybackInstance.loadSession(completeSessionData); 
                
                // Kaartpositie: fit op de tracks uit de SAZ (jouw Prio 5 is minder belangrijk)
                if (trackDataForBaseInit.length > 0) {
                    let allLatLngsSAZ = [];
                    trackDataForBaseInit.forEach(track => { /* ... (bereken bounds) ... */ 
                        if (Array.isArray(track)) { track.forEach(point => { if (point && typeof point.lat === 'number' && typeof point.lng === 'number') { allLatLngsSAZ.push([point.lat, point.lng]); } }); }
                    });
                    if (allLatLngsSAZ.length > 0) { map.fitBounds(L.latLngBounds(allLatLngsSAZ), { padding: [20, 20] }); }
                    else { map.setView([52.35, 5.06], 10); }
                } else {
                    map.setView([52.35, 5.06], 10);
                }
                console.log("INIT_MAP_PLAYBACK: Map fitted to SAZ tracks. Session essentials should be restored by loadSession.");

            } else if (!isRestoringFullSession && trackDataForBaseInit.length > 0) {
                // Nieuwe GPX sessie: fit bounds (zoals het al was)
                let allLatLngsGPX = [];
                trackDataForBaseInit.forEach(track => { /* ... (bereken bounds) ... */ 
                    if (Array.isArray(track)) { track.forEach(point => { if (point && typeof point.lat === 'number' && typeof point.lng === 'number') { allLatLngsGPX.push([point.lat, point.lng]); } }); }
                });
                if (allLatLngsGPX.length > 0) { map.fitBounds(L.latLngBounds(allLatLngsGPX), { padding: [20, 20] }); }
                else { map.setView([52.35, 5.06], 10); }
                console.log("INIT_MAP_PLAYBACK: Map fitted to new GPX data.");
            } else { 
                // Geen sessie, geen tracks (kan gebeuren als IndexedDB leeg was), zet default view
                map.setView([52.35, 5.06], 10);
                console.log("INIT_MAP_PLAYBACK: No session, no tracks, set default map view.");
            }
            console.log("INIT_MAP_PLAYBACK: Finished map.whenReady block.");
        }); // Einde map.whenReady
    } // Einde initializeMapAndPlayback
}); // Einde DOMContentLoaded