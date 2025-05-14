// leaflet.segmentanalysis.js
(function (factory, window) {
    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);
    // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
    }
    // attach your plugin to the global 'L' variable
    if (typeof window !== 'undefined' && window.L) {
        window.L.SegmentAnalysisHandler = factory(L);
        window.L.segmentAnalysisHandler = function (trackPlayback, options) {
            return new L.SegmentAnalysisHandler(trackPlayback, options);
        };
    }
}(function (L) {

    const SegmentAnalysisHandler = L.Class.extend({
        includes: L.Mixin.Events,

        options: {
            maxSelectedSegments: 10, // Maximaal aantal segmenten om te vergelijken
            snapDistance: 2 // Maximale afstand (pixels) om te snappen naar een trackpoint
        },

        initialize: function (trackPlaybackInstance, mapInstance, options) { // mapInstance toegevoegd
            L.setOptions(this, options);
            this.trackPlayback = trackPlaybackInstance;
            this._map = mapInstance; // Gebruik de direct meegegeven map instantie
            this._active = false;
            this._selectionState = 'idle'; // 'idle', 'selecting_boot', 'selecting_start', 'selecting_end'
            this._currentSelection = {
                trackKey: null,
                startPoint: null,
                endPoint: null
            };
            this._selectedSegmentsForComparison = []; // Array om geselecteerde segmenten op te slaan
            this.displayControl = null;


            // Luister naar events van de TrackPlayBack instantie
            if (this.trackPlayback) {
                this.trackPlayback.on('analysis:startselection', this._onStartSelection, this);
                this.trackPlayback.on('analysis:stopselection', this._onStopSelection, this);
                this.trackPlayback.on('analysis:mapclick', this._onMapClick, this);
            }
        },

        setDisplayControl: function(control) {
            console.log("SegmentAnalysisHandler: setDisplayControl called with:", control); // LOG KOPPELING
            this.displayControl = control;
        },

        enable: function() {
            this._active = true;
            // Kan later gebruikt worden als de knop direct deze module aanroept
            console.log('Segment Analysis Enabled');
            this._resetSelectionProcess('selecting_boot');
        },

        disable: function() {
            this._active = false;
            this._resetSelectionProcess('idle');
            this.trackPlayback.clearSegmentHighlight();
            // Verberg het paneel via de display control
            if (this.displayControl) {
                this.displayControl.hide();
            }
            console.log('Segment Analysis Disabled');
            // Verwijder eventuele UI elementen specifiek voor analyse
        },

        _onStartSelection: function() {
            console.log("SegmentAnalysisHandler: _onStartSelection called."); // LOG A
            this.enable(); // Activeert interne state

            if (this.displayControl) {
                console.log("SegmentAnalysisHandler: displayControl exists, calling show()."); // LOG B
                this.displayControl.show();
                // De status wordt nu gezet door 'statusupdate' event vanuit _resetSelectionProcess,
                // dus this.displayControl.updateStatus hier is niet direct meer nodig als _reset... het doet.
                // Maar _resetSelectionProcess wordt aangeroepen in enable(), dus de timing is goed.
            } else {
                console.error("SegmentAnalysisHandler: displayControl is NULL in _onStartSelection!"); // LOG C
            }
            // _resetSelectionProcess wordt al in this.enable() aangeroepen
            // this._resetSelectionProcess('selecting_boot');
        },


        _onStopSelection: function() {
            this.disable();
        },

        _resetSelectionProcess: function(nextState = 'idle') {
            console.log("SegmentAnalysisHandler: _resetSelectionProcess called with state:", nextState);
            console.log("SegmentAnalysisHandler: _currentSelection BEFORE reset in _resetSelectionProcess:", JSON.parse(JSON.stringify(this._currentSelection)));
            this._currentSelection = { trackKey: null, startPoint: null, endPoint: null };
            this._selectionState = nextState;

            // --- BEGIN PROBLEEM EN OPLOSSING ---
            // HUIDIG PROBLEEM: Dit wist ALLE highlights, ook die van voltooide segmenten.
            // this.trackPlayback.clearSegmentHighlight();

            // OPLOSSING: Wis alleen als we NIET in een state zijn waar een segment net is toegevoegd
            // en we nu een *nieuwe* boot/startpunt gaan selecteren.
            // Als nextState 'selecting_boot' is, betekent dit dat we een frisse selectie starten.
            // In dit geval willen we eventuele *tijdelijke* highlights (van een incomplete vorige selectie) wissen,
            // maar niet de voltooide.
            // Dit is lastig zonder een duidelijke "tijdelijke highlight" ID.

            // Voorstel: _resetSelectionProcess wist GEEN highlights meer.
            // Het opruimen van highlights gebeurt:
            // 1. Expliciet bij `removeLastSegment` (voor die specifieke highlight).
            // 2. Expliciet bij `disable()` (om alle analyse-gerelateerde highlights op te ruimen).
            // 3. Eventueel een highlight voor een *enkel* startpunt (als je dat implementeert) moet een
            //    unieke ID hebben en apart gewist worden als je een eindpunt selecteert of de selectie afbreekt.

            // Verwijder deze regel voor nu om te zien of highlights blijven:
            // this.trackPlayback.clearSegmentHighlight();
            // Als je een highlight voor een enkel startpunt tekent, moet je die hier specifiek opruimen
            // als nextState 'selecting_boot' is en er een _currentSelection.startPoint bestond.
            // --- EINDE PROBLEEM EN OPLOSSING ---


            let message = '';
            if (nextState === 'selecting_boot') {
                message = 'Select a boat track to start segment analysis.';
             } else if (this._selectedSegmentsForComparison.length > 0 && nextState === 'idle'){
                 message = 'Analysis mode off. Previously selected segments are shown.';
             } else if (nextState === 'idle') {
                 message = ''; // Leeg bericht als analyse uit staat en geen segmenten
             }
             this.fire('statusupdate', { message: message });
             // --- EINDE HIGHLIGHT ---
        },

        _onMapClick: function (e) {
            if (!this._active) return;

            const clickedLatLng = e.latlng;

            if (this._selectionState === 'selecting_boot' || !this._currentSelection.trackKey) {
                // Vind de dichtstbijzijnde track/boot
                let closestTrackKey = null;
                let minDistance = Infinity;

                const trackKeys = this.trackPlayback.getTrackKeys();
                trackKeys.forEach(key => {
                    const track = this.trackPlayback.getTrackByKey(key);
                    if (track) {
                        // Check zichtbaarheid (optioneel, maar handig)
                        if (this.trackPlayback._trackVisibilityState && this.trackPlayback._trackVisibilityState[key] === false) {
                            return; // Sla onzichtbare tracks over
                        }
                        const nearestPointOnTrack = track.findNearestOriginPoint(clickedLatLng, this.options.snapDistance * this._map.getZoomScale(this._map.getMaxZoom(), this._map.getZoom())); // Pas snapDistance aan op zoom
                        if (nearestPointOnTrack) {
                            const dist = clickedLatLng.distanceTo(L.latLng(nearestPointOnTrack.lat, nearestPointOnTrack.lng));
                            if (dist < minDistance) {
                                minDistance = dist;
                                closestTrackKey = key;
                            }
                        }
                    }
                });

                if (closestTrackKey) {
                    this._currentSelection.trackKey = closestTrackKey;
                    this._selectionState = 'selecting_start';
                    console.log(`Selected boat: ${closestTrackKey}. Now select start point.`);
                    this.fire('statusupdate', { message: `Boat: ${closestTrackKey}. Select start point.`});
                    // Trigger een klik opnieuw voor het eerste punt, of wacht op volgende klik
                    this._handlePointSelection(clickedLatLng);
                } else {
                    console.log('No track found near click for boat selection.');
                    this.fire('statusupdate', { message: 'No boat track found. Click closer to a track.'});
                }

            } else if (this._selectionState === 'selecting_start') {
                this._handlePointSelection(clickedLatLng);
            } else if (this._selectionState === 'selecting_end') {
                this._handlePointSelection(clickedLatLng);
            }
        },

        _handlePointSelection: function(latlng) {
            const track = this.trackPlayback.getTrackByKey(this._currentSelection.trackKey);
            if (!track) {
                this._resetSelectionProcess('selecting_boot');
                return;
            }

            const selectedPoint = track.findNearestOriginPoint(latlng, this.options.snapDistance * this._map.getZoomScale(this._map.getMaxZoom(), this._map.getZoom()));

            if (!selectedPoint) {
                console.log('No track point found near click.');
                this.fire('statusupdate', { message: 'No point found. Click closer to the track.'});
                return;
            }

            if (this._selectionState === 'selecting_start') {
                this._currentSelection.startPoint = selectedPoint;
                this._selectionState = 'selecting_end';
                this.fire('statusupdate', { message: `Boat: ${this._currentSelection.trackKey}. Start: ${new Date(selectedPoint.time*1000).toLocaleTimeString()}. Select end point.`});
                // Optioneel: Highlight alleen het startpunt (misschien met een kleine cirkel of andere stijl)
                // Als je dit wilt, zorg dan dat de ID uniek is en niet conflicteert met de volledige segment highlight.
                // Voor nu laten we het even weg om het simpeler te houden, de focus ligt op de volledige segment highlight.
                // this.trackPlayback.highlightSegmentOnMap(this._currentSelection.trackKey, selectedPoint.time, selectedPoint.time, {color: '#00FF00', weight: 8, id: `startpt_${selectedPoint.time}`});
            } else if (this._selectionState === 'selecting_end') {
                if (selectedPoint.time <= this._currentSelection.startPoint.time) {
                    this.fire('statusupdate', { message: 'End point must be after start point. Select again.'});
                    return;
                }
                this._currentSelection.endPoint = selectedPoint;
                console.log(`End point selected for ${this._currentSelection.trackKey} at time ${selectedPoint.time}. Segment defined.`);
                // De status update en de highlight worden nu afgehandeld door _analyzeAndDisplaySegment

                this._analyzeAndDisplaySegment(); // Deze functie zorgt voor de analyse EN de correcte highlight

                // --- BEGIN HIGHLIGHT: VERWIJDER DEZE REGEL ---
                // this.trackPlayback.highlightSegmentOnMap(
                //     this._currentSelection.trackKey,
                //     this._currentSelection.startPoint.time,
                //     this._currentSelection.endPoint.time,
                //     {color: '#00FFFF', weight: 6, opacity: 0.8, id: `${this._currentSelection.trackKey}_${this._currentSelection.startPoint.time}_${this._currentSelection.endPoint.time}` }
                // );
                // --- EINDE HIGHLIGHT ---
            }
        },

        _analyzeAndDisplaySegment: function() {
            if (!this._currentSelection.trackKey || !this._currentSelection.startPoint || !this._currentSelection.endPoint) {
                return;
            }

            const track = this.trackPlayback.getTrackByKey(this._currentSelection.trackKey);
            if (!track) return;

            let trackColor = '#00FFFF'; // Default fallback highlight kleur (cyaan)
            const firstPointOfSegmentForColor = this._currentSelection.startPoint;
            // --- BEGIN LOGGING ---
            console.log("SegmentAnalysis: Attempting to get color from point:", firstPointOfSegmentForColor);
            // --- EINDE LOGGING ---
            if (firstPointOfSegmentForColor && firstPointOfSegmentForColor.info &&
                Array.isArray(firstPointOfSegmentForColor.info) && firstPointOfSegmentForColor.info.length > 2 && // Controleer lengte
                firstPointOfSegmentForColor.info[2] && typeof firstPointOfSegmentForColor.info[2].color === 'string') { // Controleer type
                trackColor = firstPointOfSegmentForColor.info[2].color;
                // --- BEGIN LOGGING ---
                console.log("SegmentAnalysis: Track color FOUND in point info:", trackColor);
                // --- EINDE LOGGING ---
            } else {
                 // --- BEGIN LOGGING ---
                console.warn("SegmentAnalysis: Track color NOT found in point info for key:", this._currentSelection.trackKey, "Using default:", trackColor, "Point info was:", firstPointOfSegmentForColor ? firstPointOfSegmentForColor.info : 'no point');
                 // --- EINDE LOGGING ---
            }

            const pointsInSegment = track.getPointsInTimeRange(
                this._currentSelection.startPoint.time,
                this._currentSelection.endPoint.time
            );

            if (pointsInSegment.length < 2) {
                this.fire('statusupdate', { message: 'Segment too short to analyze.' });
                return;
            }

            const startTime = this._currentSelection.startPoint.time;
            const endTime = this._currentSelection.endPoint.time;
            const durationTotal = endTime - startTime; // Totale duur van het geselecteerde segment

            // --- BEGIN HIGHLIGHT: Snelheden per sub-segment berekenen ---
            const segmentSpeedsMPS = []; // Array om snelheden (m/s) op te slaan voor elk klein interval
            const segmentBearings = []; // Array om koersen (0-360) op te slaan
            let totalDistance = 0;     // Herbereken totale afstand hier voor consistentie

            for (let i = 0; i < pointsInSegment.length - 1; i++) {
                const p1 = pointsInSegment[i];
                const p2 = pointsInSegment[i+1];

                const latLng1 = L.latLng(p1.lat, p1.lng);
                const latLng2 = L.latLng(p2.lat, p2.lng);
                const distBetweenPoints = latLng1.distanceTo(latLng2);
                totalDistance += distBetweenPoints;

                const timeDiffBetweenPoints = p2.time - p1.time;

                if (timeDiffBetweenPoints > 0) {
                    segmentSpeedsMPS.push(distBetweenPoints / timeDiffBetweenPoints);
                    // --- BEGIN HIGHLIGHT: Bereken en sla sub-segment koers op ---
                    let bearingSubSegment = L.GeometryUtil.bearing(latLng1, latLng2);
                    if (bearingSubSegment < 0) {
                        bearingSubSegment += 360;
                    }
                    segmentBearings.push(bearingSubSegment);
                    // --- EINDE HIGHLIGHT ---
                } else {
                    segmentSpeedsMPS.push(0);
                    // --- BEGIN HIGHLIGHT: Voeg een placeholder of vorige koers toe als tijd niet verandert ---
                    segmentBearings.push(segmentBearings.length > 0 ? segmentBearings[segmentBearings.length - 1] : 0); // Herhaal laatste of 0
                    // --- EINDE HIGHLIGHT ---
                }
            }
            // --- EINDE HIGHLIGHT ---

            // Gemiddelde snelheid over het HELE geselecteerde segment
            const avgSpeedMPS = durationTotal > 0 ? (totalDistance / durationTotal) : 0;
            const avgSpeedKnots = avgSpeedMPS * 1.94384;

            // AvgBearing (blijft hetzelfde)
            const startLatLng = L.latLng(pointsInSegment[0].lat, pointsInSegment[0].lng);
            const endLatLng = L.latLng(pointsInSegment[pointsInSegment.length - 1].lat, pointsInSegment[pointsInSegment.length - 1].lng);
            let avgBearing = L.GeometryUtil.bearing(startLatLng, endLatLng);
            if (avgBearing < 0) { avgBearing += 360; }


            // --- BEGIN HIGHLIGHT: Topsnelheid en StdDev gebaseerd op segmentSpeedsMPS ---

            // 1. Topsnelheid (5-seconden gemiddelde) gebaseerd op berekende segmentSpeedsMPS
            let topSpeed5sMPS = 0;
            // We hebben nu 'segmentSpeedsMPS.length' snelheden, wat 'pointsInSegment.length - 1' is.
            // Een 5s window vereist 5 snelheden, wat 6 punten en dus 5 intervallen betekent.
            if (segmentSpeedsMPS.length >= 5) { // Minimaal 5 snelheidsintervallen nodig
                for (let i = 0; i <= segmentSpeedsMPS.length - 5; i++) {
                    let sumSpeedWindow = 0;
                    for (let j = 0; j < 5; j++) {
                        sumSpeedWindow += segmentSpeedsMPS[i+j];
                    }
                    const avgSpeedWindow = sumSpeedWindow / 5;
                    if (avgSpeedWindow > topSpeed5sMPS) {
                        topSpeed5sMPS = avgSpeedWindow;
                    }
                }
            } else if (segmentSpeedsMPS.length > 0) {
                 // Fallback als er minder dan 5 snelheidsintervallen zijn: neem hoogste individuele berekende snelheid
                 segmentSpeedsMPS.forEach(speed => {
                     if (speed > topSpeed5sMPS) topSpeed5sMPS = speed;
                 });
            }
            const topSpeed5sKnots = topSpeed5sMPS * 1.94384;

            // 2. Standaarddeviatie van de Snelheid (in m/s) gebaseerd op berekende segmentSpeedsMPS
            let speedStdDevMPS = 0;
            if (segmentSpeedsMPS.length > 1) {
                let sumSquaredDiffs = 0;
                segmentSpeedsMPS.forEach(speed => { // Itereer over de berekende snelheden
                    sumSquaredDiffs += Math.pow(speed - avgSpeedMPS, 2); // Vergelijk met de overall avgSpeedMPS
                });
                speedStdDevMPS = Math.sqrt(sumSquaredDiffs / (segmentSpeedsMPS.length - 1));
            }
            const speedStdDevKnots = speedStdDevMPS * 1.94384;

            // --- BEGIN HIGHLIGHT: Standaarddeviatie van de Sub-segment Koersen ---
            let bearingStdDev = 0;
            if (segmentBearings.length > 1) {
                // Voor een correcte circulaire standaarddeviatie zijn complexere statistieken nodig.
                // Als workaround kunnen we de standaarddeviatie berekenen van de genormaliseerde hoeken,
                // maar dit kan onnauwkeurig zijn als de hoeken de 0/360 grens overschrijden.

                // Stap 1: Bereken het (simpele) gemiddelde van de genormaliseerde sub-segment koersen
                // Dit is NIET een correct circulair gemiddelde, maar nodig voor de simpele stddev.
                const sumBearings = segmentBearings.reduce((acc, b) => acc + b, 0);
                const meanSegmentBearing = sumBearings / segmentBearings.length;

                // Stap 2: Bereken de som van gekwadrateerde verschillen
                // Hier wordt het lastig: (5 - 355) is -350, gekwadrateerd groot. (5 - 355) is eigenlijk (5 - (-5)) = 10 graden verschil.
                // Laten we voor nu een simpele stddev doen, met de kanttekening dat het niet perfect circulair is.
                let sumSquaredBearingDiffs = 0;
                segmentBearings.forEach(b => {
                    // Bereken het kortste verschil (hoek) tussen b en meanSegmentBearing
                    let diff = b - meanSegmentBearing;
                    if (diff > 180) diff -= 360;
                    if (diff < -180) diff += 360;
                    sumSquaredBearingDiffs += Math.pow(diff, 2);
                });
                bearingStdDev = Math.sqrt(sumSquaredBearingDiffs / (segmentBearings.length - 1));
            }
            // --- EINDE HIGHLIGHT ---

            const analysisResult = {
                trackKey: this._currentSelection.trackKey,
                startTime: startTime,
                endTime: endTime,
                durationSeconds: durationTotal,
                distanceMeters: totalDistance,
                avgSpeedMPS: avgSpeedMPS,
                avgSpeedKnots: avgSpeedKnots,
                topSpeed5sKnots: topSpeed5sKnots,
                speedStdDevKnots: speedStdDevKnots,
                avgBearing: avgBearing,
                bearingStdDev: bearingStdDev, // Standaarddeviatie van de sub-segment koersen
                pointsCount: pointsInSegment.length,
                trackColor: trackColor, // Sla de kleur op
                highlightId: `${this._currentSelection.trackKey}_${this._currentSelection.startPoint.time}_${this._currentSelection.endPoint.time}`

            };

            console.log("Segment Analysis with trackColor:", analysisResult.trackColor, analysisResult);

            // --- BEGIN HIGHLIGHT ---
            // Voeg toe aan vergelijking en trigger update
            this._selectedSegmentsForComparison.push(analysisResult);
            // Optioneel: Beperk aantal segmenten
            if (this._selectedSegmentsForComparison.length > this.options.maxSelectedSegments) {
                 this._selectedSegmentsForComparison.shift(); // Verwijder oudste
            }
            this.fire('comparisonupdate', { segments: this._selectedSegmentsForComparison });

           // --- BEGIN HIGHLIGHT ---
            // Geef de opgehaalde trackColor en de gewenste opacity mee
            this.trackPlayback.highlightSegmentOnMap(
                this._currentSelection.trackKey,
                this._currentSelection.startPoint.time,
                this._currentSelection.endPoint.time,
                {
                    color: trackColor,      // Gebruik de trackColor variabele
                    weight: 8,
                    opacity: 0.3,           // Stel de gewenste opacity in
                    id: analysisResult.highlightId
                }
            );
            // --- EINDE HIGHLIGHT ---

            this._currentSelection = { trackKey: null, startPoint: null, endPoint: null };
            this._selectionState = 'idle_segment_selected';
            // --- BEGIN HIGHLIGHT ---
            this.fire('statusupdate', { message: `Segment added for ${analysisResult.trackKey}. Add another or finish.` });
            // --- EINDE HIGHLIGHT ---
        },

        prepareForNewSelection: function() {
            if (!this._active) {
                console.log("SegmentAnalysisHandler: prepareForNewSelection - Analysis not active, doing nothing.");
                return;
            }
            console.log("SegmentAnalysisHandler: prepareForNewSelection CALLED.");

            // --- BEGIN DEBUG LOGS ---
            console.log("SegmentAnalysisHandler: Current selection BEFORE reset in prepareForNewSelection:",
                        JSON.parse(JSON.stringify(this._currentSelection)));

            let idToClear = null;
            if (this._currentSelection.trackKey && this._currentSelection.startPoint && this._currentSelection.endPoint) {
                // Dit zou de ID zijn van een Zojuist VOLTOOID segment als _currentSelection nog niet gereset was.
                idToClear = `${this._currentSelection.trackKey}_${this._currentSelection.startPoint.time}_${this._currentSelection.endPoint.time}`;
                console.log("SegmentAnalysisHandler: prepareForNewSelection - Calculated idToClear (from potentially completed selection):", idToClear);
            } else if (this._currentSelection.trackKey && this._currentSelection.startPoint) {
                // Dit zou de ID zijn van een HALF-VOLTOOIDE selectie (alleen startpunt)
                idToClear = `${this._currentSelection.trackKey}_${this._currentSelection.startPoint.time}_temp`;
                console.log("SegmentAnalysisHandler: prepareForNewSelection - Calculated idToClear (from half selection):", idToClear);
            } else {
                console.log("SegmentAnalysisHandler: prepareForNewSelection - No current selection parts to form an ID to clear.");
            }

            this._resetSelectionProcess('selecting_boot'); // Deze roept intern clearSegmentHighlight() AAN ZONDER ARGUMENT, wat alles wist!
        },

        


        removeLastSegment: function() {
            if (this._selectedSegmentsForComparison.length > 0) {
                console.log("SegmentAnalysisHandler: removeLastSegment called");
                const removedSegment = this._selectedSegmentsForComparison.pop();
                if (removedSegment && removedSegment.highlightId) {
                    this.trackPlayback.clearSegmentHighlight(removedSegment.highlightId);
                }

                if (this._active && this._selectedSegmentsForComparison.length === 0) {
                    this._resetSelectionProcess('selecting_boot');
                } else if (this._active) {
                    this._currentSelection = { trackKey: null, startPoint: null, endPoint: null };
                    this._selectionState = 'selecting_boot';
                    this.fire('statusupdate', { message: 'Last segment removed. Select a boat track.' });
                }
                this.fire('comparisonupdate', { segments: this._selectedSegmentsForComparison });
            }
        }, // Vergeet de komma niet als er nog methodes volgen
        // --- EINDE CONTROLE ---

        // Functie om de huidige selectie te wissen (kan aangeroepen worden door een knop)
        clearCurrentSelection: function() {
            this._resetSelectionProcess(this._active ? 'selecting_boot' : 'idle');
        },

        // Functie om alle vergeleken segmenten te wissen
        clearComparison: function() {
            this._selectedSegmentsForComparison = [];
            this.fire('comparisonupdate', { segments: this._selectedSegmentsForComparison });
            this.clearCurrentSelection(); // Wis ook de lopende selectie
        }

    });

    return SegmentAnalysisHandler;

}, window));