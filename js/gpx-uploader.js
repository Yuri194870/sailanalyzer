// js/gpx-uploader.js
document.addEventListener('DOMContentLoaded', () => {
    // --- BEGIN: SELECTORS VOOR NIEUWE ELEMENTEN ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('gpxFileUpload');
    const fileListSpan = document.getElementById('file-list');
    // --- EINDE: SELECTORS VOOR NIEUWE ELEMENTEN ---

    const nameInputsContainer = document.getElementById('athleteNameInputsContainer');
    const processBtn = document.getElementById('processGpxBtn');
    const statusDiv = document.getElementById('uploadStatus');
    let selectedFilesInfo = []; // Blijft de centrale opslag

    // Check of alle *noodzakelijke* elementen bestaan
    if (!dropZone || !fileInput || !processBtn || !nameInputsContainer || !statusDiv) {
        console.error("Een of meer UI elementen voor upload niet gevonden! Controleer IDs.");
        if(statusDiv) statusDiv.textContent = "Fout: Upload UI niet correct geladen.";
        return;
    }

    // --- BEGIN: DRAG & DROP LOGICA ---
    if (dropZone) {
        // Voorkom standaard browsergedrag voor drag events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Voeg een 'dragover' class toe voor visuele feedback
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        // Verwijder de 'dragover' class als de gebruiker weggaat
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        // Verwerk de bestanden die gedropt worden
        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            let dt = e.dataTransfer;
            let files = dt.files;
            
            // Creëer een nieuw FileList object zodat we het aan de input kunnen toewijzen
            // en de 'change' event kunnen triggeren.
            const dataTransfer = new DataTransfer();
            Array.from(files).forEach(file => dataTransfer.items.add(file));
            fileInput.files = dataTransfer.files;

            // Trigger handmatig het 'change' event op de file input.
            // Al je bestaande logica wordt nu hergebruikt!
            const changeEvent = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(changeEvent);
        }
    }
    // --- EINDE: DRAG & DROP LOGICA ---
    
    // Functie om de bestandslijst in de drop-zone te updaten
    function updateFileListDisplay() {
        if (!fileListSpan) return; // Alleen uitvoeren als het element bestaat

        if (selectedFilesInfo.length > 0) {
            fileListSpan.textContent = `${selectedFilesInfo.length} file(s) selected`;
        } else {
            // Maak de tekst leeg als er geen bestanden zijn geselecteerd
            fileListSpan.textContent = '';
        }
    }

    // Kleuren (blijft ongewijzigd)
    const kleuren = ['#efa3f0', '#4c53de', '#0c6636', '#b0a2a2', '#33f0c1', '#e03d3d', '#eb1253', '#998d8d', '#733535', '#0fc1f7', '#4fa5c9', '#288736', '#2feb51', '#7990b8', '#cd2be6', '#d1f0d1', '#28acb5', '#1ff07a', '#a5e075', '#e6b812', '#1ef7d3', '#d46f6f', '#d8de1d', '#88dae3', '#5ae067', '#43548f', '#ebbd17', '#c1c2e6', '#edbbf0', '#26d1ce', '#e02626', '#a36b6b', '#570909', '#76cf98', '#3d369e', '#5a2ee8', '#26ebe8', '#9850a3', '#e82121', '#2ee6cd', '#f0add1', '#de8ab7', '#eb4141', '#2016b3', '#eaf035'];
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    shuffleArray(kleuren);

    function renderSelectedFilesUI() {
        nameInputsContainer.innerHTML = '';
        if (selectedFilesInfo.length === 0) {
            statusDiv.textContent = 'Select one or more GPX files.';
            processBtn.disabled = true;
            updateFileListDisplay(); // Update de lijst in de dropzone
            return;
        }

        statusDiv.textContent = `${selectedFilesInfo.length} file(s) in selection. Review names and colors (click color to change):`; 
        selectedFilesInfo.forEach((fileInfo) => { 
            // ... (je bestaande render-logica voor de input-groepen blijft hier exact hetzelfde)
            const div = document.createElement('div');
            div.className = 'athlete-input-group';
            div.dataset.internalId = fileInfo.internalId;

            const colorPickerWrapper = document.createElement('div');
            colorPickerWrapper.className = 'color-picker-wrapper';

            const colorIndicatorLabel = document.createElement('label');
            colorIndicatorLabel.className = 'color-indicator';
            colorIndicatorLabel.htmlFor = `colorPickerForFile_${fileInfo.internalId}`;
            colorIndicatorLabel.style.backgroundColor = fileInfo.color;
            colorIndicatorLabel.title = "Click to change color"; 

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.id = `colorPickerForFile_${fileInfo.internalId}`;
            colorInput.className = 'color-input-styled';
            colorInput.value = fileInfo.color;
            colorInput.dataset.internalId = fileInfo.internalId;

            colorPickerWrapper.appendChild(colorIndicatorLabel);
            colorPickerWrapper.appendChild(colorInput);
            div.appendChild(colorPickerWrapper);

            colorInput.addEventListener('input', (e) => {
                const newColor = e.target.value;
                const idToUpdate = e.target.dataset.internalId;
                const infoObjectToUpdate = selectedFilesInfo.find(item => item.internalId === idToUpdate);
                if (infoObjectToUpdate) {
                    infoObjectToUpdate.color = newColor;
                }
                colorIndicatorLabel.style.backgroundColor = newColor;
            });

            const label = document.createElement('label');
            label.htmlFor = `athleteName_${fileInfo.internalId}`;
            label.textContent = `Name: `;
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.id = `athleteName_${fileInfo.internalId}`;
            nameInput.value = fileInfo.name;
            nameInput.dataset.internalId = fileInfo.internalId;
            nameInput.addEventListener('input', (e) => {
                const idToUpdate = e.target.dataset.internalId;
                const infoObjectToUpdate = selectedFilesInfo.find(item => item.internalId === idToUpdate);
                if (infoObjectToUpdate) {
                    infoObjectToUpdate.name = e.target.value.trim() || `Track ${selectedFilesInfo.findIndex(item => item.internalId === idToUpdate) + 1}`;
                }
            });

            const fileNameSpan = document.createElement('span');
            fileNameSpan.className = 'file-name-display';
            fileNameSpan.textContent = `(${fileInfo.file.name})`;

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.className = 'remove-track-btn';
            removeBtn.title = `Remove ${fileInfo.file.name}`;
            removeBtn.type = 'button';
            removeBtn.addEventListener('click', () => {
                selectedFilesInfo = selectedFilesInfo.filter(item => item.internalId !== fileInfo.internalId);
                renderSelectedFilesUI();
            });

            div.appendChild(label);
            div.appendChild(nameInput);
            div.appendChild(fileNameSpan);
            div.appendChild(removeBtn);
            nameInputsContainer.appendChild(div);
        });
        processBtn.disabled = false;
        updateFileListDisplay(); // Update de lijst in de dropzone
    }

    // AANGEPAST: De event listener voor 'change' is nu de centrale plek die alles afhandelt.
    fileInput.addEventListener('change', (event) => {
        // We gebruiken de bestanden direct van de input, of ze nu geklikt of gedropt zijn.
        const newFiles = Array.from(event.target.files);

        if (newFiles.length > 0) {
            newFiles.forEach(file => {
                if (!selectedFilesInfo.some(existing => existing.file.name === file.name && existing.file.size === file.size)) {
                    const cleanFileName = file.name.replace(/\.gpx$/i, '').replace(/[^a-zA-Z0-9 \-_]/g, ' ').trim();
                    const defaultName = cleanFileName || `Track ${selectedFilesInfo.length + 1}`;
                    const assignedColor = kleuren[selectedFilesInfo.length % kleuren.length];

                    selectedFilesInfo.push({
                        file: file,
                        name: defaultName,
                        color: assignedColor,
                        internalId: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                    });
                } else {
                    console.log(`File "${file.name}" has already been added.`);
                    if(statusDiv) statusDiv.textContent = `File "${file.name}" was already in the list.`;
                }
            });
            renderSelectedFilesUI();
        }
        event.target.value = null; // Belangrijk om 'change' opnieuw te triggeren
    });

    // De processBtn.addEventListener blijft volledig ongewijzigd.
    processBtn.addEventListener('click', async () => {
        if (selectedFilesInfo.length === 0) {
            statusDiv.textContent = 'No files selected to process.';
            return;
        }

        statusDiv.textContent = 'Processing files... Please wait.';
        processBtn.disabled = true;
        const allTracksData = [];

        for (let i = 0; i < selectedFilesInfo.length; i++) {
            const currentFileInfo = selectedFilesInfo[i];
            const file = currentFileInfo.file;
            const athleteName = currentFileInfo.name;
            const trackColor = currentFileInfo.color;

            // ... (rest van de file processing logica blijft hier exact hetzelfde)
            try {
                const gpxString = await readFileAsText(file);
                if (!gpxString) {
                    console.warn(`File ${file.name} is empty or could not be read.`);
                    continue;
                }
                const gpxDom = (new DOMParser()).parseFromString(gpxString, 'application/xml');
                const parseError = gpxDom.getElementsByTagName("parsererror");
                if (parseError.length > 0) {
                    console.error(`XML Parsefout in ${file.name}:`, parseError[0].textContent);
                    statusDiv.textContent = `Fout: ${file.name} is geen geldig XML/GPX.`;
                    continue;
                }
                if (typeof window.toGeoJSON === 'undefined' || typeof window.toGeoJSON.gpx !== 'function') {
                    console.error('toGeoJSON.gpx is niet beschikbaar!');
                    statusDiv.textContent = 'Fout: GPX conversie bibliotheek niet geladen.';
                    processBtn.disabled = false;
                    return;
                }
                const geoJsonData = window.toGeoJSON.gpx(gpxDom);
                const trackPoints = [];
                if (geoJsonData && geoJsonData.features && Array.isArray(geoJsonData.features)) {
                    geoJsonData.features.forEach(feature => {
                        if (feature.geometry && feature.geometry.type === 'LineString' && feature.geometry.coordinates && Array.isArray(feature.geometry.coordinates) && feature.properties && feature.properties.coordinateProperties && feature.properties.coordinateProperties.times && Array.isArray(feature.properties.coordinateProperties.times)) {
                            const coordinates = feature.geometry.coordinates;
                            const times = feature.properties.coordinateProperties.times;
                            if (coordinates.length === times.length && coordinates.length > 0) {
                                for (let j = 0; j < coordinates.length; j++) {
                                    const coord = coordinates[j];
                                    const timeStr = times[j];
                                    if (coord && typeof coord[1] === 'number' && typeof coord[0] === 'number') {
                                        trackPoints.push({
                                            "lat": coord[1],
                                            "lng": coord[0],
                                            "dir": 0,
                                            "time": timeStr ? Math.round(new Date(timeStr).getTime() / 1000) : 0,
                                            "info": [{"key": athleteName}, {"value": ""}, {"color": trackColor}]
                                        });
                                    }
                                }
                            } else if (coordinates.length !== times.length) {
                                console.warn(`Mismatch coördinaten/tijden in ${file.name} voor feature.`);
                            }
                        }
                    });
                }
                if (trackPoints.length > 0) {
                    allTracksData.push(trackPoints);
                } else {
                    console.warn(`Geen bruikbare punten geëxtraheerd uit ${file.name}.`);
                }
            } catch (error) {
                console.error(`Algemene fout bij verwerken van ${file.name}:`, error);
                statusDiv.textContent = `Fout bij verwerken van ${file.name}.`;
            }
        }

        if (allTracksData.length > 0) {
            statusDiv.textContent = `Processing complete. ${allTracksData.length} track(s) prepared. Saving and loading map...`;
            try {
                if (typeof db === 'undefined' || !db.tempSessionData) {
                    throw new Error("IndexedDB (db.tempSessionData) is not initialized.");
                }
                await db.tempSessionData.put({ key: 'gpxDataForMap', data: allTracksData });
                localStorage.setItem('pendingMapLoadType', 'gpx');
                setTimeout(() => {
                    window.location.href = 'map.html';
                }, 1500);
            } catch (e) {
                statusDiv.textContent = 'Error preparing data for map view. ' + e.message;
                console.error("Error saving to IndexedDB or other processing error:", e);
                processBtn.disabled = false;
            }
        } else {
            statusDiv.textContent = 'No valid tracks found in the selected files.';
            processBtn.disabled = false;
        }
        selectedFilesInfo = []; // Reset na verwerking
        renderSelectedFilesUI();
    });

    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }
});