// control.segmentanalysis.js
(function (factory, window) {
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
    }
    if (typeof window !== 'undefined' && window.L) {
        window.L.Control.SegmentAnalysisDisplay = factory(L);
        window.L.control.segmentAnalysisDisplay = function (analysisHandler, options) {
            return new L.Control.SegmentAnalysisDisplay(analysisHandler, options);
        };
    }
}(function (L) {

    const SegmentAnalysisDisplay = L.Control.extend({
        options: {
            position: 'topright', // Houd deze positie, CSS regelt de layout als paneel
            title: 'Segment Analysis' // Titel voor het paneel (optioneel)
        },

        initialize: function (analysisHandlerInstance, options) {
            L.setOptions(this, options);
            this.analysisHandler = analysisHandlerInstance;
            this._isVisible = false; // Track visibility state
        },

        onAdd: function (map) {
            this._map = map;
            this._container = L.DomUtil.create('div', 'leaflet-control-segmentanalysis-panel leaflet-control');
            this._container.style.display = 'none'; // Start verborgen
            this._isVisible = false; // Sync met style

            L.DomEvent.disableClickPropagation(this._container);
            L.DomEvent.disableScrollPropagation(this._container);

            const titleBar = L.DomUtil.create('div', 'segmentanalysis-panel-titlebar', this._container);
            titleBar.innerHTML = this.options.title;

            const contentContainer = L.DomUtil.create('div', 'segmentanalysis-panel-content', this._container);
            this._statusElement = L.DomUtil.create('div', 'segmentanalysis-status', contentContainer);
            this._resultsContainer = L.DomUtil.create('div', 'segmentanalysis-results', contentContainer);
            this._buttonContainer = L.DomUtil.create('div', 'segmentanalysis-buttons', contentContainer);

            if (this.analysisHandler) {
                this.analysisHandler.on('statusupdate', this._updateStatus, this);
                this.analysisHandler.on('comparisonupdate', this._updateComparisonResults, this);
            }
            this._updateStatus({message: ''});
            return this._container;
        },

        onRemove: function (map) {
            if (this.analysisHandler) {
                this.analysisHandler.off('statusupdate', this._updateStatus, this);
                this.analysisHandler.off('comparisonupdate', this._updateComparisonResults, this);
            }
            // Verwijder eventuele knop listeners
        },

        _updateStatus: function(data) {
            if (this._statusElement && data && data.message !== undefined) {
                this._statusElement.innerHTML = data.message;
            }
        },

        // --- CONTROLEER DEZE METHODES ZORGVULDIG ---
        show: function() {
            console.log("SegmentAnalysisDisplay: show() called. Current visibility:", this._isVisible, "Container:", this._container); // LOG D
            if (!this._isVisible && this._container) {
                this._container.style.display = 'flex'; // Gebruik 'flex' als je flexbox layout gebruikt, anders 'block'
                console.log("SegmentAnalysisDisplay: Container display set to:", this._container.style.display); // LOG E
                this._isVisible = true;
                 if (this._map) {
                    this._map.invalidateSize();
                 }
            } else if (this._isVisible) {
                console.log("SegmentAnalysisDisplay: show() called, but already visible."); // LOG F
            } else if (!this._container) {
                console.error("SegmentAnalysisDisplay: show() called, but _container is NULL!"); // LOG G
            }
        },

        hide: function() { // Moet direct op het prototype van SegmentAnalysisDisplay staan
            console.log("SegmentAnalysisDisplay: hide() method ENTERED. Current visibility:", this._isVisible, "Container:", this._container); // LOG CHECK HIDE
            if (this._isVisible && this._container) {
                this._container.style.display = 'none';
                this._isVisible = false;
                 if (this._map) {
                    this._map.invalidateSize();
                 }
            }
        },
        // --- EINDE CONTROLE ---


        _updateComparisonResults: function(data) {
            if (!this._resultsContainer || !this._buttonContainer || !data || !data.segments) return;

            // Wis oude resultaten en knoppen
            this._resultsContainer.innerHTML = '';
            this._buttonContainer.innerHTML = '';
            this._addAnotherButton = null;
            this._removeLastButton = null;

            if (data.segments.length === 0) {
                if (this.analysisHandler && this.analysisHandler._active) {
                     this._addAnotherButton = this._createButton(/* ... */);
                }
                return;
            }

            // Maak de tabel structuur
            const table = L.DomUtil.create('table', 'segmentanalysis-table', this._resultsContainer);
            const thead = L.DomUtil.create('thead', '', table);

            // --- BEGIN HIGHLIGHT: Aangepaste Header Opbouw ---
            // Rij 1 voor hoofd-metrics (sommige spannen meerdere kolommen)
            const headerRow1 = L.DomUtil.create('tr', '', thead);
            L.DomUtil.create('th', '', headerRow1).textContent = '#'; // rowspan=2
            L.DomUtil.create('th', '', headerRow1).textContent = 'Athlete'; // rowspan=2
            L.DomUtil.create('th', '', headerRow1).textContent = 'Duration'; // rowspan=2
            L.DomUtil.create('th', '', headerRow1).textContent = 'Distance'; // rowspan=2
            const speedHeader = L.DomUtil.create('th', '', headerRow1);
            speedHeader.textContent = 'Speed';
            speedHeader.colSpan = 3; // Speed heeft 3 sub-kolommen (Avg, StdDev, Top)
            speedHeader.style.textAlign = 'center'; // Centreer de hoofd-header

            const bearingHeader = L.DomUtil.create('th', '', headerRow1);
            bearingHeader.textContent = 'Bearing';
            bearingHeader.colSpan = 2; // Bearing heeft 2 sub-kolommen (Avg, StdDev)
            bearingHeader.style.textAlign = 'center'; // Centreer de hoofd-header

            // Rij 2 voor sub-metrics (onder Speed en Bearing)
            const headerRow2 = L.DomUtil.create('tr', '', thead);

            // Sub-headers voor Speed
            L.DomUtil.create('th', '', headerRow2).textContent = 'Avg';
            L.DomUtil.create('th', '', headerRow2).textContent = 'StdDev';
            L.DomUtil.create('th', '', headerRow2).textContent = 'Top (5s)';
            // Sub-headers voor Bearing
            L.DomUtil.create('th', '', headerRow2).textContent = 'Avg';
            L.DomUtil.create('th', '', headerRow2).textContent = 'StdDev';

            // Maak de eerste 4 headers in rij 1 span 2 rijen
            headerRow1.childNodes[0].rowSpan = 2; // #
            headerRow1.childNodes[1].rowSpan = 2; // Athlete
            headerRow1.childNodes[2].rowSpan = 2; // Duration
            headerRow1.childNodes[3].rowSpan = 2; // Distance
            // --- EINDE HIGHLIGHT ---

            const tbody = L.DomUtil.create('tbody', '', table);

            data.segments.forEach((segment, index) => {
                const row = L.DomUtil.create('tr', '', tbody);
                let cell;

                // Index
                cell = L.DomUtil.create('td', '', row); cell.textContent = index + 1;

                // Athlete
                cell = L.DomUtil.create('td', '', row);
                if (segment.trackColor) {
                    const colorSwatch = L.DomUtil.create('span', 'color-swatch', cell);
                    colorSwatch.style.backgroundColor = segment.trackColor;
                    cell.appendChild(document.createTextNode(' ' + segment.trackKey));
                } else {
                     cell.textContent = segment.trackKey;
                }
                // Kolom 3: Duration
                cell = L.DomUtil.create('td', '', row); cell.textContent = this.analysisHandler.trackPlayback.formatDuration(segment.durationSeconds);
                // Kolom 4: Distance
                cell = L.DomUtil.create('td', '', row); cell.textContent = `${segment.distanceMeters.toFixed(0)} m`;

                // Speed sub-kolommen
                // Kolom 5: Avg Speed
                cell = L.DomUtil.create('td', '', row); cell.textContent = `${segment.avgSpeedKnots.toFixed(1)} kts`;
                // Kolom 6: Speed StdDev
                cell = L.DomUtil.create('td', '', row); cell.textContent = segment.speedStdDevKnots !== undefined ? `${segment.speedStdDevKnots.toFixed(2)} kts` : 'N/A';
                // Kolom 7: Top Speed (5s)
                cell = L.DomUtil.create('td', '', row); cell.textContent = segment.topSpeed5sKnots !== undefined ? `${segment.topSpeed5sKnots.toFixed(1)} kts` : 'N/A';

                // Bearing sub-kolommen
                // Kolom 8: Avg Bearing
                cell = L.DomUtil.create('td', '', row); cell.textContent = `${segment.avgBearing.toFixed(0)}°`;
                // Kolom 9: Bearing StdDev
                cell = L.DomUtil.create('td', '', row); cell.textContent = segment.bearingStdDev !== undefined ? `${segment.bearingStdDev.toFixed(1)}°` : 'N/A';
            });

            // Knoppen toevoegen
            // Voeg knoppen toe onder de resultaten (in de _buttonContainer)
            if (this.analysisHandler) {
                // Knop "Add another"
                this._addAnotherButton = this._createButton(
                   'Add Another',
                   'Select another segment for comparison',
                   this._buttonContainer, // Voeg toe aan de knoppencontainer
                   this.analysisHandler.prepareForNewSelection,
                   this.analysisHandler
                );

                // Knop "Remove last" - alleen tonen als er segmenten zijn
                if (data.segments.length > 0) { // Deze check is hier redundant als we bovenaan al returnen, maar veilig
                   this._removeLastButton = this._createButton(
                       'Remove Last',
                       'Remove the last added segment from comparison',
                       this._buttonContainer, // Voeg toe aan de knoppencontainer
                       this.analysisHandler.removeLastSegment,
                       this.analysisHandler
                   );
                }
           }
        },

        _createButton: function (html, title, container, fn, context) {
            const link = L.DomUtil.create('a', 'leaflet-control-button', container);
            link.innerHTML = html;
            link.href = '#';
            link.title = title;
        
            // --- BEGIN HIGHLIGHT ---
            console.log(`_createButton: Creating button "${html}". Callback function (fn):`, fn, "Context:", context); // LOG DE FUNCTIE
            if (typeof fn !== 'function') {
                console.error(`_createButton: ERROR - Provided callback for button "${html}" is not a function! Value is:`, fn);
                return link; // Voorkom verdere errors
            }
            // --- EINDE HIGHLIGHT ---
        
            L.DomEvent.on(link, 'click', L.DomEvent.stopPropagation)
                      .on(link, 'click', L.DomEvent.preventDefault)
                      .on(link, 'click', fn.bind(context));
            return link;
        }
    });

    return SegmentAnalysisDisplay;

}, window));