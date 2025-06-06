// control.trackplayback_new_bar.js

!function(t,e)
{if("object"==typeof exports&&"object"==typeof module)module.exports=e(require("leaflet"));
else if("function"==typeof define&&define.amd)define(["leaflet"],e);
else{var i="object"==typeof exports?e(require("leaflet")):e(t.L);for(var n in i)("object"==typeof exports?exports:t)[n]=i[n]}}
(window,function(t){
	// Definieer de weergavemodi (voor tekst)
	const DISPLAY_MODE = {
	    FULL: 'full',
	    NAME_SPEED: 'name_speed',
	    NAME_ONLY: 'name_only',
	    NONE: 'none'
	};
	// --- BEGIN HIGHLIGHT ---
	// Speciale waarde voor volledige track historie (moet overeenkomen met die in trackplayback.js)
	const FULL_TRACK_HISTORY = null;
	// --- EINDE HIGHLIGHT ---



	return function(t){var e={};
	function i(n){
		if(e[n])return e[n].exports;
		var a=e[n]={i:n,l:!1,exports:{}};
		return t[n].call(a.exports,a,a.exports,i),a.l=!0,a.exports}
		return i.m=t,i.c=e,
		i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},
		i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),
		Object.defineProperty(t,"__esModule",{value:!0})},
		i.t=function(t,e){
			if(1&e&&(t=i(t)),8&e)return t;
			if(4&e&&"object"==typeof t&&t&&t.__esModule)
				return t;
			var n=Object.create(null);
			if(i.r(n),
			Object.defineProperty(n,"default",{enumerable:!0,value:t}),
			2&e&&"string"!=typeof t)
			for(var a in t)i.d(n,a,function(e){
				return t[e]}.bind(null,a));
				return n},
				i.n=function(t){
					var e=t&&t.__esModule?function(){
						return t.default}:function(){return t};
						return i.d(e,"a",e),e},
						i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},
						i.p="",i(i.s=2)}([function(e,i){e.exports=t},,
						function(t,e,i){"use strict";i.r(e);
						var n=i(0),a=i.n(n);

						function formatPlaybackDuration(seconds) {
							if (seconds === FULL_TRACK_HISTORY) { return 'Full'; }
							if (seconds === 0) { return 'Off'; }
							if (seconds === undefined || seconds === null || isNaN(seconds)){ return 'N/A'; }
							if (seconds < 60) { return `${parseInt(seconds)}s`; }
							const minutes = Math.floor(seconds / 60);
							const remainingSeconds = parseInt(seconds % 60);
							if (remainingSeconds === 0) { return `${minutes}m`; }
							return `${minutes}m ${remainingSeconds}s`;
						}



						// Definieer de Control class (o)
						const o=a.a.Control.extend({options: {
							position: "bottomleft", // We stylen dit om de hele breedte te pakken
							// showOptions, showInfo, showSlider zijn minder relevant met de nieuwe layout
							autoPlay: false,
							showSegmentAnalysisButton: true
						},
						initialize:function(t,e){
							a.a.Control.prototype.initialize.call(this,e),
							this.trackPlayBack=t,
							// this._currentTextDisplayMode = this.trackPlayBack.draw._textDisplayMode || DISPLAY_MODE.FULL;
							this._currentTrackDuration = this.trackPlayBack.draw._trackHistoryDuration === undefined ? FULL_TRACK_HISTORY : this.trackPlayBack.draw._trackHistoryDuration;
							this.trackPlayBack.on("tick",this._tickCallback,this);
							this._isSegmentSelectionActive = false; // State voor selectiemodus
						},
							onAdd:function(t){
								this._map = t;
								// --- BEGIN HIGHLIGHT ---
                                // Luister naar map clicks als segment selectie actief is
                                this._mapClickHandler = (e) => {
									console.log('Map clicked (raw):', e.latlng); // LOG 1
                                    if (this._isSegmentSelectionActive) {
										console.log('Segment selection active, handling click...'); // LOG 2
                                        this.trackPlayBack.handleMapClickForAnalysis(e);
                                    }
                                };
                                this._map.on('click', this._mapClickHandler);
								return this._initContainer(),this._container
							},
							onRemove:function(t){
								if (this.trackPlayBack) { this.trackPlayBack.stop(); this.trackPlayBack.off("tick",this._tickCallback,this); }
								if (this._container && this._container.parentNode) { this._container.parentNode.removeChild(this._container); }
								if (this._map && this._mapClickHandler) { this._map.off('click', this._mapClickHandler); }
                                
								// Cleanup listeners
								if(this._playBtn) a.a.DomEvent.off(this._playBtn, 'click', this._play, this);
								if(this._restartBtn) a.a.DomEvent.off(this._restartBtn, 'click', this._restart, this);
								if(this._slowSpeedBtn) a.a.DomEvent.off(this._slowSpeedBtn, 'click', this._slow, this);
								if(this._quickSpeedBtn) a.a.DomEvent.off(this._quickSpeedBtn, 'click', this._quick, this);
								if(this._slider) a.a.DomEvent.off(this._slider, 'change input', this._scrollchange, this);
								if(this._textDisplaySelect) a.a.DomEvent.off(this._textDisplaySelect, 'change', this._onTextDisplayChange, this);
								if(this._trackDurationSlider) a.a.DomEvent.off(this._trackDurationSlider, 'input', this._onTrackDurationChange, this);
								if(this._saveSessionBtn) a.a.DomEvent.off(this._saveSessionBtn, 'click', this._saveSession, this);

								// --- BEGIN HIGHLIGHT ---
								// Cleanup track filter checkbox listeners
								for (const key in this._trackFilterCheckboxes) {
									if (this._trackFilterCheckboxes[key]) {
										 a.a.DomEvent.off(this._trackFilterCheckboxes[key], 'change', this._onTrackVisibilityChange, this);
									}
								}
								this._trackFilterCheckboxes = {};
								// --- EINDE HIGHLIGHT ---
								this._map = null;
							},
							getTimeStrFromUnix:function(t,e="s"){
										t=parseInt(t*1000); // No need for 1e3 multiplication if t is already seconds
                                        if (isNaN(t) || t <= 0) return "..."; // Handle invalid time
                                        let n=new Date(t),a=n.getFullYear(),o=n.getMonth()+1<10?"0"+(n.getMonth()+1):n.getMonth()+1,r=n.getDate()<10?"0"+n.getDate():n.getDate(),s=n.getHours()<10?"0"+n.getHours():n.getHours(),c=n.getMinutes()<10?"0"+n.getMinutes():n.getMinutes(),l=n.getSeconds()<10?"0"+n.getSeconds():n.getSeconds();
                                        switch(e) {
                                            case 'd': return `${a}-${o}-${r}`;
                                            case 'h': return `${a}-${o}-${r} ${s}`;
                                            case 'm': return `${a}-${o}-${r} ${s}:${c}`;
                                            default:  return `${a}-${o}-${r} ${s}:${c}:${l}`;
                                        }
                            },
                            // // Helper to format duration seconds into readable string
                            // _formatDuration: function(seconds) {
                            //     if (seconds == FULL_TRACK_HISTORY) {
                            //         return 'Full';
                            //     }
                            //     if (seconds === 0) {
                            //         return 'Off';
                            //     }
                            //     if (seconds < 60) {
                            //         return `${seconds}s`;
                            //     }
                            //     const minutes = Math.floor(seconds / 60);
                            //     const remainingSeconds = seconds % 60;
                            //     if (remainingSeconds === 0) {
                            //         return `${minutes}m`;
                            //     }
                            //     return `${minutes}m ${remainingSeconds}s`;
                            // },

							_initContainer: function() {
								// Hoofdcontainer die de hele breedte zal innemen
								this._container = a.a.DomUtil.create("div", "leaflet-control-playback-bottombar"); // Gebruik deze klasse
								a.a.DomEvent.disableClickPropagation(this._container);
							
								// Gebruik Flexbox voor de horizontale layout van de items
								this._container.style.display = "flex";
								this._container.style.alignItems = "center"; // Verticaal centreren
								this._container.style.padding = "5px 10px"; // Wat padding
							
								// Sectie 1: Speed Controls
								const speedControlGroup = a.a.DomUtil.create("div", "playback-control-group playback-speed-controls", this._container);
								this._slowSpeedBtn = this._createButton(null, "Slower", "playback-button btn-slow", speedControlGroup, this._slow);
								this._infoSpeedRatio = this._createInfo("", "", "info-speed-ratio", speedControlGroup);
								this._updateSpeedInfo(); // Initieel zetten
								this._quickSpeedBtn = this._createButton(null, "Quicker", "playback-button btn-quick", speedControlGroup, this._quick);
							
								// Sectie 2: Current Time
								const timeDisplayGroup = a.a.DomUtil.create("div", "playback-control-group playback-time-display", this._container);
								this._infoCurTime = this._createInfo("Time: ", this.getTimeStrFromUnix(this.trackPlayBack.getCurTime()), "info-cur-time", timeDisplayGroup);
							
								// Sectie 3: Playback Action Buttons
								const actionButtonGroup = a.a.DomUtil.create("div", "playback-control-group playback-action-buttons", this._container);
								this._playBtn = this._createButton(null, "Play", "playback-button btn-stop", actionButtonGroup, this._play); // Let op: titel is "Play" voor btn-stop (play icon)
								this._restartBtn = this._createButton(null, "Restart", "playback-button btn-restart", actionButtonGroup, this._restart);
							
								// Sectie 4: Time Slider (neemt meeste resterende ruimte)
								const timeSliderGroup = a.a.DomUtil.create("div", "playback-control-group playback-time-slider-group", this._container);
								timeSliderGroup.style.flexGrow = "1"; // Laat deze groep groeien
								timeSliderGroup.style.margin = "0 10px"; // Wat ruimte eromheen
								this._slider = this._createSlider("time-slider playback-slider", timeSliderGroup, this._scrollchange);
							
								// Sectie 5: Track History Duration Slider
								const historySliderGroup = a.a.DomUtil.create("div", "playback-control-group playback-history-slider-group", this._container);
								// Label en slider setup (zoals voorheen, maar nu in historySliderGroup)
								const startTime = this.trackPlayBack.getStartTime(); const endTime = this.trackPlayBack.getEndTime();
								const totalDuration = (startTime && endTime && endTime > startTime) ? endTime - startTime : 0;
								const maxTrackDuration = Math.floor(totalDuration);
								a.a.DomUtil.create("label", "trackplayback-label", historySliderGroup).innerHTML = "Trackline:";
								this._infoTrackDuration = a.a.DomUtil.create("span", "playback-trackduration-info", historySliderGroup);
								this._infoTrackDuration.innerHTML = formatPlaybackDuration(this._currentTrackDuration); // Gebruik helper
								this._trackDurationSlider = a.a.DomUtil.create("input", "playback-trackduration-slider", historySliderGroup);
								this._trackDurationSlider.setAttribute("type","range"); this._trackDurationSlider.setAttribute("min", 0);
								this._trackDurationSlider.setAttribute("max", maxTrackDuration > 0 ? maxTrackDuration : 60); this._trackDurationSlider.setAttribute("step", 60);
								const initialSliderValue = this._currentTrackDuration === FULL_TRACK_HISTORY ? maxTrackDuration : this._currentTrackDuration;
								const clampedInitialValue = Math.max(0, Math.min(initialSliderValue, maxTrackDuration > 0 ? maxTrackDuration : 60));
								const steppedInitialValue = Math.round(clampedInitialValue / 60) * 60;
								this._trackDurationSlider.setAttribute("value", steppedInitialValue);
								a.a.DomEvent.on(this._trackDurationSlider, 'input', this._onTrackDurationChange, this);
							
								// --- BEGIN HIGHLIGHT: Segment Analysis Knop Toevoegen aan Bottom Bar ---
								if (this.options.showSegmentAnalysisButton) {
									const analysisButtonGroup = a.a.DomUtil.create("div", "playback-control-group playback-analysis-buttons", this._container);
									console.log("Parent for Analyze button (analysisButtonGroup):", analysisButtonGroup); // LOG
									this._segmentAnalysisBtn = this._createButton(
										"Analyze",                             // buttonTextOrHtml
										"Select Segment for Analysis",         // title
										"playback-button btn-segment-analysis",// className
										analysisButtonGroup,                   // parentContainer
										this._toggleSegmentSelectionMode       // callbackFn
									);
									// Geef het een iets andere look dan de afspeelknoppen, of houd het consistent
									// this._segmentAnalysisBtn.style.marginLeft = "10px"; // Optionele extra marge
								}
								const sessionControlGroup = a.a.DomUtil.create("div", "playback-control-group playback-session-controls", this._container);
								this._saveSessionBtn = this._createButton(
									null, // Geen tekst, icoon via CSS
									"Save Current Session", // Tooltip
									"playback-button btn-save-session", // CSS class (deze triggert het icoon)
									sessionControlGroup, // Parent
									this._saveSession // Callback functie
								);
								return this._container;
							},



							_createContainer:function(t,e){
												return a.a.DomUtil.create("div",t,e);
                            },
							_createButton: function (buttonContent, title, className, parentContainer, callbackFn) {
								// buttonContent kan een string zijn voor tekst, of null/leeg als het alleen een icoon is
								console.log("_createButton CALLED with content:", buttonContent, "Title:", title, "Parent container IS:", parentContainer);
							
								if (!parentContainer || typeof parentContainer.appendChild !== 'function') {
									console.error("_createButton: Invalid parentContainer!", parentContainer, "Button content:", buttonContent);
									return null;
								}
							
								const button = a.a.DomUtil.create("a", className, parentContainer);
								button.href = "#";
								button.title = title; // De title wordt altijd gezet (voor tooltip/accessibility)
								button.setAttribute("role", "button");
								button.setAttribute("aria-label", title); // Gebruik title ook voor aria-label
							
								// --- BEGIN HIGHLIGHT: Aangepaste logica voor innerHTML ---
								// Als buttonContent een niet-lege string is, gebruik het als innerHTML.
								// Anders (als het null, undefined of een lege string is), zetten we geen innerHTML,
								// ervan uitgaande dat het een icoon-knop is die zijn uiterlijk via CSS krijgt.
								if (typeof buttonContent === 'string' && buttonContent.trim() !== '') {
									button.innerHTML = buttonContent;
								}
								// De specifieke 'if (className.includes('btn-segment-analysis'))' is nu niet meer nodig
								// als je de "Analyze" tekst gewoon als eerste parameter meegeeft.
								// --- EINDE HIGHLIGHT ---
							
								a.a.DomEvent.disableClickPropagation(button);
								a.a.DomEvent.on(button, "click", a.a.DomEvent.preventDefault)
											.on(button, "click", callbackFn, this);
								return button;
							},
							// _createInfo moet mogelijk iets aangepast worden als het geen eigen div meer is
							_createInfo: function(labelText, initialValue, className, parent) {
								// Als we het direct in een flex-item willen zonder extra div:
								const span = a.a.DomUtil.create("span", className, parent);
								if (labelText) { // Optioneel label ervoor
									const labelSpan = a.a.DomUtil.create("span", "info-title", span);
									labelSpan.innerHTML = labelText;
								}
								const valueSpan = a.a.DomUtil.create("span", "info-value", span); // Aparte span voor de waarde
								valueSpan.innerHTML = initialValue;
								// Geef de valueSpan terug zodat die geüpdatet kan worden
								// of geef de hoofd 'span' terug als je de hele innerHTML wilt vervangen.
								// Voor _infoSpeedRatio en _infoCurTime moeten we de valueSpan hebben.
								return valueSpan; // OF span; hangt af hoe je update
							},
							_createSlider:function(t,e,i) // General slider creator (used for time slider)
							{let n=a.a.DomUtil.create("input",t,e);
							n.setAttribute("type","range");
                            // Set min/max only if start/end times are valid
                            const startTime = this.trackPlayBack.getStartTime();
                            const endTime = this.trackPlayBack.getEndTime();
                            if (startTime !== undefined && endTime !== undefined && endTime >= startTime) {
							    n.setAttribute("min",startTime);
							    n.setAttribute("max",endTime);
                            } else {
                                n.setAttribute("min", 0);
							    n.setAttribute("max", 0);
                            }
							n.setAttribute("value",this.trackPlayBack.getCurTime());
							a.a.DomEvent.on(n,"click mousedown dbclick",
							a.a.DomEvent.stopPropagation).on(n,"click",a.a.DomEvent.preventDefault).on(n,"change",i,this).on(n,"input",i,this);
                            return n;
                            },

					        // _createTextDisplaySelector: function(parent) {
					        //     let container = a.a.DomUtil.create('div', 'trackplayback-select-container playback-control-item', parent);
					        //     let label = a.a.DomUtil.create('label', 'trackplayback-label', container);
					        //     label.innerHTML = 'Athlete info: '; // Shortened label
					        //     label.setAttribute('for', 'trackplayback-text-display');

					        //     let select = a.a.DomUtil.create('select', 'trackplayback-select', container);
					        //     select.setAttribute('id', 'trackplayback-text-display');

					        //     const options = [
					        //         { value: DISPLAY_MODE.FULL, text: 'All' },
					        //         { value: DISPLAY_MODE.NAME_SPEED, text: 'Name & Speed' },
					        //         { value: DISPLAY_MODE.NAME_ONLY, text: 'Name' },
					        //         { value: DISPLAY_MODE.NONE, text: 'None' }
					        //     ];

					        //     options.forEach(optData => {
					        //         let option = a.a.DomUtil.create('option', '', select);
					        //         option.value = optData.value; option.innerHTML = optData.text;
							// 		if (optData.value === this._currentTextDisplayMode) { option.selected = true; }
							// 	});

							// 	a.a.DomEvent.on(select, 'change', this._onTextDisplayChange, this);
							// 	return select;
							// },

							// 	_onTextDisplayChange: function(e) { // Handler for Text Dropdown
							// 		const selectedMode = e.target.value;
							// 		this._currentTextDisplayMode = selectedMode;
							// 		this.trackPlayBack.draw.setTextDisplayMode(selectedMode);
							// 	},

								// --- BEGIN HIGHLIGHT ---
								_onTrackDurationChange: function(e) { // Handler voor History Slider
									const sliderValue = Number(e.target.value);
									const maxSliderValue = Number(this._trackDurationSlider.max);
									let durationToSet;
									// --- BEGIN HIGHLIGHT ---
									let displayText; // Variabele voor de te tonen tekst
	
									// Check if slider is at (or very near) max value, treat as "Full" history
									// Gebruik een kleine marge voor het geval de max-waarde niet exact bereikt wordt door de slider
									if (sliderValue >= maxSliderValue - (Number(this._trackDurationSlider.step) / 2)) {
										durationToSet = FULL_TRACK_HISTORY; // Gebruik null voor volledige historie
										displayText = formatPlaybackDuration(FULL_TRACK_HISTORY); // Gebruik de helper
									} else {
										// Zorg ervoor dat 0 ook echt 0 is
										durationToSet = sliderValue <= 0 ? 0 : sliderValue;
										displayText = formatPlaybackDuration(durationToSet); // Gebruik de helper
									}
	
									// Update interne state
									this._currentTrackDuration = durationToSet;
									// Update de tekstuele feedback
									this._infoTrackDuration.innerHTML = displayText;
									// --- EINDE HIGHLIGHT ---
	
									// Geef de waarde door aan de Draw instantie
									this.trackPlayBack.draw.setTrackHistoryDuration(durationToSet);
								},
								_toggleSegmentSelectionMode: function() {
									this._isSegmentSelectionActive = !this._isSegmentSelectionActive;
									if (this._isSegmentSelectionActive) {
										a.a.DomUtil.addClass(this._segmentAnalysisBtn, 'active'); // Visuele feedback
										this._segmentAnalysisBtn.title = "Cancel Segment Selection";
										this.trackPlayBack.fire('analysis:startselection'); // Event voor analysis module
										// Optioneel: verander map cursor
										if (this._map) a.a.DomUtil.addClass(this._map.getContainer(), 'leaflet-crosshair');
									} else {
										a.a.DomUtil.removeClass(this._segmentAnalysisBtn, 'active');
										this._segmentAnalysisBtn.title = "Select Segment";
										this.trackPlayBack.fire('analysis:stopselection'); // Event voor analysis module
										// Optioneel: reset map cursor
										 if (this._map) a.a.DomUtil.removeClass(this._map.getContainer(), 'leaflet-crosshair');
										this.trackPlayBack.clearSegmentHighlight(); // Wis eventuele highlights
									}
								},

								_play:function(){
									if (!this.trackPlayBack) return;
									if (a.a.DomUtil.hasClass(this._playBtn,"btn-stop")) {
										a.a.DomUtil.removeClass(this._playBtn,"btn-stop"); a.a.DomUtil.addClass(this._playBtn,"btn-start"); this._playBtn.title = "Stop";
										this.trackPlayBack.start();
									} else {
										a.a.DomUtil.removeClass(this._playBtn,"btn-start"); a.a.DomUtil.addClass(this._playBtn,"btn-stop"); this._playBtn.title = "Play";
										this.trackPlayBack.stop();
									}
								},
								_restart:function(){
									if (!this.trackPlayBack) return;
									a.a.DomUtil.removeClass(this._playBtn,"btn-stop"); a.a.DomUtil.addClass(this._playBtn,"btn-start"); this._playBtn.title = "Stop";
									this.trackPlayBack.rePlaying();
								},
								_updateSpeedInfo: function() {
									if (!this.trackPlayBack || !this._infoSpeedRatio) return;
									 // Als _createInfo de valueSpan teruggeeft:
									 this._infoSpeedRatio.innerHTML = `${this.trackPlayBack.getSpeed()}x`;
									 // Als _createInfo de hoofdspan teruggeeft en je de innerHTML vervangt:
									 // this._infoSpeedRatio.innerHTML = `Speed: ${this.trackPlayBack.getSpeed()}x`;
								},
								_slow:function(){
									if (!this.trackPlayBack) return;
									this.trackPlayBack.slowSpeed(); this._updateSpeedInfo();
								},
								_quick:function(){
									if (!this.trackPlayBack) return;
									this.trackPlayBack.quickSpeed(); this._updateSpeedInfo();
								},
								_scrollchange:function(t){ // Handler for Time Slider
									if (!this.trackPlayBack) return;
									let e=Number(t.target.value);
									this.trackPlayBack.setCursor(e);
									if (this._infoCurTime) this._infoCurTime.innerHTML=this.getTimeStrFromUnix(e);
								},
								_tickCallback:function(t){
									if (!this.trackPlayBack || !this._infoCurTime || !this._slider) return;
									let e=this.getTimeStrFromUnix(t.time);
									this._infoCurTime.innerHTML=e;
									this._slider.value=t.time;
									if(t.time>=this.trackPlayBack.getEndTime()){
                                         // Only update button if it was playing
                                         if (a.a.DomUtil.hasClass(this._playBtn, 'btn-start')) {
                                            a.a.DomUtil.removeClass(this._playBtn,"btn-start");
                                            a.a.DomUtil.addClass(this._playBtn,"btn-stop");
                                            this._playBtn.title = "Play";
                                         }
										 // No need to call stop() here, clock handles it in _tick
									}
								},
								// --- BEGIN HIGHLIGHT ---
								_saveSession: function() {
									console.log("Save Session button clicked");
									if (!this.trackPlayBack || !this._map) {
										console.error("TrackPlayBack instance or Map not available for saving.");
										alert("Error: Cannot save session, essential components are missing.");
										return;
									}

									// Data object initialiseren
									const sessionData = {
										version: "1.0.0", // Pas dit aan als je app evolueert
										savedAt: new Date().toISOString(),
										sessionName: `Sail Session ${new Date().toLocaleDateString()}`, // Simpele default
										mapState: {},
										playbackData: {},
										analysisData: {},
										geomanDrawings: []
									};

									// 1. Kaartstaat
									sessionData.mapState = {
										center: this._map.getCenter(), // {lat, lng}
										zoom: this._map.getZoom(),
										// Active Base Layer: Dit is wat lastiger direct op te halen zonder de Layers control
										// te inspecteren. Voor nu laten we dit leeg of hardcoden we de default.
										// Je kunt later de L.Control.Layers instantie opslaan en daar de actieve laag uitlezen.
										activeBaseLayer: "Road Map" // Placeholder
									};

									// 2. Playback Data
									let originalTracksDataToSave = null;
									// Probeer eerst uit de property die we in main-playback.js hebben gezet
									if (this.originalTrackDataForSave) { // 'this' is hier de TrackPlayBackControl instantie
										originalTracksDataToSave = this.originalTrackDataForSave;
									} else {
										// Fallback naar localStorage (minder ideaal, maar als back-up)
										try {
											const storedData = localStorage.getItem('trackDataForPlayback');
											if (storedData) {
												originalTracksDataToSave = JSON.parse(storedData);
											}
										} catch (e) {
											console.error("Error retrieving original track data from localStorage for saving:", e);
										}
									}

									// Als nog steeds geen data, probeer de verwerkte data als laatste redmiddel
									if (!originalTracksDataToSave) {
										if (this.trackPlayBack.tracks && this.trackPlayBack.tracks.length > 0) {
											originalTracksDataToSave = this.trackPlayBack.tracks.map(trackInstance => trackInstance._trackPoints);
											console.warn("Saving processed track points for originalTracks, not the raw uploaded data. Consider storing raw data more directly for saving.");
										} else {
											alert("Error: Original track data not found. Session cannot be saved fully.");
											return; // Stop als cruciale track data mist
										}
									}

									sessionData.playbackData = {
										originalTracks: originalTracksDataToSave, // Gebruik de opgehaalde data
										currentTime: this.trackPlayBack.getCurTime(),
										speed: this.trackPlayBack.getSpeed(),
										trackHistoryDuration: this.trackPlayBack.draw._trackHistoryDuration,
										trackVisibility: { ...this.trackPlayBack._trackVisibilityState },
										labelOptions: { ...this.trackPlayBack.getLabelDisplayOptions() }
									};

									// 3. Segment Analyse Data
									// We hebben toegang nodig tot de SegmentAnalysisHandler.
									// Deze is niet direct een property van TrackPlaybackControl.
									// OPLOSSING: De `main-playback.js` moet de `segmentAnalysisHandler`
									//           beschikbaar maken, of de TrackPlayBackControl moet een referentie krijgen.
									//           Voor nu, gaan we ervan uit dat we die referentie KUNNEN krijgen.
									//           Dit is een PLEK WAAR JE main-playback.js MOET AANPASSEN.
									// Stel dat `this.trackPlayBack.segmentAnalysisHandler` bestaat:
									if (this.trackPlayBack.segmentAnalysisHandler && this.trackPlayBack.segmentAnalysisHandler._selectedSegmentsForComparison) {
										sessionData.analysisData = {
											// Sla een kopie op, en zorg dat de start/eindtijd etc. erin zitten
											// voor het geval de highlightId alleen niet genoeg is voor reconstructie.
											selectedSegments: this.trackPlayBack.segmentAnalysisHandler._selectedSegmentsForComparison.map(segment => ({
												trackKey: segment.trackKey,
												startTime: segment.startTime,
												endTime: segment.endTime,
												highlightId: segment.highlightId,
												trackColorForHighlight: segment.trackColor, // Zorg dat trackColor wordt opgeslagen
												stats: { ...segment } // Kopieer alle berekende stats
											}))
										};
									} else {
										console.warn("SegmentAnalysisHandler of segment data niet gevonden. Analyse data wordt niet opgeslagen.");
										sessionData.analysisData.selectedSegments = [];
									}


									// 4. Leaflet-Geoman Tekeningen
									if (this._map.pm && typeof this._map.pm.getGeomanLayers === 'function') {
										const geomanLayers = this._map.pm.getGeomanLayers();
										sessionData.geomanDrawings = geomanLayers.map(layer => {
											const geoJson = layer.toGeoJSON();
											// Voeg Geoman-specifieke opties toe aan properties als ze bestaan
											if (layer.options && layer.options.pmIgnore === undefined) { // Controleer of het een 'echte' Geoman laag is
												geoJson.properties = geoJson.properties || {};
												// Kopieer relevante styling opties (Leaflet Path options)
												const styleOptions = {};
												['color', 'weight', 'opacity', 'fillColor', 'fillOpacity', 'radius', 'dashArray'].forEach(opt => {
													if (layer.options[opt] !== undefined) {
														styleOptions[opt] = layer.options[opt];
													}
												});
												geoJson.properties.style = styleOptions;
												// Specifieke Geoman opties indien nodig (bijv. voor tekstmarkers)
												if (layer.options.text) geoJson.properties.text = layer.options.text;
											}
											return geoJson;
										});
									}

									// Trigger download
									this._downloadJSON(sessionData, `sail-analyzer-session-${new Date().toISOString().slice(0,10).replace(/-/g,'')}.json`);
								},

								_downloadJSON: function(data, filename) {
									const jsonString = JSON.stringify(data); // Geen pretty print meer nodig voor compressie
									// --- BEGIN HIGHLIGHT: Compressie met pako ---
									try {
										const compressed = pako.gzip(jsonString, { to: 'string' }); // Comprimeer
										const blob = new Blob([compressed], { type: 'application/gzip' }); // Gebruik juiste MIME type
										const url = URL.createObjectURL(blob);
										const a = document.createElement('a');
										a.href = url;
										a.download = filename.replace('.json', '.saz'); // Pas extensie aan
										document.body.appendChild(a);
										a.click();
										document.body.removeChild(a);
										URL.revokeObjectURL(url);
										console.log("Compressed session data prepared for download.");
										alert("Session saved and download started!");
									} catch (err) {
										console.error("Compression failed:", err);
										alert("Error compressing session data. Saving uncompressed.");
										// Fallback naar ongecomprimeerd downloaden (je oude methode)
										const uncompressedBlob = new Blob([jsonString], { type: 'application/json' });
										const uncompressedUrl = URL.createObjectURL(uncompressedBlob);
										const uncompressedA = document.createElement('a');
										uncompressedA.href = uncompressedUrl;
										uncompressedA.download = filename;
										document.body.appendChild(uncompressedA);
										uncompressedA.click();
										document.body.removeChild(uncompressedA);
										URL.revokeObjectURL(uncompressedUrl);
									}
									// --- EINDE HIGHLIGHT ---
								}
								// --- EINDE HIGHLIGHT ---
						});
						// Exporteer de control
						a.a.TrackPlayBackControl=o,a.a.trackplaybackcontrol=function(t,e){return new o(t,e)};
					
						 // --- BEGIN HIGHLIGHT ---
                        // =========================================================================
                        // NIEUW: TrackFilterControl Class ( aparte, opvouwbare control)
                        // =========================================================================
                        const TrackFilterControl = a.a.Control.extend({
                            options: {
                                position: 'topright',
                                collapsed: true, // Standaard ingeklapt
                                title: 'Filter Tracks' // Titel voor de knop
                            },

                            initialize: function (trackPlaybackInstance, options) {
                                a.a.setOptions(this, options);
                                this.trackPlayback = trackPlaybackInstance;
                                this._checkboxes = {}; // Opslag voor cleanup
                            },

                            onAdd: function (map) {
                                this._map = map;
                                this._initLayout();
                                this._update(); // Vul met checkboxes
                                return this._container;
                            },

                            onRemove: function (map) {
                                // Verwijder listeners van container en knop
                                a.a.DomEvent.off(this._container, 'mouseenter', this._expand, this);
                                a.a.DomEvent.off(this._container, 'mouseleave', this._collapse, this);
                                // a.a.DomEvent.off(this._toggleButton, 'click', a.a.DomEvent.stop);
                                a.a.DomEvent.off(this._toggleButton, 'click', this._toggleCollapse, this); // Gebruik click voor toggle

                                // Verwijder listeners van checkboxes
                                for (const key in this._checkboxes) {
                                    if (this._checkboxes[key]) {
                                        a.a.DomEvent.off(this._checkboxes[key], 'change', this._onCheckboxChange, this);
                                    }
                                }
                                this._checkboxes = {};
                                this._container = null; // Verwijder referentie
                                this._listContainer = null;
                                this._toggleButton = null;
                                this._map = null;
                            },

                            _initLayout: function () {
                                const className = 'leaflet-control-trackfilter';
                                this._container = a.a.DomUtil.create('div', `${className} leaflet-bar`); // Gebruik leaflet-bar voor basisstijl

                                // Maak de toggle knop (link)
                                this._toggleButton = a.a.DomUtil.create('a', `${className}-toggle`, this._container);
                                this._toggleButton.href = '#';
                                this._toggleButton.title = this.options.title;
                                // Optioneel: voeg een icoon toe (vereist CSS)
                                // a.a.DomUtil.create('span', 'filter-icon', this._toggleButton);

                                // Maak de lijst container (initieel verborgen indien collapsed)
                                this._listContainer = a.a.DomUtil.create('div', `${className}-list`, this._container);

                                // Voeg event listeners toe voor uitklappen
                                // Voeg hover listeners toe aan de *hele* container
                                a.a.DomEvent.on(this._container, 'mouseenter', this._expand, this);
                                a.a.DomEvent.on(this._container, 'mouseleave', this._collapse, this);

                                // Voorkom dat klikken op de toggle knop de map event triggert (optioneel)
                                a.a.DomEvent.on(this._toggleButton, 'click', a.a.DomEvent.stop);
                                a.a.DomEvent.on(this._toggleButton, 'click', a.a.DomEvent.preventDefault); // Voorkom # navigatie

                                // Start ingeklapt indien nodig
                                if (this.options.collapsed) {
                                    this._collapse(); // Zorgt dat de class en verborgen knop initieel goed staan
                                } else {
                                     this._expand(); // Start uitgeklapt
                                }

                                // Voorkom dat events doordringen naar de kaart
                                a.a.DomEvent.disableClickPropagation(this._container);
                                a.a.DomEvent.disableScrollPropagation(this._listContainer); // Sta scrollen in lijst toe, maar niet op kaart
                            },

                            _update: function () {
                                if (!this.trackPlayback || !this._listContainer) { return; }

                                // Leeg de lijst
                                this._listContainer.innerHTML = '';
                                this._checkboxes = {}; // Reset opslag

                                // Haal keys en visibility state op
                                const trackKeys = this.trackPlayback.getTrackKeys();
                                const visibilityState = this.trackPlayback._trackVisibilityState;

                                if (trackKeys.length === 0) {
                                     this._listContainer.innerHTML = '<span>No tracks available</span>'; // Geef melding
                                     return;
                                }

                                // Maak een checkbox voor elke track
                                trackKeys.forEach(key => {
                                    const isVisible = visibilityState[key] !== false;
                                    this._createCheckboxItem(key, isVisible);
                                });
                            },

                            _createCheckboxItem: function (key, isChecked) {
                                const wrapper = a.a.DomUtil.create('div', 'trackfilter-item', this._listContainer);
                                const input = a.a.DomUtil.create('input', 'trackfilter-checkbox', wrapper);
                                const inputId = `trackfilter-input-${key.replace(/[^a-zA-Z0-9]/g, '')}-${a.a.Util.stamp(input)}`;

                                input.type = 'checkbox';
                                input.id = inputId;
                                input.checked = isChecked;
                                input.setAttribute('data-track-key', key);

                                const label = a.a.DomUtil.create('label', 'trackfilter-label', wrapper);
                                label.htmlFor = inputId;
                                label.appendChild(document.createTextNode(` ${key}`)); // Spatie voor label

                                a.a.DomEvent.on(input, 'change', this._onCheckboxChange, this);

                                this._checkboxes[key] = input; // Sla referentie op
                                return wrapper;
                            },

                            _onCheckboxChange: function (e) {
                                const input = e.target;
                                const key = input.getAttribute('data-track-key');
                                const isVisible = input.checked;

                                if (key && this.trackPlayback) {
                                    this.trackPlayback.setTrackVisibility(key, isVisible);
                                }
                            },

                            _expand: function () {
                                a.a.DomUtil.addClass(this._container, 'leaflet-control-trackfilter-expanded');
								a.a.DomUtil.addClass(this._toggleButton, 'leaflet-control-trackfilter-hidden');
                            },

                            _collapse: function () {
                                a.a.DomUtil.removeClass(this._container, 'leaflet-control-trackfilter-expanded');
								a.a.DomUtil.removeClass(this._toggleButton, 'leaflet-control-trackfilter-hidden');
                            },

                        });

                        // Factory functie voor de nieuwe control
                        a.a.trackFilterControl = function (trackPlaybackInstance, options) {
                            return new TrackFilterControl(trackPlaybackInstance, options);
                        };
                        // Exporteer ook de class zelf indien nodig voor types of subclassing
                        a.a.TrackFilterControl = TrackFilterControl;
                        // --- EINDE HIGHLIGHT ---

						// --- BEGIN HIGHLIGHT: NIEUWE LabelOptionsControl CLASS ---
						const LabelOptionsControl = a.a.Control.extend({
							options: {
								position: 'topright', // Of een andere hoek
								collapsed: true,
								title: 'Label Options', // Titel voor de hover/knop
								// Definieer de beschikbare label opties en hun standaard tekst
								labelOptions: [
									{ key: 'showName', text: 'Show Name' },
									{ key: 'showSpeed', text: 'Show Speed' },
									{ key: 'showBearing', text: 'Show Bearing' },
									// Voeg hier later meer toe:
									// { key: 'showHeartRate', text: 'Show Heart Rate' },
								]
							},

							initialize: function (trackPlaybackInstance, options) {
								a.a.setOptions(this, options);
								this.trackPlayback = trackPlaybackInstance;
								this._checkboxes = {}; // Voor cleanup
							},

							onAdd: function (map) {
								this._map = map;
								this._initLayout(); // Maak de container en toggle knop
								this._update();     // Vul met checkboxes
								return this._container;
							},

							onRemove: function (map) {
								a.a.DomEvent.off(this._container, 'mouseenter', this._expand, this);
								a.a.DomEvent.off(this._container, 'mouseleave', this._collapse, this);
								if (this._toggleButton) { // Check of knop bestaat
									a.a.DomEvent.off(this._toggleButton, 'click', a.a.DomEvent.stop);
								}

								for (const key in this._checkboxes) {
									if (this._checkboxes[key]) {
										a.a.DomEvent.off(this._checkboxes[key], 'change', this._onCheckboxChange, this);
									}
								}
								this._checkboxes = {}; this._container = null; this._listContainer = null; this._toggleButton = null; this._map = null;
							},

							_initLayout: function () {
								const className = 'leaflet-control-labeloptions'; // Unieke klasse
								this._container = a.a.DomUtil.create('div', `${className} leaflet-bar`);

								this._toggleButton = a.a.DomUtil.create('a', `${className}-toggle`, this._container);
								this._toggleButton.href = '#';
								this._toggleButton.title = this.options.title;
								// Tandwiel icoon via CSS of inline SVG
								// Voorbeeld inline SVG (kan ook als background-image in CSS)
								this._toggleButton.innerHTML = '<svg viewBox="0 0 24 24" style="width:18px; height:18px; vertical-align:middle;"><path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>';


								this._listContainer = a.a.DomUtil.create('div', `${className}-list`, this._container);

								if (this.options.collapsed) {
									a.a.DomEvent.on(this._container, 'mouseenter', this._expand, this);
									a.a.DomEvent.on(this._container, 'mouseleave', this._collapse, this);
									this._collapse(); // Start ingeklapt
								} else {
									this._expand();
								}

								a.a.DomEvent.disableClickPropagation(this._container);
								a.a.DomEvent.disableScrollPropagation(this._listContainer);
							},

							_update: function () { // Vult de lijst met checkboxes
								if (!this.trackPlayback || !this._listContainer) { return; }
								this._listContainer.innerHTML = '';
								this._checkboxes = {};

								const currentOptions = this.trackPlayback.getLabelDisplayOptions();

								this.options.labelOptions.forEach(opt => {
									const wrapper = a.a.DomUtil.create('div', 'labeloptions-item', this._listContainer);
									const input = a.a.DomUtil.create('input', 'labeloptions-checkbox', wrapper);
									const inputId = `labeloption-${opt.key}-${a.a.Util.stamp(input)}`;

									input.type = 'checkbox';
									input.id = inputId;
									input.checked = currentOptions[opt.key] === true; // Check huidige staat
									input.setAttribute('data-option-key', opt.key);

									const label = a.a.DomUtil.create('label', 'labeloptions-label', wrapper);
									label.htmlFor = inputId;
									label.appendChild(document.createTextNode(` ${opt.text}`));

									a.a.DomEvent.on(input, 'change', this._onCheckboxChange, this);
									this._checkboxes[opt.key] = input;
								});
							},

							_onCheckboxChange: function (e) {
								const input = e.target;
								const optionKey = input.getAttribute('data-option-key');
								const isVisible = input.checked;
								if (optionKey && this.trackPlayback) {
									this.trackPlayback.setLabelDisplayOption(optionKey, isVisible);
								}
							},

							_expand: function () {
								a.a.DomUtil.addClass(this._container, 'leaflet-control-labeloptions-expanded');
								a.a.DomUtil.addClass(this._toggleButton, 'leaflet-control-hidden'); // Verberg knop
							},

							_collapse: function () {
								a.a.DomUtil.removeClass(this._container, 'leaflet-control-labeloptions-expanded');
								a.a.DomUtil.removeClass(this._toggleButton, 'leaflet-control-hidden'); // Toon knop
							}
						});

				// --- BEGIN HIGHLIGHT: EXPORT NIEUWE LABEL OPTIONS CONTROL ---
					// Eerst de class zelf (LabelOptionsControl is de naam van je const)
					a.a.LabelOptionsControl = LabelOptionsControl; // Zorg dat 'LabelOptionsControl' de naam is van je class const

					// Dan de factory functie
					a.a.control.labelOptions = function (trackPlaybackInstance, options) {
						return new LabelOptionsControl(trackPlaybackInstance, options);
					};


					} // Einde van de webpack module functie
				]) // Einde van de webpack module array
	} // Einde van de UMD return functie
);
//# sourceMappingURL=control.trackplayback.js.map