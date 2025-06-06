// js/gpx-uploader.js
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('gpxFileUpload');
    const nameInputsContainer = document.getElementById('athleteNameInputsContainer');
    const processBtn = document.getElementById('processGpxBtn');
    const statusDiv = document.getElementById('uploadStatus');
    let selectedFilesInfo = []; // Blijft de centrale opslag

    if (!fileInput || !processBtn || !nameInputsContainer || !statusDiv) {
        console.error("Een of meer UI elementen voor upload niet gevonden! Controleer IDs.");
        if(statusDiv) statusDiv.textContent = "Fout: Upload UI niet correct geladen.";
        return;
    }

    // Kleuren (buiten de event listener zodat ze niet steeds opnieuw geshuffled worden bij 'change')
    const kleuren = ['#efa3f0', '#4c53de', '#0c6636', '#b0a2a2', '#33f0c1', '#e03d3d', '#eb1253', '#998d8d', '#733535', '#0fc1f7', '#4fa5c9', '#288736', '#2feb51', '#7990b8', '#cd2be6', '#d1f0d1', '#28acb5', '#1ff07a', '#a5e075', '#e6b812', '#1ef7d3', '#d46f6f', '#d8de1d', '#88dae3', '#5ae067', '#43548f', '#ebbd17', '#c1c2e6', '#edbbf0', '#26d1ce', '#e02626', '#a36b6b', '#570909', '#76cf98', '#3d369e', '#5a2ee8', '#26ebe8', '#9850a3', '#e82121', '#2ee6cd', '#f0add1', '#de8ab7', '#eb4141', '#2016b3', '#eaf035'];
    function shuffleArray(array) { // Fisher-Yates shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], kleuren[j]] = [kleuren[j], array[i]]; // Corrected shuffle
        }
    }
    shuffleArray(kleuren); // Shuffle één keer bij het laden van het script

    function renderSelectedFilesUI() {
        nameInputsContainer.innerHTML = '';
        if (selectedFilesInfo.length === 0) {
            // if (fileInputLabel) fileInputLabel.textContent = 'Select GPX files:';
            statusDiv.textContent = 'Select one or more GPX files.'; // Engels
            processBtn.disabled = true;
            if (fileInput) fileInput.value = "";
            return;
        }

        // if (fileInputLabel) fileInputLabel.textContent = 'Add more GPX files:';
        statusDiv.textContent = `${selectedFilesInfo.length} file(s) in selection. Review names and colors (click color to change):`; 
        selectedFilesInfo.forEach((fileInfo, index) => { // fileInfo = {file, name, color, internalId}
            const div = document.createElement('div');
            div.className = 'athlete-input-group';
            div.dataset.internalId = fileInfo.internalId;

            const colorPickerWrapper = document.createElement('div');
            colorPickerWrapper.className = 'color-picker-wrapper';

            const colorIndicatorLabel = document.createElement('label');
            colorIndicatorLabel.className = 'color-indicator';
            colorIndicatorLabel.htmlFor = `colorPickerForFile_${fileInfo.internalId}`;
            // --- BEGIN CORRECTIE ---
            colorIndicatorLabel.style.backgroundColor = fileInfo.color; // GEBRUIK fileInfo.color
            // --- EINDE CORRECTIE ---
            colorIndicatorLabel.title = "Click to change color"; 

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.id = `colorPickerForFile_${fileInfo.internalId}`;
            colorInput.className = 'color-input-styled';
            // --- BEGIN CORRECTIE ---
            colorInput.value = fileInfo.color; // GEBRUIK fileInfo.color
            // --- EINDE CORRECTIE ---
            colorInput.dataset.internalId = fileInfo.internalId;

            colorPickerWrapper.appendChild(colorIndicatorLabel);
            colorPickerWrapper.appendChild(colorInput);
            div.appendChild(colorPickerWrapper);

            colorInput.addEventListener('input', (e) => {
                const newColor = e.target.value;
                const idToUpdate = e.target.dataset.internalId;
                // Vind het juiste object in selectedFilesInfo om te updaten
                const infoObjectToUpdate = selectedFilesInfo.find(item => item.internalId === idToUpdate);
                if (infoObjectToUpdate) {
                    infoObjectToUpdate.color = newColor;
                }
                colorIndicatorLabel.style.backgroundColor = newColor;
            });

            // Naam input
            const label = document.createElement('label');
            label.htmlFor = `athleteName_${fileInfo.internalId}`;
            label.textContent = `Name: `;
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.id = `athleteName_${fileInfo.internalId}`;
            nameInput.value = fileInfo.name; // Gebruik fileInfo.name
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
            fileNameSpan.textContent = `(${fileInfo.file.name})`; // Gebruik fileInfo.file.name

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.className = 'remove-track-btn';
            removeBtn.title = `Remove ${fileInfo.file.name}`; // Gebruik fileInfo.file.name
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
    }

    fileInput.addEventListener('change', (event) => {
        const newFiles = Array.from(event.target.files);

        if (newFiles.length > 0) {
            newFiles.forEach(file => {
                // Voorkom duplicaten op basis van naam en grootte (simpele check)
                if (!selectedFilesInfo.some(existing => existing.file.name === file.name && existing.file.size === file.size)) {
                    const cleanFileName = file.name.replace(/\.gpx$/i, '').replace(/[^a-zA-Z0-9 \-_]/g, ' ').trim();
                    const defaultName = cleanFileName || `Track ${selectedFilesInfo.length + 1}`;
                    // Wijs een kleur toe uit de geschudde lijst, rouleer door de lijst
                    const assignedColor = kleuren[selectedFilesInfo.length % kleuren.length];

                    selectedFilesInfo.push({
                        file: file,
                        name: defaultName,
                        color: assignedColor,
                        internalId: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Unieke ID
                    });
                } else {
                    console.log(`File "${file.name}" has already been added.`);
                    if(statusDiv) statusDiv.textContent = `File "${file.name}" was already in the list.`;
                }
            });
            renderSelectedFilesUI(); // Update de UI met alle geselecteerde bestanden
        }
        // Reset de file input zodat dezelfde bestanden opnieuw geselecteerd kunnen worden na verwijdering
        // en zodat het 'change' event opnieuw triggert als de gebruiker dezelfde set opnieuw kiest.
        event.target.value = null;
    });
    processBtn.addEventListener('click', async () => {
        // --- BEGIN HIGHLIGHT: Gebruik selectedFilesInfo ---
        if (selectedFilesInfo.length === 0) {
        // --- EINDE HIGHLIGHT ---
            statusDiv.textContent = 'No files selected to process.';
            return;
        }

        statusDiv.textContent = 'Processing files... Please wait.'; // Engels
        processBtn.disabled = true;
        const allTracksData = [];
        // athleteNames wordt nu direct uit selectedFilesInfo gehaald

        let filesProcessedSuccessfully = 0; // Verplaatst, kleur wordt per bestand uit selectedFilesInfo gehaald

        // --- BEGIN HIGHLIGHT: Itereer over selectedFilesInfo ---
        for (let i = 0; i < selectedFilesInfo.length; i++) {
            const currentFileInfo = selectedFilesInfo[i];
            const file = currentFileInfo.file;
            const athleteName = currentFileInfo.name; // Gebruik de (mogelijk aangepaste) naam
            const trackColor = currentFileInfo.color; // Gebruik de (mogelijk aangepaste) kleur
        // --- EINDE HIGHLIGHT ---

            try {
                const gpxString = await readFileAsText(file);
                if (!gpxString) {
                    console.warn(`File ${file.name} is empty or could not be read.`);
                    continue;
                }

                const gpxDom = (new DOMParser()).parseFromString(gpxString, 'application/xml'); // Gebruik application/xml
                // Controleer op parsefouten van DOMParser
                const parseError = gpxDom.getElementsByTagName("parsererror");
                if (parseError.length > 0) {
                    console.error(`XML Parsefout in ${file.name}:`, parseError[0].textContent);
                    statusDiv.textContent = `Fout: ${file.name} is geen geldig XML/GPX.`;
                    continue; // Ga naar het volgende bestand
                }

                if (typeof window.toGeoJSON === 'undefined' || typeof window.toGeoJSON.gpx !== 'function') {
                    console.error('toGeoJSON.gpx is niet beschikbaar! Zorg dat de bibliotheek correct geladen is via de <script> tag.');
                    statusDiv.textContent = 'Fout: GPX conversie bibliotheek niet geladen.';
                    processBtn.disabled = false; // Sta nieuwe poging toe
                    return; // Stop verdere verwerking
                }
                const geoJsonData = window.toGeoJSON.gpx(gpxDom);

                const trackPoints = [];
                if (geoJsonData && geoJsonData.features && Array.isArray(geoJsonData.features)) {
                    geoJsonData.features.forEach(feature => {
                        if (feature.geometry && feature.geometry.type === 'LineString' &&
                            feature.geometry.coordinates && Array.isArray(feature.geometry.coordinates) &&
                            feature.properties && feature.properties.coordinateProperties &&
                            feature.properties.coordinateProperties.times && Array.isArray(feature.properties.coordinateProperties.times)) {

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
                        // Voeg hier eventueel nog de MultiLineString logica toe als je GPX bestanden die kunnen bevatten
                    });
                }

                if (trackPoints.length > 0) {
                    allTracksData.push(trackPoints);
                    filesProcessedSuccessfully++;
                } else {
                    console.warn(`Geen bruikbare punten geëxtraheerd uit ${file.name}.`);
                }

            } catch (error) {
                console.error(`Algemene fout bij verwerken van ${file.name}:`, error);
                statusDiv.textContent = `Fout bij verwerken van ${file.name}.`;
                // Ga door met het volgende bestand, tenzij het een kritieke fout is
            }
        } // Einde for loop

        if (allTracksData.length > 0) {
            statusDiv.textContent = `Processing complete. ${allTracksData.length} track(s) prepared. Saving and loading map...`;
            try {
                // --- BEGIN HIGHLIGHT: Opslaan in IndexedDB met Dexie ---
                if (typeof db === 'undefined' || !db.tempSessionData) {
                    throw new Error("IndexedDB (db.tempSessionData) is not initialized.");
                }
                // We gebruiken een vaste sleutel 'gpxData' om de data voor een nieuwe GPX sessie op te slaan.
                // 'put' zal een bestaand item met dezelfde sleutel overschrijven.
                await db.tempSessionData.put({ key: 'gpxDataForMap', data: allTracksData });
                localStorage.setItem('pendingMapLoadType', 'gpx'); // Signaal voor map.html
                // --- EINDE HIGHLIGHT ---

                // localStorage.setItem('trackDataForPlayback', JSON.stringify(allTracksData)); // VERWIJDER OF COMMENTAAR DEZE REGEL

                setTimeout(() => {
                    window.location.href = 'map.html';
                }, 1500); // Kortere delay kan nu, IndexedDB is asynchroon maar 'await' wacht.
            } catch (e) {
                statusDiv.textContent = 'Error preparing data for map view. ' + e.message;
                console.error("Error saving to IndexedDB or other processing error:", e);
                processBtn.disabled = false;
            }
        } else {
            statusDiv.textContent = 'No valid tracks found in the selected files.';
            processBtn.disabled = false;
        }
        fileInput.value = "";
        selectedFilesInfo = [];
        renderSelectedFilesUI(); // UI resetten
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