// js/main-playback.js (Versie 5 - Hergebruik van Plugin Berekeningen)

document.addEventListener('DOMContentLoaded', async () => {
    // --- Globale variabelen ---
    let map, currentTrackPlaybackInstance, playbackControl, trackFilterControl, labelOptionsControl, segmentAnalysisHandler, segmentAnalysisDisplayControl, originalUploadedTrackDataForSave, layersControl;
    
    // --- Grafiek variabelen ---
    let syncedLineChart = null;
    let currentChartVariable = 'speed';
    let isDraggingChart = false; // <-- NIEUW: Onze state flag!
    let preCalculatedChartData = {
        speed: [],
        heading: []
    };
    let maxSpeedInData = 0;

    // ... (Data voorbereiding uit IndexedDB - ingekort voor leesbaarheid) ...
    let tracksToUseForInit = [];
    let shouldRestoreSession = false;
    let fullSessionDataToRestore = null;
    const pendingLoadType = localStorage.getItem('pendingMapLoadType');
    localStorage.removeItem('pendingMapLoadType'); 
    if (pendingLoadType) { try { if (typeof db === 'undefined' || !db.tempSessionData) { throw new Error("DB not init"); } let recordKey = (pendingLoadType === 'gpx') ? 'gpxDataForMap' : 'sazDataForMap'; const record = await db.tempSessionData.get(recordKey); if (record && record.data) { if (pendingLoadType === 'gpx') { tracksToUseForInit = record.data; shouldRestoreSession = false; } else if (pendingLoadType === 'saz') { fullSessionDataToRestore = record.data; if (fullSessionDataToRestore.playbackData && fullSessionDataToRestore.playbackData.originalTracks) { tracksToUseForInit = fullSessionDataToRestore.playbackData.originalTracks; shouldRestoreSession = true; } else { throw new Error("Invalid SAZ"); } } await db.tempSessionData.delete(recordKey); } } catch (error) { console.error(`Error retrieving data:`, error); tracksToUseForInit = []; shouldRestoreSession = false; fullSessionDataToRestore = null; } }
    
    initializeMapAndPlayback(tracksToUseForInit, shouldRestoreSession, fullSessionDataToRestore);

    function initializeMapAndPlayback(trackDataForBaseInit, isRestoringFullSession, completeSessionData) {
        // ... (Code voor opschonen en kaart-initialisatie - ingekort voor leesbaarheid) ...
        originalUploadedTrackDataForSave = isRestoringFullSession ? completeSessionData : trackDataForBaseInit;
        if (currentTrackPlaybackInstance) { if (playbackControl && map && map.hasControl(playbackControl)) map.removeControl(playbackControl); if (trackFilterControl && map && map.hasControl(trackFilterControl)) map.removeControl(trackFilterControl); if (labelOptionsControl && map && map.hasControl(labelOptionsControl)) map.removeControl(labelOptionsControl); if (segmentAnalysisDisplayControl && map && map.hasControl(segmentAnalysisDisplayControl)) map.removeControl(segmentAnalysisDisplayControl); if (segmentAnalysisHandler && segmentAnalysisHandler.disable) segmentAnalysisHandler.disable(); currentTrackPlaybackInstance.dispose(); currentTrackPlaybackInstance = null; playbackControl = null; trackFilterControl = null; labelOptionsControl = null; segmentAnalysisDisplayControl = null; segmentAnalysisHandler = null; }
        if (map && map.pm) { map.pm.getGeomanLayers().forEach(layer => { try { if(map.hasLayer(layer)) map.removeLayer(layer); } catch(e) { console.warn("Cleanup: Could not remove geoman layer", e); } }); }
        if (!map) { map = L.map('mapid', { zoomControl: false }); const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { name: 'Road Map', attribution: '© OSM © CARTO', maxZoom: 20, subdomains: 'abcd' }); const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { name: 'Satellite Map', attribution: 'Tiles © Esri', maxZoom: 20 }); const CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { name: 'Gray Map', attribution: '© OSM © CARTO', maxZoom: 20, subdomains: 'abcd' }); const CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { name: 'Dark Map', attribution: '© OSM © CARTO', maxZoom: 20, subdomains: 'abcd' }); streetLayer.addTo(map); const baseLayers = { "Road Map": streetLayer, "Satellite Map": satelliteLayer, "Gray Map": CartoDB_Positron, "Dark Map": CartoDB_DarkMatter }; layersControl = L.control.layers(baseLayers, null, { position: 'topright', collapsed: true }).addTo(map); L.control.scale({ position: 'topleft', imperial: false }).addTo(map); map.pm.addControls({ position: 'topleft', rotateMode: true, drawCircleMarker: true, drawMarker: false, drawPolyline: true, drawPolygon: false, drawCircle: false, drawRectangle: false, drawText: false, editMode: false, dragMode: true, cutPolygon: false, removalMode: true }); map.pm.setGlobalOptions({ circleMarkerStyle: { radius: 40 } }); map.on('pm:create', e => { if (e.layer instanceof L.CircleMarker) { e.layer.setStyle({ radius: 4, color: 'orange', fillColor: 'yellow', fillOpacity: 1 }); } }); map.setView([52.35, 5.06], 10); map.invalidateSize(); }
        if (!trackDataForBaseInit || !Array.isArray(trackDataForBaseInit)) { trackDataForBaseInit = []; }

        map.whenReady(function() {
            // ... (Code voor placeholder, trackplayback instantie en controls - ingekort voor leesbaarheid) ...
            if (trackDataForBaseInit.length === 0 && !isRestoringFullSession) { if (document.getElementById('mapid')) { document.getElementById('mapid').innerHTML = '<p style="padding: 20px;">No data to display. <a href="index.html">Upload GPX files</a> or load a session.</p>'; } map.setView([52.35, 5.06], 10); return; } else if (document.getElementById('mapid').querySelector('p')) { const placeholder = document.getElementById('mapid').querySelector('p'); if (placeholder) placeholder.remove(); }
            const defaultLabelOpts = { showName: true, showSpeed: true, showBearing: false }; const defaultTrackHistDur = 300;
            try { currentTrackPlaybackInstance = L.trackplayback(trackDataForBaseInit, map, { targetOptions: { useImg: true, imgUrl: '../css/images/ship.png', width: 12, height: 24 }, trackHistoryDuration: defaultTrackHistDur, labelOptions: defaultLabelOpts }); } catch (error) { console.error("CRITICAL Error initializing L.trackplayback:", error); return; }
            playbackControl = L.trackplaybackcontrol(currentTrackPlaybackInstance, { showSegmentAnalysisButton: true }); playbackControl.addTo(map); if (playbackControl) playbackControl.originalTrackDataForSave = originalUploadedTrackDataForSave; trackFilterControl = L.trackFilterControl(currentTrackPlaybackInstance, { position: 'topright', collapsed: true }); trackFilterControl.addTo(map); labelOptionsControl = L.control.labelOptions(currentTrackPlaybackInstance, { position: 'topright', collapsed: true }); labelOptionsControl.addTo(map); segmentAnalysisHandler = L.segmentAnalysisHandler(currentTrackPlaybackInstance, map, {}); segmentAnalysisDisplayControl = L.control.segmentAnalysisDisplay(segmentAnalysisHandler, { position: 'bottomleft' }); segmentAnalysisDisplayControl.addTo(map); segmentAnalysisHandler.setDisplayControl(segmentAnalysisDisplayControl); if (currentTrackPlaybackInstance) { currentTrackPlaybackInstance.segmentAnalysisHandler = segmentAnalysisHandler; currentTrackPlaybackInstance._map = map; if (layersControl) currentTrackPlaybackInstance.layersControl = layersControl; }

            // --- NIEUWE VOLGORDE ---
            if (currentTrackPlaybackInstance) {
                precalculateAllChartData(currentTrackPlaybackInstance);
                setupDynamicChart(currentTrackPlaybackInstance);
                setupChartInteractivity(syncedLineChart, currentTrackPlaybackInstance);
                const variableSelect = document.getElementById('chartVariableSelect');
                if (variableSelect) {
                    variableSelect.addEventListener('change', (event) => {
                        updateChartVariable(event.target.value);
                    });
                }
            }

            // ... (Fit bounds code - ingekort voor leesbaarheid) ...
            if (isRestoringFullSession && completeSessionData && currentTrackPlaybackInstance) { let allLatLngsSAZ = []; trackDataForBaseInit.forEach(track => { if (Array.isArray(track)) { track.forEach(point => { if (point && typeof point.lat === 'number' && typeof point.lng === 'number') { allLatLngsSAZ.push([point.lat, point.lng]); } }); } }); if (allLatLngsSAZ.length > 0) { map.fitBounds(L.latLngBounds(allLatLngsSAZ), { padding: [20, 20] }); } else { map.setView([52.35, 5.06], 10); } } else if (!isRestoringFullSession && trackDataForBaseInit.length > 0) { let allLatLngsGPX = []; trackDataForBaseInit.forEach(track => { if (Array.isArray(track)) { track.forEach(point => { if (point && typeof point.lat === 'number' && typeof point.lng === 'number') { allLatLngsGPX.push([point.lat, point.lng]); } }); } }); if (allLatLngsGPX.length > 0) { map.fitBounds(L.latLngBounds(allLatLngsGPX), { padding: [20, 20] }); } else { map.setView([52.35, 5.06], 10); } } else { map.setView([52.35, 5.06], 10); }
        });
    }

    // --- FUNCTIES VOOR DE GRAFIEK (GECORRIGEERD) ---

    /**
     * HERSCHREVEN: Deze functie gebruikt de INTERNE data en functies van de
     * leaflet.trackplayback plugin om de data voor te berekenen.
     */
    /**
     * Formatteert een tijd in milliseconden naar een HH:mm:ss string.
     * @param {number} ms - Tijd in milliseconden.
     * @returns {string} Geformatteerde tijdstring.
     */
    function formatMsToTime(ms) {
        if (isNaN(ms)) return '';
        const date = new Date(ms);
        // getHours, getMinutes, getSeconds geven lokale tijd terug, wat meestal gewenst is.
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function precalculateAllChartData(trackPlayback) {
        maxSpeedInData = 0;
        const speedDataSets = [];
        const headingDataSets = [];
    
        if (!trackPlayback.tracks) return;
    
        trackPlayback.tracks.forEach(trackInstance => {
            const trackKey = trackInstance.getKey();
            const rawPoints = trackInstance._trackPoints;
            if (!rawPoints || rawPoints.length === 0) return;
    
            // --- KLEUR OPLOSSING ---
            // We proberen de kleur op 3 manieren te vinden, van meest specifiek naar meest algemeen.
            let trackColor = '#CCCCCC'; // Default fallback kleur
            if (trackInstance._track && trackInstance._track.options.color) {
                // 1. De beste manier: direct van de getekende L.Polyline.
                trackColor = trackInstance._track.options.color;
            } else if (rawPoints[0].info && rawPoints[0].info[2] && rawPoints[0].info[2].color) {
                // 2. Fallback: uit de 'info' array van het eerste punt.
                trackColor = rawPoints[0].info[2].color;
            } else if (trackPlayback.draw && trackPlayback.draw.trackLineOptions.color) {
                // 3. Uiterste fallback: de standaardkleur uit de Draw-opties.
                trackColor = trackPlayback.draw.trackLineOptions.color;
            }
            
            const speedPoints = [];
            const headingPoints = [];
    
            rawPoints.forEach(point => {
                // --- HEADING OPLOSSING ---
                // Vraag een tijd op die net *na* het originele punt ligt.
                // Dit forceert de plugin om de 'bearing' (koers 'y') altijd opnieuw te berekenen
                // en te retourneren, zelfs als het originele punt een 'dir: 0' veld heeft.
                const calculatedPoint = trackInstance._getCalculateTrackPointByTime(point.time + 0.001);
                
                if (!calculatedPoint) return;
    
                // De tijd die we opslaan is de *originele* tijd, niet de +0.001 versie.
                const originalTimeMs = point.time * 1000;
    
                if (calculatedPoint.speed !== undefined) {
                    const speedInKnots = calculatedPoint.speed * 1.94384;
                    speedPoints.push({ x: originalTimeMs, y: speedInKnots });
                    if (speedInKnots > maxSpeedInData) maxSpeedInData = speedInKnots;
                }
                
                if (calculatedPoint.dir !== undefined) {
                    // Nu bevat 'calculatedPoint.dir' de correct berekende bearing.
                    headingPoints.push({ x: originalTimeMs, y: calculatedPoint.dir });
                }
            });
    
            const commonDatasetOptions = {
                label: trackKey,
                borderColor: trackColor,
                tension: 0.1, fill: false, pointRadius: 0, borderWidth: 2
            };
    
            if (speedPoints.length > 0) speedDataSets.push({ ...commonDatasetOptions, data: speedPoints });
            if (headingPoints.length > 0) headingDataSets.push({ ...commonDatasetOptions, data: headingPoints });
        });
    
        preCalculatedChartData.speed = speedDataSets;
        preCalculatedChartData.heading = headingDataSets;
    }

    // De overige functies blijven ongewijzigd
    function getChartOptions(variable) {
        const yAxisOptions = {
            position: 'right',
            beginAtZero: false,
            title: { display: true, text: getChartYAxisLabel(variable) },
            ticks: {}
        };
    
        if (variable === 'heading') {
            yAxisOptions.min = 0;
            yAxisOptions.max = 360;
            yAxisOptions.ticks.callback = function(value) { return value.toFixed(0); };
        } else if (variable === 'speed') {
            yAxisOptions.min = 0;
            yAxisOptions.max = Math.ceil(maxSpeedInData);
            yAxisOptions.ticks.callback = function(value) { return value.toFixed(1); };
        }
    
        return {
            responsive: true, maintainAspectRatio: false, animation: false,
            scales: {
                x: {
                    type: 'time', time: { unit: 'second', tooltipFormat: 'HH:mm:ss' },
                    title: { display: false }, ticks: { display: false }, grid: { display: false },
                },
                y: yAxisOptions
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'x',
                    intersect: false,
                    
                    // --- 1. ACHTERGRONDKLEUR AANPASSEN ---
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Een lichte, semi-transparante achtergrond
                    borderColor: '#ccc', // Subtiele randkleur voor de tooltip
                    borderWidth: 1,
                    
                    // --- Tekstkleuren voor de nieuwe achtergrond ---
                    titleColor: 'rgb(255, 255, 255)', // Donkergrijze titel (de tijd)
                    bodyColor: 'rgb(255, 255, 255)',  // Donkergrijze body-tekst (de data)
                    
                    // --- Padding en opmaak ---
                    padding: 10,
                    cornerRadius: 6,
                    
                    callbacks: {
                        // --- 2. KLEURENLABEL VULLEN ---
                        labelColor: function(context) {
                            // Haal de originele kleur van de dataset
                            const color = context.dataset.borderColor;
                            
                            // Retourneer een object dat ZOWEL de rand als de achtergrond instelt
                            return {
                                borderColor: color,
                                backgroundColor: color // Zet de achtergrond op dezelfde kleur
                            };
                        },
                        
                        // De label callback blijft ongewijzigd, maar werkt nu samen met de nieuwe stijlen
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                let value = context.parsed.y;
                                if (currentChartVariable === 'speed') {
                                    label += value.toFixed(1) + ' kn';
                                } else if (currentChartVariable === 'heading') {
                                    label += value.toFixed(0) + '°';
                                } else {
                                    label += value;
                                }
                            }
                            return label;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        nowLine: {
                            type: 'line', scaleID: 'x', value: undefined, 
                            borderColor: 'red', borderWidth: 2,
                            label: {
                                display: true,
                                content: '',
                                position: 'start', // 'start' = bovenaan de lijn
                            
                                // --- Achtergrond en Rand ---
                                backgroundColor: 'rgba(240, 240, 240, 0.5)', // Een lichte, semi-transparante achtergrond
                                borderColor: 'rgba(0, 0, 0, 0.15)',      // GECORRIGEERD: De eigenschap heet 'borderColor'
                                borderWidth: 1,          // Voeg een dikte toe voor de rand
                                borderRadius: 40,         // Een subtielere afronding dan 40
                            
                                // --- Tekst en Lettertype ---
                                padding: {               // Gebruik een object voor meer controle over padding
                                    top: 3,
                                    bottom: 3,
                                    left: 6,
                                    right: 6
                                },
                                color: 'black',            // Rode tekstkleur (werkt nu goed op een lichte achtergrond)
                                font: {
                                    size: 13,
                                    weight: 'normal', // <-- Stel expliciet het gewicht in op 'normal'
                                    family: "'Courier New', Courier, monospace" // GECORRIGEERD: 'family' is een eigenschap binnen het font-object
                                },
                            
                                // --- Positionering ---
                                // Om het label RECHTS van de lijn te krijgen, hebben we een POSITIEVE xAdjust nodig.
                                xAdjust: -45,     // Verplaatst het label 40 pixels naar links
                                yAdjust: 2       // Geen verticale aanpassing, precies op de lijn
                            }
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest', axis: 'x', intersect: false
            }
        };
    }

    function setupDynamicChart(trackPlayback) {
        const ctx = document.getElementById('syncedChart').getContext('2d');
        if (!ctx) return;
        if (syncedLineChart) syncedLineChart.destroy();
    
        syncedLineChart = new Chart(ctx, {
            type: 'line',
            data: { datasets: preCalculatedChartData[currentChartVariable] },
            options: getChartOptions(currentChartVariable)
        });
    
        const pastWindowSeconds = 300;
        const futureWindowSeconds = 60;
    
        trackPlayback.on('tick', function(tickEvent) {
            // De 'isDraggingChart' check is niet meer nodig hier.
            
            if (!syncedLineChart) return;
            
            const currentTimeMs = tickEvent.time * 1000;
            
            const windowStartTimeMs = currentTimeMs - (pastWindowSeconds * 1000);
            const windowEndTimeMs = currentTimeMs + (futureWindowSeconds * 1000);
    
            const nowLineAnnotation = syncedLineChart.options.plugins.annotation.annotations.nowLine;
    
            syncedLineChart.options.scales.x.min = windowStartTimeMs;
            syncedLineChart.options.scales.x.max = windowEndTimeMs;
    
            nowLineAnnotation.value = currentTimeMs;
            nowLineAnnotation.label.content = formatMsToTime(currentTimeMs);
            
            syncedLineChart.update('none');
        });

            // --- NIEUW: Listener voor zichtbaarheid van tracks ---
        trackPlayback.on('trackvisibilitychanged', function(e) {
            if (!syncedLineChart) return;

            const trackKey = e.key;
            const isVisible = e.isVisible;

            // Zoek de datasets (zowel voor 'speed' als voor 'heading') die bij deze key horen
            const speedDataset = preCalculatedChartData.speed.find(d => d.label === trackKey);
            const headingDataset = preCalculatedChartData.heading.find(d => d.label === trackKey);

            // Update de 'hidden' eigenschap in onze vooraf berekende data
            if (speedDataset) {
                speedDataset.hidden = !isVisible;
            }
            if (headingDataset) {
                headingDataset.hidden = !isVisible;
            }

            // Forceer een update van de grafiek.
            // Omdat de huidige dataset (bijv. 'speed') nu een bijgewerkte 'hidden'
            // eigenschap heeft, zal Chart.js de lijn correct tonen of verbergen.
            syncedLineChart.update();
        });

    }

    function setupChartInteractivity(chart, trackPlayback) {
        const canvas = chart.canvas;
    
        let isDraggingChart = false;
        let startMouseX = 0;
        let startTimeSec = 0;
        
        // Schaalfactor: hoeveel seconden per gesleepte pixel?
        // Een lagere waarde betekent "gevoeliger" slepen.
        const secondsPerPixel = 0.2;
    
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            
            if (mouseX >= chart.chartArea.left && mouseX <= chart.chartArea.right) {
                e.preventDefault();
                isDraggingChart = true;
    
                // Sla de BEGIN-staat op
                startMouseX = e.clientX;
                startTimeSec = trackPlayback.getCurTime(); // De HUIDIGE tijd als startpunt
    
                canvas.style.cursor = 'ew-resize'; // Cursor voor horizontaal slepen
            }
        });
    
        window.addEventListener('mousemove', (e) => {
            if (isDraggingChart) {
                const currentMouseX = e.clientX;
                const deltaX = currentMouseX - startMouseX; // Verandering in pixels
    
                // Bereken de verandering in tijd
                const deltaTimeSec = deltaX * secondsPerPixel;
    
                // Nieuwe tijd = starttijd - verandering.
                // We doen 'min' omdat slepen naar rechts (positieve deltaX)
                // terugspoelen in de tijd moet zijn (negatieve deltaTime).
                // Echter, een positieve deltaX moet de tijd verhogen (vooruitspoelen).
                // Laten we de logica omdraaien voor intuïtiviteit:
                // Rechts slepen = vooruit in de tijd. Links = terug.
                // Nieuwe Tijd = Starttijd + (Verandering in muis * schaalfactor)
                let newTimeSec = startTimeSec - deltaTimeSec;
                
                // Zorg dat we niet buiten de grenzen van de playback gaan
                const minTime = trackPlayback.getStartTime();
                const maxTime = trackPlayback.getEndTime();
                if (newTimeSec < minTime) newTimeSec = minTime;
                if (newTimeSec > maxTime) newTimeSec = maxTime;
    
                // Stuur de playback aan
                trackPlayback.setCursor(newTimeSec);
            }
        });
    
        window.addEventListener('mouseup', () => {
            if (isDraggingChart) {
                isDraggingChart = false;
                canvas.style.cursor = 'default';
            }
        });
    }

    function updateChartVariable(variable) {
        if (!syncedLineChart) return;
        currentChartVariable = variable;
        
        // Wissel naar de andere vooraf berekende dataset
        syncedLineChart.data.datasets = preCalculatedChartData[variable];
        
        // Update de assen en andere opties met de juiste configuratie
        // We roepen .update() NIET aan op .options, we wijzen het direct toe.
        const newOptions = getChartOptions(variable);
        syncedLineChart.options.scales.y = newOptions.scales.y;
        syncedLineChart.options.plugins.tooltip = newOptions.plugins.tooltip;
    
        // Pas de wijzigingen toe
        syncedLineChart.update();
    }
    
    function getChartYAxisLabel(variable) {
        switch (variable) {
            case 'speed': return 'Speed (knots)';
            case 'heading': return 'Heading (°)';
            default: return 'Value';
        }
    }

    // VOEG DIT BLOK CODE TOE AAN HET EINDE VAN main-playback.js,
    // BINNEN DE document.addEventListener('DOMContentLoaded', ...)

    // --- Logica voor de aanpasbare grafiek-hoogte (Stabiele animatie versie) ---
    const chartArea = document.getElementById('chartArea');
    const resizeHandle = document.getElementById('resizeHandle');
    const toggleBtn = document.getElementById('toggleChartBtn');
    const chartCanvas = document.getElementById('syncedChart'); // Referentie naar het canvas

    let isResizing = false;
    let initialHeight = 0;
    let initialMouseY = 0;

    // Zorg ervoor dat de initiële hoogte in de CSS variabele staat
    chartArea.style.setProperty('--chart-height', `${chartArea.offsetHeight}px`);

    if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', (e) => {
            if (e.target === toggleBtn || toggleBtn.contains(e.target)) return;
            e.preventDefault();
            isResizing = true;
            initialHeight = chartArea.offsetHeight;
            initialMouseY = e.clientY;
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none';
            chartArea.style.transition = 'none';
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const deltaY = e.clientY - initialMouseY;
        let newHeight = initialHeight - deltaY;
        const maxHeight = window.innerHeight * 0.6;
        const minDragHeight = 130;
        if (newHeight > maxHeight) newHeight = maxHeight;
        if (newHeight < minDragHeight) newHeight = minDragHeight;
        chartArea.style.setProperty('--chart-height', `${newHeight}px`);
        if (map) map.invalidateSize();
        if (syncedLineChart) syncedLineChart.resize();
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            chartArea.style.transition = 'height 0.3s ease-in-out';
        }
    });

    if (toggleBtn && chartCanvas) {
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = chartArea.classList.contains('collapsed');

            if (isCollapsed) {
                // ---- UITKLAPPEN ----
                chartArea.classList.remove('collapsed');
                toggleBtn.style.transform = 'translateY(-50%) rotate(0deg)';
                
                // Maak het canvas weer zichtbaar NA de animatie
                setTimeout(() => {
                    chartCanvas.style.display = 'block';
                    if (map) map.invalidateSize();
                    if (syncedLineChart) syncedLineChart.resize();
                }, 300); // Moet overeenkomen met de CSS transitie duur
            } else {
                // ---- INKLAPPEN ----
                chartArea.classList.add('collapsed');
                toggleBtn.style.transform = 'translateY(-50%) rotate(180deg)';
                
                // Verberg het canvas ONMIDDELLIJK om het flikkeren te stoppen
                chartCanvas.style.display = 'none';

                // Update de kaartgrootte na de animatie
                setTimeout(() => {
                    if (map) map.invalidateSize();
                }, 300);
            }
        });
    }

    // Pas de positie van de inklapknop aan als de grafiek inklapt
    // Dit is een alternatief voor `display: none;`
    // We maken een knop buiten de chartArea om hem weer te tonen.
    // Voor nu houden we het simpel en gaan we ervan uit dat de knop met het paneel verdwijnt.
    // Als je hem wilt tonen, moet je hem een andere parent geven.
});