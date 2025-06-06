// sesision-loader.js
document.addEventListener('DOMContentLoaded', () => {
    // Tab functionaliteit
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const targetTabId = button.getAttribute('data-tab');
            tabContents.forEach(content => {
                if (content.id === targetTabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // Functionaliteit voor .saz file upload
    const sazFileInput = document.getElementById('sazFileUpload');
    const processSazBtn = document.getElementById('processSazBtn');
    const loadSazStatus = document.getElementById('loadSazStatus');
    let selectedSazFile = null;

    if (sazFileInput && processSazBtn && loadSazStatus) {
        sazFileInput.addEventListener('change', (event) => {
            selectedSazFile = event.target.files[0];
            if (selectedSazFile) {
                loadSazStatus.textContent = `Selected file: ${selectedSazFile.name}`;
                processSazBtn.disabled = false;
            } else {
                loadSazStatus.textContent = 'No .saz file selected.';
                processSazBtn.disabled = true;
            }
        });

        processSazBtn.addEventListener('click', async () => {
            if (!selectedSazFile) {
                loadSazStatus.textContent = 'Please select a .saz file first.';
                return;
            }

            loadSazStatus.textContent = 'Processing session file... Please wait.';
            processSazBtn.disabled = true;

            const reader = new FileReader();
            reader.onload = async (e) => { // Maak de onload handler ook async
                try {
                    if (typeof pako === 'undefined') { throw new Error("Compression library (pako) not loaded."); }
                    if (typeof db === 'undefined' || !db.tempSessionData) { throw new Error("IndexedDB (db.tempSessionData) is not initialized."); }

                    const compressedData = new Uint8Array(e.target.result);
                    const jsonString = pako.ungzip(compressedData, { to: 'string' });
                    const sessionData = JSON.parse(jsonString);
                    
                    console.log("SAZ data decompressed and parsed:", sessionData);

                    // --- BEGIN HIGHLIGHT: Opslaan in IndexedDB met Dexie ---
                    // Gebruik een vaste sleutel 'sazData' voor geladen sessie data.
                    await db.tempSessionData.put({ key: 'sazDataForMap', data: sessionData });
                    localStorage.setItem('pendingMapLoadType', 'saz'); // Signaal voor map.html
                    // --- EINDE HIGHLIGHT ---
                    
                    // localStorage.setItem('sailAnalyzerLoadedSession', JSON.stringify(sessionData)); // VERWIJDER OF COMMENTAAR
                    // localStorage.removeItem('trackDataForPlayback'); // VERWIJDER OF COMMENTAAR

                    loadSazStatus.textContent = 'Session data processed. Loading map...';
                    setTimeout(() => {
                        window.location.href = 'map.html';
                    }, 1500);

                } catch (error) {
                    console.error("Error loading or processing .saz file:", error);
                    loadSazStatus.textContent = `Error: ${error.message}.`;
                    processSazBtn.disabled = false;
                }
            };
            reader.onerror = () => {
                loadSazStatus.textContent = 'Error reading the .saz file.';
                processSazBtn.disabled = false;
            };
            reader.readAsArrayBuffer(selectedSazFile);
        });
    } else {
        console.warn("SAZ file upload elements not found in the DOM.");
    }
});