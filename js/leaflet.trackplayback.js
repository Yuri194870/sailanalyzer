
!function(t,i){
if("object"==typeof exports&&"object"==typeof module)module.exports=i(require("leaflet"));
else if("function"==typeof define&&define.amd)define(["leaflet"],i);
else{var e="object"==typeof exports?i(require("leaflet")):i(t.L);
for(var s in e)("object"==typeof exports?exports:t)[s]=e[s]}
}
(window,function(t){
		
	// NIEUW: Definieer de weergavemodi
	const DISPLAY_MODE = {
	    FULL: 'full', // Naam, Koers, Snelheid
	    NAME_SPEED: 'name_speed', // Naam, Snelheid
	    NAME_ONLY: 'name_only', // Alleen Naam
	    NONE: 'none' // Geen tekst
	};

	// Speciale waarde voor volledige track historie
	const FULL_TRACK_HISTORY = null;

	// Helper functie (kan hier globaal binnen de module of als static method)
	function formatPlaybackDuration(seconds) { // Hernoemd om conflicten te voorkomen
    if (seconds === FULL_TRACK_HISTORY) {
        return 'Full';
    }
    if (seconds === 0) {
        return 'Off';
    }
    if (seconds === undefined || seconds === null || isNaN(seconds)){
        return 'N/A';
    }
    if (seconds < 60) {
        return `${parseInt(seconds)}s`; // parseInt om eventuele decimalen af te kappen
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = parseInt(seconds % 60);
    if (remainingSeconds === 0) {
        return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
	}

	return function(t){
	var i={};
	function e(s){
		if(i[s])return i[s].exports;var n=i[s]={i:s,l:!1,exports:{}};return t[s].call(n.exports,n,n.exports,e),n.l=!0,n.exports
	}
			return e.m=t,e.c=i,
			e.d=function(t,i,s){
				e.o(t,i)||Object.defineProperty(t,i,{enumerable:!0,get:s})
			},
			e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})
			},
			e.t=function(t,i){
				if(1&i&&(t=e(t)),8&i)return t;if(4&i&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(e.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&i&&"string"!=typeof t)for(var n in t)e.d(s,n,function(i){return t[i]}.bind(null,n));return s
			},
				e.n=function(t){
					var i=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(i,"a",i),i
				},
				e.o=function(t,i){
					return Object.prototype.hasOwnProperty.call(t,i)
				},
				e.p="",e(e.s=1)
	}
	([function(i,e){i.exports=t},
		function(t,i,e){
			"use strict";
			e.r(i);									
			var s=e(0),
			n=e.n(s);function r(t){
				return Array.isArray?Array.isArray(t):"[object Array]"===Object.prototype.toString.call(t)
			}
			const a=n.a.Class.extend({initialize:function(t=[],i){
				n.a.setOptions(this,i),
				t.forEach(t=>{t.isOrigin=!0}),
				this._trackPoints=t,this._timeTick={},
				this._update()
			},
			addTrackPoint:function(t){
                				
				if(r(t))
					for(let i=0,e=t.length;i<e;i++)this.addTrackPoint(t[i]);
					this._addTrackPoint(t)
			},
			getTimes:function(){
				let t=[];
				for(let i=0,e=this._trackPoints.length;i<e;i++)
				
				
				t.push(this._trackPoints[i].time);return t
			},
			getStartTrackPoint:function(){									
					return this._trackPoints[0]
			},
			getEndTrackPoint:function(){
					return this._trackPoints[this._trackPoints.length-1]
			},
			getTrackPointByTime:function(t){
				return this._trackPoints[this._timeTick[t]]
			},
			getKey: function() {
				if (this._trackPoints && this._trackPoints.length > 0 && this._trackPoints[0].info && this._trackPoints[0].info[0] && this._trackPoints[0].info[0].key) {
					return this._trackPoints[0].info[0].key;
				}
				// Fallback: gebruik een index of unieke ID als geen key beschikbaar is
				// Voor nu geven we null terug als de key niet gevonden kan worden.
				console.warn("Track key not found for a track.");
				return null;
			},
			_getCalculateTrackPointByTime:function(t){
					let i=this.getTrackPointByTime(t),
					e=this.getStartTrackPoint(),
					s=this.getEndTrackPoint(),
					r=this.getTimes();
					if(t<e.time||t>s.time)return;
					let a,o=0,h=r.length-1;
					if(o===h)return i;
					for(;h-o!=1;)t>r[a=parseInt((o+h)/2)]?o=a:h=a;
					let c=r[o],l=r[h],
					_=t,
					u=this.getTrackPointByTime(c),
					p=this.getTrackPointByTime(l);
					// Snelheidsberekening toevoegen
					const timeDiff = l - c;
					let speed = 0;
					if (timeDiff > 0) {
						const point1 = n.a.latLng(u.lat, u.lng);
						const point2 = n.a.latLng(p.lat, p.lng);
						const distance = point1.distanceTo(point2); // in meters
						speed = distance / timeDiff; // m/s
					}
					e=n.a.point(u.lng,u.lat),
					s=n.a.point(p.lng,p.lat);
					let f=e.distanceTo(s);
					if(f<=0)return i=p;
					let d=f/(l-c),k=(s.y-e.y)/f,T=(s.x-e.x)/f,m=d*(_-c),
					g=e.x+m*T,x=e.y+m*k,y=s.x>=e.x?180*(.5*Math.PI-Math.asin(k))/Math.PI:180*(1.5*Math.PI+Math.asin(k))/Math.PI;return i ? (void 0 === i.dir && (i.dir = y), i.speed = speed, i) 
					: { lng: g, lat: x, dir: y, speed: speed, isOrigin: !1, time: t };
	   		},
			getTrackPointsBeforeTime:function(t){
					let i=[];for(let e=0,s=this._trackPoints.length;e<s;e++)this._trackPoints[e].time<t&&i.push(this._trackPoints[e]);let e=this._getCalculateTrackPointByTime(t);return e&&i.push(e),i
			},
			_addTrackPoint:function(t){
				
						t.isOrigin=!0,
						this._trackPoints.push(t),
						this._update()
			},
			_update:function(){
							this._sortTrackPointsByTime(),this._updatetimeTick()
			},
			_sortTrackPointsByTime:function(){
			let t=this._trackPoints.length;
			for(let i=0;i<t;i++)for(let e=0;e<t-1-i;e++)if(this._trackPoints[e].time>this._trackPoints[e+1].time){let t=this._trackPoints[e+1];this._trackPoints[e+1]=this._trackPoints[e],this._trackPoints[e]=t}
			},
			_updatetimeTick:function(){
			this._timeTick={};for(let t=0,i=this._trackPoints.length;t<i;t++)this._timeTick[this._trackPoints[t].time]=t
			},
			findNearestOriginPoint: function(latlng, maxDistance = Infinity, currentTime = null, trackHistoryDuration = null) {
                let nearestPoint = null;
                let minDistanceFound = Infinity;

                if (!this._trackPoints) return null;

                // Bepaal het starttijdstip van het zichtbare segment
                let visibleStartTime = -Infinity; // Standaard alles zichtbaar
                if (trackHistoryDuration !== null && trackHistoryDuration > 0 && currentTime !== null) {
                    visibleStartTime = currentTime - trackHistoryDuration;
                } else if (trackHistoryDuration === 0) { // Als history uit staat, is niets "zichtbaar" voor selectie
                    return null; // Geen punten selecteerbaar
                }
                // Als trackHistoryDuration null is (FULL_TRACK_HISTORY), blijft visibleStartTime -Infinity

                this._trackPoints.forEach(p => {
                    if (p.isOrigin) {
                        // --- BEGIN HIGHLIGHT: Check of punt binnen zichtbaar tijdvenster valt ---
                        let isVisible = false;
                        if (currentTime === null || trackHistoryDuration === null) { // Als geen tijdinfo, beschouw alles als zichtbaar (oude gedrag)
                            isVisible = true;
                        } else if (trackHistoryDuration === FULL_TRACK_HISTORY) {
                            isVisible = (p.time <= currentTime); // Alle punten tot nu toe
                        } else if (trackHistoryDuration > 0) {
                            isVisible = (p.time >= visibleStartTime && p.time <= currentTime);
                        }
                        // Als trackHistoryDuration === 0, is isVisible false (al eerder afgehandeld)

                        if (isVisible) {
                        // --- EINDE HIGHLIGHT ---
                            const pointLatLng = n.a.latLng(p.lat, p.lng);
                            const distance = latlng.distanceTo(pointLatLng);
                            if (distance < minDistanceFound && distance <= maxDistance) {
                                minDistanceFound = distance;
                                nearestPoint = p;
                            }
                        }
                    }
                });
                return nearestPoint;
             },

			 // NIEUW: Haal alle punten (origineel en geïnterpoleerd indien nodig) op binnen een tijdsbestek
			 getPointsInTimeRange: function(startTime, endTime) {
				 const pointsInRange = [];
				 if (!this._trackPoints) return pointsInRange;

				 // Voeg een geïnterpoleerd startpunt toe als startTime tussen twee originele punten valt
				 const startTrackPoint = this.getTrackPointByTime(startTime);
				 if (startTrackPoint && startTrackPoint.time === startTime) { // Exacte match
					 pointsInRange.push(startTrackPoint);
				 } else {
					 const interpolatedStart = this._getCalculateTrackPointByTime(startTime);
					 if (interpolatedStart) pointsInRange.push(interpolatedStart);
				 }


				 this._trackPoints.forEach(p => {
					 if (p.time > startTime && p.time < endTime) { // Punten strikt tussen start en eind
						 pointsInRange.push(p);
					 }
				 });

				 // Voeg een geïnterpoleerd eindpunt toe
				 const endTrackPoint = this.getTrackPointByTime(endTime);
				 if (endTrackPoint && endTrackPoint.time === endTime && endTime !== startTime) { // Exacte match, en niet hetzelfde als start
					 pointsInRange.push(endTrackPoint);
				 } else if (endTime !== startTime) {
					 const interpolatedEnd = this._getCalculateTrackPointByTime(endTime);
					 if (interpolatedEnd) pointsInRange.push(interpolatedEnd);
				 }


				 // Sorteer voor de zekerheid, hoewel ze al redelijk gesorteerd zouden moeten zijn
				 pointsInRange.sort((a, b) => a.time - b.time);
				 // Verwijder duplicaten op basis van tijd (kan ontstaan door interpolatie en originele punten)
				return pointsInRange.filter((point, index, self) =>
					index === self.findIndex((p) => (
						p.time === point.time
					))
				);
			 }
			 // --- EINDE HIGHLIGHT ---
		}),
			o=n.a.Class.extend({ // TrackController class
				// --- BEGIN HIGHLIGHT ---
				initialize:function(t=[],i,e, parentPlayback){ // Voeg parentPlayback toe
				   n.a.setOptions(this,e);
				   this._tracks = []; // Initialize tracks array
				   this.addTrack(t); // Add initial tracks
				   this._draw = i;   // Draw instance
				   this.playback = parentPlayback; // Sla referentie op naar hoofd TrackPlayBack instantie
				   this._updateTime();
				},
				// --- EINDE HIGHLIGHT ---
				getMinTime:function(){ return this._minTime}, getMaxTime:function(){ return this._maxTime},
				addTrack:function(t){ if(r(t)) for(let i=0,e=t.length;i<e;i++) this.addTrack(t[i]); else{if(!(t instanceof a)) throw new Error("tracks must be an instance of `Track` or an array of `Track` instance!"); this._tracks.push(t); /* Geen _updateTime() hier, doe het in initialize of apart */ } },
				drawTracksByTime:function(t){ // t is currentTime
					this._draw.clear(); // Wis canvas voor nieuwe animatie frame
					this._draw._bufferTracks = []; // Leeg ook de buffer van de Draw class (belangrijk!)
		
					for(let i=0,e=this._tracks.length;i<e;i++){
						let currentTrack = this._tracks[i];
						if (currentTrack && currentTrack._trackPoints && currentTrack._trackPoints.length > 0) {
							const trackKey = currentTrack.getKey();
							if (trackKey === null || this.playback._trackVisibilityState[trackKey] !== false) {
								let pointsToDraw=currentTrack.getTrackPointsBeforeTime(t);
								if (pointsToDraw && pointsToDraw.length) {
									// De Draw class _drawTrack methode wordt aangeroepen via _bufferTracks in _trackLayerUpdate
									// We moeten de punten bufferen zodat _trackLayerUpdate ze kan tekenen.
									this._draw._bufferTracks.push(pointsToDraw);
								}
							}
						}
					}
					// --- BEGIN HIGHLIGHT ---
					// Nadat alle normale track data voor deze tijdstap is voorbereid (gebufferd),
					// trigger een update van de Draw layer. Dit roept _trackLayerUpdate aan,
					// die dan de gebufferde tracks tekent EN de opgeslagen highlights.
					this._draw.update();
					// --- EINDE HIGHLIGHT ---
				},
			_updateTime:function(){
					this._minTime=this._tracks[0].getStartTrackPoint().time,this._maxTime=this._tracks[0].getEndTrackPoint().time;for(let t=0,i=this._tracks.length;t<i;t++){let i=this._tracks[t].getStartTrackPoint().time,e=this._tracks[t].getEndTrackPoint().time;i<this._minTime&&(this._minTime=i),e>this._maxTime&&(this._maxTime=e)}
			}}),
			h=n.a.Class.extend({includes:n.a.Mixin.Events,options:{speed:2,maxSpeed:10},
			initialize:function(t,i){
				n.a.setOptions(this,i),
				this._trackController=t,
				this._endTime=this._trackController.getMaxTime(),
				this._curTime=this._trackController.getMinTime(),
				this._speed=this.options.speed,
				this._maxSpeed=this.options.maxSpeed,
				this._intervalID=null,
				this._lastFpsUpdateTime=0},
			start:function(){
				this._intervalID||(this._intervalID=n.a.Util.requestAnimFrame(this._tick,this))
			},
			stop:function(){
					this._intervalID&&(n.a.Util.cancelAnimFrame(this._intervalID),this._intervalID=null,this._lastFpsUpdateTime=0)
			},
			rePlaying:function(){
				this.stop(),
				this._curTime=this._trackController.getMinTime(),
				this.start()
				},
			slowSpeed:function(){
				this._speed=this._speed<=1?this._speed:this._speed-1,
				this._intervalID&&(this.stop(),this.start())
				},
			quickSpeed:function(){
				this._speed=this._speed>=this._maxSpeed?this._speed:this._speed+1,
				this._intervalID&&(this.stop(),this.start())
				},
			getSpeed:function(){
				return this._speed
			},
			getCurTime:function(){
				return this._curTime
			},
			getStartTime:function(){
				return this._trackController.getMinTime()
			},
			getEndTime:function(){
				return this._trackController.getMaxTime()
			},
			isPlaying:function(){
				return!!this._intervalID
			},
			setCursor:function(t){
				this._curTime=t,this._trackController.drawTracksByTime(this._curTime),
				this.fire("tick",{time:this._curTime})
			},
			setSpeed:function(t){
				this._speed=t,this._intervalID&&(this.stop(),this.start())
			},
			_caculatefpsTime:function(t){
					let i;return i=0===this._lastFpsUpdateTime?0:t-this._lastFpsUpdateTime,this._lastFpsUpdateTime=t,i/=1e3
			},
			_tick:function(){
				let t=+new Date,
				i=!1,
				e=this._caculatefpsTime(t)*Math.pow(2,this._speed-1);
				this._curTime+=e,
				this._curTime>=this._endTime&&(this._curTime=this._endTime,i=!0),
				this._trackController.drawTracksByTime(this._curTime),
				this.fire("tick",{time:this._curTime}),i||(this._intervalID=n.a.Util.requestAnimFrame(this._tick,this))
			}
			}),
			c=n.a.Renderer.extend({initialize:function(t){
				n.a.Renderer.prototype.initialize.call(this,t),
				this.options.padding=.1
			},
			onAdd:function(t){
			this._container=n.a.DomUtil.create("canvas","leaflet-zoom-animated"),
			t.getPane(this.options.pane).appendChild(this._container),
			this._ctx=this._container.getContext("2d"),this._update()
			},
			onRemove:function(t){
				n.a.DomUtil.remove(this._container)
			},
			getContainer:function(){
				return this._container
			},
			getBounds:function(){
				return this._bounds
			},
			_update:function(){
				if(!this._map._animatingZoom||!this._bounds){		
					n.a.Renderer.prototype._update.call(this);
					var t=this._bounds,
					i=this._container,
					e=t.getSize(),
					s=n.a.Browser.retina?2:1;n.a.DomUtil.setPosition(i,t.min),i.width=s*e.x,i.height=s*e.y,i.style.width=e.x+"px",i.style.height=e.y+"px",n.a.Browser.retina&&this._ctx.scale(2,2),
					this._ctx.translate(-t.min.x,-t.min.y),
					this.fire("update")}
					}
			}),
			l=n.a.Class.extend({ // Dit is de Draw class
				trackPointOptions:{isDraw:!1,useCanvas:!0,stroke:!1,color:"#ef0300",fill:!0,fillColor:"#ef0300",opacity:.3,radius:4},
						trackLineOptions:{/*isDraw:!1, --> Verwijderd */ stroke:!0,color:"#1C54E2",weight:2,fill:!1,fillColor:"#000",opacity:.8}, // Standaard stroke=true
						targetOptions:{useImg:!1,imgUrl: "examples/ship.png",showText:!0,width:8,height:18,color:"#00f",fillColor:"#9FD12D",opacity:.3},
						toolTipOptions:{offset:[0,0],direction:"bottom",permanent:!1},
				initialize: function(t, i, playbackInstance) { // t=map, i=options, playbackInstance toegevoegd
					this.playback = playbackInstance; // Sla referentie op
				
			if(n.a.extend(this.trackPointOptions,i.trackPointOptions),
				n.a.extend(this.trackLineOptions,i.trackLineOptions),
				n.a.extend(this.targetOptions,i.targetOptions),
				n.a.extend(this.toolTipOptions,i.toolTipOptions),

				// NIEUW: Initialiseer de weergavemodus
				this._textDisplayMode = i.textDisplayMode || DISPLAY_MODE.FULL, // Neem over of gebruik standaard

				// Initialiseer de track historie duur (null = volledig)
				this._trackHistoryDuration = i.trackHistoryDuration === undefined ? FULL_TRACK_HISTORY : i.trackHistoryDuration,
				
				this._showTrackPoint=this.trackPointOptions.isDraw,
				// this._showTrackLine=this.trackLineOptions.isDraw,
				this._map=t,
				this._map.on("mousemove",this._onmousemoveEvt,this),
				this._trackLayer=(new c).addTo(t),
				this._trackLayer.on("update",this._trackLayerUpdate,this),
				this._canvas=this._trackLayer.getContainer(),
				this._segmentsToHighlight = [], // Array voor meerdere highlights
				this._ctx=this._canvas.getContext("2d"),
				this._bufferTracks=[],
				this.trackPointOptions.useCanvas||(this._trackPointFeatureGroup=n.a.featureGroup([]).addTo(t)),				
				this.targetOptions.useImg){
					const t=new Image;t.onload=(()=>{this._targetImg=t}),
					t.onerror=(()=>{throw new Error("img load error!")
					}),
				    t.src= this.targetOptions.imgUrl
					
				}
			
			},

		// NIEUW: Methode om de modus te wijzigen
		setTextDisplayMode: function(mode) {
			if (Object.values(DISPLAY_MODE).includes(mode)) {
				this._textDisplayMode = mode;
				// Forceer een redraw om de wijziging direct zichtbaar te maken
				this.update(); // Roep de bestaande update aan die _trackLayerUpdate triggert
			} else {
				console.warn('Invalid text display mode:', mode);
			}
		},

			// NIEUW: Methode om de track historie duur te wijzigen
			setTrackHistoryDuration: function(duration) {
				// Validate duration (should be null, 0 or positive)
				const newDuration = (duration === FULL_TRACK_HISTORY || duration >= 0) ? duration : FULL_TRACK_HISTORY; // Fallback to full if invalid
				if (this._trackHistoryDuration !== newDuration) {
					this._trackHistoryDuration = newDuration;
					this.update(); // Forceer een redraw
				}
			},

			update:function(){
				this._trackLayerUpdate()
			},
			drawTrack:function(t){ // t zijn de punten voor EEN track
				if (!t || t.length === 0) return;
				// Deze methode wordt nu eigenlijk niet meer direct aangeroepen door TrackController.
				// TrackController vult _bufferTracks en roept dan _draw.update() aan.
				// Als je deze methode toch nog ergens anders gebruikt, zorg dan dat het alleen buffert:
				// this._bufferTracks.push(t);
				// this.update(); // Trigger de daadwerkelijke tekenronde
				// Voor nu, laten we aannemen dat TrackController de buffer direct beheert.
			},
			showTrackPoint:function(){
				this._showTrackPoint=!0,this.update()
			},
			hideTrackPoint:function(){
				this._showTrackPoint=!1,this.update()
			},
			// showTrackLine:function(){
			// 	this._showTrackLine=!0,this.update()
			// },
			// hideTrackLine:function(){
			// 	this._showTrackLine=!1,this.update()
			// },
			remove:function(){
				this._bufferTracks=[],
				this._trackLayer.off("update",this._trackLayerUpdate,this),
				this._map.off("mousemove",this._onmousemoveEvt,this),
				this._map.hasLayer(this._trackLayer)&&this._map.removeLayer(this._trackLayer),
				this._map.hasLayer(this._trackPointFeatureGroup)&&this._map.removeLayer(this._trackPointFeatureGroup)
			},
			clear:function(){
				this._clearLayer(),this._bufferTracks=[]
			},
			_trackLayerUpdate:function(){
				this._updateFrameRequested = null;
				if (!this._ctx || !this._canvas) return;
				this._clearLayer();
	
				// Teken normale tracks uit de buffer
				if (this._bufferTracks && this._bufferTracks.length > 0) {
					this._bufferTracks.forEach(trackPointsArray => { // _bufferTracks is nu een array van arrays (per track)
						if (trackPointsArray && trackPointsArray.length > 0) {
							this._drawTrack(trackPointsArray); // _drawTrack tekent één track
						}
					});
				}
	
				// Teken highlights
				if (this._segmentsToHighlight && this._segmentsToHighlight.length > 0) {
					// ... (logica voor tekenen van highlights blijft hetzelfde) ...
				}
			},
			_onmousemoveEvt:function(t){
				if(!this._showTrackPoint)return;
				let i=t.layerPoint;
				if(this._bufferTracks.length)
				for(let t=0,e=this._bufferTracks.length;t<e;t++)
					for(let e=0,s=this._bufferTracks[t].length;e<s;e++)
					{
						let s=this._getLayerPoint(this._bufferTracks[t][e]);
						if(i.distanceTo(s)<=this.trackPointOptions.radius)
							return void this._opentoolTip(this._bufferTracks[t][e])
					}
				this._map.hasLayer(this._tooltip)&&this._map.removeLayer(this._tooltip),
				this._canvas.style.cursor="pointer"
			},
			_opentoolTip:function(t){
				this._map.hasLayer(this._tooltip)&&this._map.removeLayer(this._tooltip),
				this._canvas.style.cursor="default";
				let i=n.a.latLng(t.lat,t.lng),
				e=this._tooltip=n.a.tooltip(this.toolTipOptions);
				e.setLatLng(i),
				e.addTo(this._map),
				e.setContent(this._getTooltipText(t))
			},
			
			_drawTrack:function(t){ // t is de array van punten voor een enkele track
				var regn;
				let currentPointData = t[t.length-1]; // Huidig punt ('i' in jouw oude code)
				let infoSource = currentPointData.info ? currentPointData : (t.length > 1 ? t[t.length-2] : null);
				var pathpic="";
				if(infoSource && infoSource.info){
				   pathpic = infoSource.info[2] ? infoSource.info[2]['color'] : "#ff0000";
				   regn = infoSource.info[0] ? infoSource.info[0]['key'] : 'Unknown';
				} else {
					regn = 'Unknown';
					pathpic = "#ff0000";
				}
		
				// --- BEGIN HIGHLIGHT: Dynamisch samenstellen van textpop ---
				let textpop = '';
				const speedKnots = currentPointData.speed !== undefined ? (currentPointData.speed * 1.94384).toFixed(1) : 'N/A';
				const direction = currentPointData.dir !== undefined ? `${parseInt(currentPointData.dir)}°` : '';
				const labelOptions = this.playback.getLabelDisplayOptions(); // Haal de huidige label opties op
		
				let textParts = [];
				if (labelOptions.showName && regn !== 'Unknown') {
					textParts.push(regn);
				}
				if (labelOptions.showBearing && direction) {
					textParts.push(direction);
				}
				if (labelOptions.showSpeed && speedKnots !== 'N/A') {
					textParts.push(`${speedKnots} kn`);
				}
				// VOORBEELD voor toekomstige opties (data moet in currentPointData zitten):
				// if (labelOptions.showHeartRate && currentPointData.heartRate) {
				//     textParts.push(`${currentPointData.heartRate} bpm`);
				// }
		
				textpop = textParts.join(' - '); // Separator, kan ook '\n' zijn maar canvas text behandelt dat lastig
				// --- EINDE HIGHLIGHT ---
		
				this.trackPointOptions.stroke=true; this.trackPointOptions.fill=false;
		
				this._drawTrackLine(t,pathpic); // Zichtbaarheid wordt intern afgehandeld door _trackHistoryDuration
				this.targetOptions.useImg && this._targetImg ? this._drawShipImage(currentPointData,pathpic) : this._drawShipCanvas(currentPointData);
		
				// Teken tekst alleen als showText aan staat EN textpop niet leeg is
				if (this.targetOptions.showText && textpop) { // showText blijft de algemene aan/uit voor alle labels
					this._drawtxt(textpop, currentPointData);
				}
		
				this._showTrackPoint && (this.trackPointOptions.useCanvas ? this._drawTrackPointsCanvas(t,pathpic) : this._drawTrackPointsSvg(t,pathpic));
			},
			_drawTrackLine:function(t,pathpic){
                const duration = this._trackHistoryDuration;
                // --- BEGIN HIGHLIGHT ---
                // Stop met tekenen als duration 0 is
                if (duration === 0) {
                    return;
                }
                // --- EINDE HIGHLIGHT ---
                let pointsToDraw = t;

                if (duration !== FULL_TRACK_HISTORY && duration > 0 && t.length > 0) {
                    const currentTime = t[t.length - 1].time; const minTime = currentTime - duration; let startIndex = -1;
                    for (let k = 0; k < t.length; k++) { if (t[k].time >= minTime) { startIndex = k; break; } }
                    if (startIndex === -1 || startIndex >= t.length -1 ) { return; } pointsToDraw = t.slice(startIndex);
                    if (startIndex > 0 && t[startIndex -1].time < minTime) {
                         const pointBefore = t[startIndex - 1]; const pointAfter = t[startIndex]; const timeRatio = (minTime - pointBefore.time) / (pointAfter.time - pointBefore.time);
                         if (timeRatio >= 0 && timeRatio <= 1) { const lat = pointBefore.lat + (pointAfter.lat - pointBefore.lat) * timeRatio; const lng = pointBefore.lng + (pointAfter.lng - pointBefore.lng) * timeRatio; pointsToDraw.unshift({ lat: lat, lng: lng, time: minTime, isOrigin: false }); }
                    }
                } // If duration is FULL_TRACK_HISTORY, pointsToDraw remains 't'

                if (!pointsToDraw || pointsToDraw.length < 2) { return; }

				let lineOpts=this.trackLineOptions; // Renamed i to lineOpts
				let startPoint=this._getLayerPoint(pointsToDraw[0]);
				this._ctx.save(); this._ctx.beginPath(); this._ctx.moveTo(startPoint.x, startPoint.y);
				for(let k=1, len=pointsToDraw.length; k<len; k++){ let currentPoint=this._getLayerPoint(pointsToDraw[k]); this._ctx.lineTo(currentPoint.x, currentPoint.y) }
				this._ctx.globalAlpha=lineOpts.opacity;
                // --- BEGIN HIGHLIGHT ---
                // Gebruik standaard stroke=true, teken altijd als deze functie wordt aangeroepen (check is nu in _drawTrack)
				if (lineOpts.stroke) { this._ctx.strokeStyle=pathpic?pathpic:lineOpts.color; this._ctx.lineWidth=lineOpts.weight; this._ctx.stroke(); }
                // --- EINDE HIGHLIGHT ---
				if (lineOpts.fill) { this._ctx.fillStyle=pathpic?pathpic:lineOpts.fillColor; this._ctx.fill(); }
				this._ctx.restore();
			},
			_drawTrackPointsCanvas:function(t,pathpic){
				//console.log("_drawTrackPointsCanvas",t);
				let i=this.trackPointOptions;
				this._ctx.save();
				for(let e=0,s=t.length;e<s;e++)
					if(t[e].isOrigin){
						let s=n.a.latLng(t[e].lat,t[e].lng),
						r=i.radius,a=this._map.latLngToLayerPoint(s);
						this._ctx.beginPath(),
						this._ctx.arc(a.x,a.y,r,0,2*Math.PI,!1),
						//this._ctx.globalAlpha=i.opacity,pathpic&&(this._ctx.strokeStyle=pathpic,
						this._ctx.globalAlpha=i.opacity,i.stroke&&(this._ctx.strokeStyle=i.color,
						this._ctx.stroke()),
						i.fill&&(this._ctx.fillStyle=i.fillColor,
						this._ctx.fill())
						
					}
						this._ctx.restore()
			},
			_drawTrackPointsSvg:function(t,pathpic){
				//console.log("_drawTrackPointsSvg",t);
				for(let i=0,e=t.length;i<e;i++)
					if(t[i].isOrigin){
						
						let e=n.a.latLng(t[i].lat,
						t[i].lng),
						s=n.a.circleMarker(e,this.trackPointOptions);
						s.setStyle({fillColor: pathpic});
						s.bindTooltip(this._getTooltipText(t[i]),
						this.toolTipOptions),
						this._trackPointFeatureGroup.addLayer(s)
						
					
						}
			},
			_drawtxt:function(t,i){ // t is nu de berekende textpop

				let e=this._getLayerPoint(i);
				this._ctx.save(),
				this._ctx.font="10px Verdana", // Iets leesbaarder font
				this._ctx.fillStyle="#FFFFFF", // Zwart
				this._ctx.strokeStyle = '#000000'; // Witte outline
				this._ctx.lineWidth = 1.5; // Dikte outline
				this._ctx.textAlign="center",
				this._ctx.textBaseline="bottom",
				this._ctx.strokeText(t,e.x,e.y-12,200), // Teken eerst outline
				this._ctx.fillText(t,e.x,e.y-12,200), // Teken dan de tekst
				this._ctx.restore()
		},
			_drawShipCanvas:function(t){
				
					let i=this._getLayerPoint(t),
					e=t.dir||0,
					s=this.targetOptions.width,
					n=this.targetOptions.height,
					r=n/3;
					this._ctx.save(),
					this._ctx.fillStyle=this.targetOptions.fillColor,
					this._ctx.strokeStyle=this.targetOptions.color,
					this._ctx.translate(i.x,i.y),
					this._ctx.rotate(Math.PI/180*e),
					this._ctx.beginPath(),
					this._ctx.moveTo(0,0-n/2),
					this._ctx.lineTo(0-s/2,0-n/2+r),
					this._ctx.lineTo(0-s/2,0+n/2),
					this._ctx.lineTo(0+s/2,0+n/2),
					this._ctx.lineTo(0+s/2,0-n/2+r),
					this._ctx.closePath(),
					this._ctx.fill(),
					this._ctx.stroke(),
					this._ctx.restore()
					
			},
			_drawShipImage: function(t, pathpic) { // t is currentPointData, pathpic is de kleur string
				// console.log("_drawShipImage pathpic:", pathpic);
			
				// --- BEGIN AANGEPAST DEEL VOOR KLEURBEREKENING EN GRADIENT ---
				var baseColorRgb = { r: 0, g: 0, b: 255 }; // Default naar blauw als pathpic faalt
				var baseHexColorForId = "0000FF"; // Voor unieke gradient ID
			
				if (pathpic) {
					var validHEXInput = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(pathpic);
					if (validHEXInput) {
						baseColorRgb.r = parseInt(validHEXInput[1], 16);
						baseColorRgb.g = parseInt(validHEXInput[2], 16);
						baseColorRgb.b = parseInt(validHEXInput[3], 16);
						baseHexColorForId = pathpic.replace("#", "");
					} else if (pathpic.startsWith('rgb')) { // Check voor rgb() of rgba()
						try {
							const parts = pathpic.substring(pathpic.indexOf('(') + 1, pathpic.lastIndexOf(')')).split(',');
							if (parts.length >= 3) {
								baseColorRgb.r = parseInt(parts[0].trim(), 10);
								baseColorRgb.g = parseInt(parts[1].trim(), 10);
								baseColorRgb.b = parseInt(parts[2].trim(), 10);
								// Maak een hex voor de ID
								const componentToHex = (c) => {
									const hex = c.toString(16);
									return hex.length == 1 ? "0" + hex : hex;
								};
								baseHexColorForId = componentToHex(baseColorRgb.r) + componentToHex(baseColorRgb.g) + componentToHex(baseColorRgb.b);
							}
						} catch (e) {
							console.warn("Could not parse RGB color for gradient:", pathpic, e);
						}
					} else {
						console.warn("Unsupported pathpic format for gradient:", pathpic, "using default blue.");
					}
				}
			
				// Maak lichtere en donkerdere tinten
				const lightenFactor = 0.4; // Meer contrast
				const darkenFactor = 0.4;
			
				const shadeColorComponent = (colorComponent, factor, lighten) => {
					let shaded = lighten ? colorComponent * (1 + factor) : colorComponent * (1 - factor);
					return Math.max(0, Math.min(255, Math.round(shaded)));
				};
			
				const lighterRgbStr = `rgb(${shadeColorComponent(baseColorRgb.r, lightenFactor, true)}, ${shadeColorComponent(baseColorRgb.g, lightenFactor, true)}, ${shadeColorComponent(baseColorRgb.b, lightenFactor, true)})`;
				const darkerRgbStr = `rgb(${shadeColorComponent(baseColorRgb.r, darkenFactor, false)}, ${shadeColorComponent(baseColorRgb.g, darkenFactor, false)}, ${shadeColorComponent(baseColorRgb.b, darkenFactor, false)})`;
				const baseRgbStr = `rgb(${baseColorRgb.r},${baseColorRgb.g},${baseColorRgb.b})`;
			
				// Unieke ID voor de gradient
				const gradientId = "boatGrad_" + baseHexColorForId;
				// --- EINDE AANGEPAST DEEL VOOR KLEURBEREKENING EN GRADIENT ---
			
				// Jouw bestaande SVG basis
				var viewBoxWidth = 20;
				var viewBoxHeight = 40;
				var pathData = "M10,2 Q19,20 18,38 L2,38 Q1,20 10,2 Z";
			
				// --- BEGIN AANGEPASTE SVG STRING MET GRADIENT ---
				var svg =
					'<svg viewBox="0 0 ' + viewBoxWidth + ' ' + viewBoxHeight + '" xmlns="http://www.w3.org/2000/svg">' +
					  '<defs>' +
						// Definieer de lineaire gradient (verticaal, van licht naar donker)
						'<radialGradient id="' + gradientId + '" cx="50%" cy="70%" r="50%" fx="50%" fy="50%">' +
						  '<stop offset="0%" style="stop-color:' + lighterRgbStr + ';stop-opacity:1"/>' +   // Bovenkant lichter
						  '<stop offset="50%" style="stop-color:' + baseRgbStr + ';stop-opacity:1"/>' +    // Midden basiskleur
						  '<stop offset="90%" style="stop-color:' + darkerRgbStr + ';stop-opacity:1"/>' +  // Onderkant donkerder
						'</radialGradient>' +
						'<style type="text/css">' +
						  // Gebruik de gradient voor de fill.


						  
						  // Stroke is de basiskleur (solide).
						  // fill-opacity kun je hier toevoegen als je de hele gradient transparant wilt.
						  '.cls-1{fill:url(#' + gradientId + '); stroke:' + baseRgbStr + '; stroke-opacity:1; stroke-width:0.75px; fill-opacity:1;}' + // stroke-width en fill-opacity aangepast
						'</style>' +
					  '</defs>' +
					  '<path class="cls-1" d="' + pathData + '"/>' +
					'</svg>';
				// --- EINDE AANGEPASTE SVG STRING MET GRADIENT ---
			
				// De rest van je code voor het maken van de image en het tekenen op canvas
				// De 'rgba' variabele die je eerder had, is nu vervangen door de gradient logica.
				// De 'domUrl' check is goed, maar meestal niet nodig voor data URLs.
			
				var svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
				// console.log("Generated SVG for boat:", svg); // Voor debuggen van de SVG string
			
				// Image caching (vereenvoudigd, je had een complexere caching, die kun je behouden)
				// Voor dynamische gradients per kleur is een unieke cache key per *gradientId* of *rgba-combinatie* handig.
				// De huidige this._cachedShipImages (als die bestaat) zou de svgUrl als key kunnen gebruiken.
				let img;
				if (this._cachedShipImages && this._cachedShipImages[svgUrl]) {
					img = this._cachedShipImages[svgUrl];
				} else {
					img = new Image();
					img.onload = () => {
						if (!this._cachedShipImages) this._cachedShipImages = {};
						this._cachedShipImages[svgUrl] = img;
						 // Forceer een update als de image asynchroon laadt, zodat het direct getekend wordt
						if (this._map && this.update) this.update();
					};
					img.onerror = () => {
						console.error("Failed to load dynamic SVG image from data URL.");
						 if (this._cachedShipImages) delete this._cachedShipImages[svgUrl];
					};
					img.src = svgUrl; // Gebruik de volledige data URL hier
					if (!this._cachedShipImages) this._cachedShipImages = {};
					this._cachedShipImages[svgUrl] = img; // Voeg toe aan cache, zelfs als nog niet geladen
				}
				this._targetImg = img; // Dit is de image die getekend wordt
			
				let i = this._getLayerPoint(t), // currentPointData
					e = t.dir || 0,
					s = this.targetOptions.width,
					n = this.targetOptions.height,
					r = s / 2,
					a = n / 2;
			
				// Teken alleen als de image (potentieel) geladen is
				if (this._targetImg && (this._targetImg.complete || this._targetImg.width > 0 || img.src === svgUrl /* Als src net gezet is, is complete soms false */)) {
					this._ctx.save();
					this._ctx.translate(i.x, i.y);
					this._ctx.rotate(Math.PI / 180 * e);
					this._ctx.drawImage(this._targetImg, -r, -a, s, n); // Gebruik s, n (komen uit targetOptions)
					this._ctx.restore();
				} else {
					// Fallback als image niet getekend kan worden
					// console.warn("Target image not ready for drawing, consider drawing canvas fallback.");
					// this._drawShipCanvas(t); // Roep je canvas tekenfunctie aan als fallback
				}
			},
			_getTooltipText:function(t){
				let i=[];
				
				if(i.push("<table>"),t.info&&t.info.length)
					
					for(let e=0,s=t.info.length;e<s;e++)
					
					if(e==0){
					i.push("<tr>"),
					i.push("<td>" + t.info[e]['key'] + "</td>"),
					
					i.push("</tr>");
					}else if(e==1){
					i.push("<tr>"),
					i.push("<td>" + t.info[e]['value'] + "</td>"),
					
					i.push("</tr>");
					}else{
						i.push("<tr>"),
					i.push("<td>" + t.info[e]['color'] + "</td>"),
					
					i.push("</tr>");
					}	
					
					return i.push("</table>"),i=i.join("")
			},
			_clearLayer:function(){
				let t=this._trackLayer.getBounds();
			if(t){
				let i=t.getSize();
				this._ctx.clearRect(t.min.x,t.min.y,i.x,i.y)}else this._ctx.clearRect(0,0,this._canvas.width,this._canvas.height);
				this._map.hasLayer(this._trackPointFeatureGroup)&&this._trackPointFeatureGroup.clearLayers()
			},
			_getLayerPoint(t){
						return this._map.latLngToLayerPoint(n.a.latLng(t.lat,t.lng))
			},
			drawSegmentHighlight: function(points, options = {}) { // options bevat nu color, opacity etc.
				if (!points || points.length < 2 || !this._ctx) return;

				// --- BEGIN LOGGING ---
				console.log("Draw.drawSegmentHighlight: Drawing with received options:", JSON.parse(JSON.stringify(options))); // Kopie voor logging
				// --- EINDE LOGGING ---

				const defaultOptions = {
					color: '#00FFFF', // Fallback cyaan, zou overschreven moeten worden
					weight: 5,
					opacity: 0.7     // Fallback opacity
				};
				// Combineer defaults met de meegegeven options. Meegegeven options hebben voorrang.
				const style = L.extend({}, defaultOptions, options); // L.extend is Leaflet's manier, of Object.assign

				// --- BEGIN LOGGING ---
				console.log("Draw.drawSegmentHighlight: Final style being applied:", style);
				// --- EINDE LOGGING ---

				this._ctx.save();
				this._ctx.beginPath();
				const startPoint = this._getLayerPoint(points[0]);
				this._ctx.moveTo(startPoint.x, startPoint.y);
				for (let i = 1; i < points.length; i++) {
					this._ctx.lineTo(this._getLayerPoint(points[i]).x, this._getLayerPoint(points[i]).y);
				}
				this._ctx.strokeStyle = style.color;    // Gebruik style.color
				this._ctx.lineWidth = style.weight;
				this._ctx.globalAlpha = style.opacity;  // Gebruik style.opacity
				this._ctx.stroke();
				this._ctx.restore();
			},

			// NIEUW: Verwijder highlights (wordt aangeroepen door clearLayer, maar kan ook apart)
			// De _clearLayer methode wist al het canvas, dus een aparte clearHighlights is niet direct
			// nodig als de highlight op dezelfde canvas getekend wordt. Als het een aparte layer zou zijn, dan wel.
			// Voor nu gaan we ervan uit dat _clearLayer volstaat, of dat de segment analysis module
			// een redraw van de tracks forceert via setCursor, wat _clearLayer aanroept.
			// --- EINDE HIGHLIGHT ---
		
			}),
			_=n.a.Class.extend({ // Hoofd TrackPlayBack class
				includes:n.a.Mixin.Events,
				defaultLabelOptions: {
					showName: true,
					showSpeed: true,
					showBearing: true,
					// Voeg hier later meer defaults toe:
					// showHeartRate: false,
					// showHeelAngle: false,
				},
				initialize:function(t,i,e={}){ // t=trackData, i=map, e=options
					// --- BEGIN HIGHLIGHT: Initialiseer labelDisplayOptions ---
					// Neem meegegeven labelOptions over, of gebruik defaults
					this.labelDisplayOptions = n.a.extend({}, this.defaultLabelOptions, e.labelOptions);
					// --- EINDE HIGHLIGHT ---
					let s={ trackPointOptions:e.trackPointOptions, trackLineOptions:e.trackLineOptions, targetOptions:e.targetOptions, toolTipOptions:e.toolTipOptions, popupOptions:e.popupOptions, trackHistoryDuration: e.trackHistoryDuration };
					this.tracks=this._initTracks(t);
					this.draw=new l(i,s, this); // Geef 'this' (playback instance) mee aan Draw constructor
					this.trackController=new o(this.tracks,this.draw, {}, this);
					this._initializeTrackVisibility();
					this.clock=new h(this.trackController,e.clockOptions);
					this.clock.on("tick",this._tick,this);
				},
				// --- BEGIN HIGHLIGHT ---
				// NIEUW: Initialiseer de zichtbaarheid state
				_initializeTrackVisibility: function() {
					this._trackVisibilityState = {};
					if (this.trackController && this.trackController._tracks) {
						this.trackController._tracks.forEach(track => {
							const key = track.getKey();
							if (key !== null) {
								this._trackVisibilityState[key] = true; // Standaard zichtbaar
							}
						});
					}
				},
				// NIEUW: Haal unieke track keys op
				getTrackKeys: function() {
					const keys = new Set();
					if (this.trackController && this.trackController._tracks) {
						this.trackController._tracks.forEach(track => {
							const key = track.getKey();
							if (key !== null) {
								keys.add(key);
							}
						});
					}
					return Array.from(keys).sort(); // Geef gesorteerde array terug
				},
				// NIEUW: Stel zichtbaarheid in voor een specifieke track key
				setTrackVisibility: function(key, isVisible) {
					if (this._trackVisibilityState.hasOwnProperty(key)) {
						const changed = this._trackVisibilityState[key] !== !!isVisible; // Check of het echt verandert
						this._trackVisibilityState[key] = !!isVisible; // Zorg dat het een boolean is
						// Forceer een redraw als de staat is veranderd
						if (changed) {
							this.clock.setCursor(this.clock.getCurTime()); // Forceer her-evaluatie en tekenen
						}
					} else {
						console.warn("Attempted to set visibility for unknown track key:", key);
					}
				},
				// --- EINDE HIGHLIGHT ---
				getStartTime: function() { return this.clock.getStartTime(); }, getEndTime: function() { return this.clock.getEndTime(); },
				start:function(){ return this.clock.start(),this }, stop:function(){ return this.clock.stop(),this }, rePlaying:function(){ return this.clock.rePlaying(),this },
				slowSpeed:function(){ return this.clock.slowSpeed(),this }, quickSpeed:function(){ return this.clock.quickSpeed(),this },
				getSpeed:function(){ return this.clock.getSpeed() }, getCurTime:function(){ return this.clock.getCurTime() }, isPlaying:function(){ return this.clock.isPlaying() },
				setCursor:function(t){ return this.clock.setCursor(t),this }, setSpeed:function(t){ return this.clock.setSpeed(t),this },
				showTrackPoint:function(){ return this.draw.showTrackPoint(),this }, hideTrackPoint:function(){ return this.draw.hideTrackPoint(),this },
			// showTrackLine:function(){
			// 	return this.draw.showTrackLine(),this
			// },
			// hideTrackLine:function(){
			// 	return this.draw.hideTrackLine(),this
			// },
			formatDuration: function(seconds) {
				// Deze methode roept de helper functie aan die we hierboven hebben gedefinieerd
				return formatPlaybackDuration(seconds);
			},

			getLabelDisplayOptions: function() {
				return L.extend({}, this.labelDisplayOptions); // Geef een kopie terug
			},
		
			setLabelDisplayOption: function(optionKey, isVisible) {
				if (this.labelDisplayOptions.hasOwnProperty(optionKey)) {
					const changed = this.labelDisplayOptions[optionKey] !== !!isVisible;
					this.labelDisplayOptions[optionKey] = !!isVisible;
					if (changed) {
						// Forceer een redraw van de huidige state om de labels te updaten
						// Dit kan door de cursor op de huidige tijd te zetten, wat een tick & draw triggert
						if (this.clock && this.clock.isPlaying()) {
							// Als het speelt, wordt het vanzelf geüpdatet.
							// Een directe redraw is beter als het gepauzeerd is.
							this.trackController.drawTracksByTime(this.clock.getCurTime());
						} else if (this.clock) {
							this.trackController.drawTracksByTime(this.clock.getCurTime());
						}
						this.fire('labeloptionschanged', { options: this.labelDisplayOptions }); // Event voor de UI
					}
				} else {
					console.warn("Attempted to set unknown label display option:", optionKey);
				}
			},

			dispose:function(){
				this.clock.off("tick",this._tick),this.draw.remove(),this.tracks=null,this.draw=null,this.trackController=null,this.clock=null
			},
			_tick:function(t){
				this.fire("tick",t)
			},
			_initTracks:function(t){
				let i=[];
				if(r(t))if(r(t[0]))
					for(let e=0,s=t.length;e<s;e++)i.push(new a(t[e]));
				else i.push(new a(t));
				return i
			},
			// --- BEGIN HIGHLIGHT ---
            // NIEUW: Methodes voor Segment Analyse interactie
            getTrackByKey: function(key) {
                if (this.trackController && this.trackController._tracks) {
                    return this.trackController._tracks.find(track => track.getKey() === key);
                }
                return null;
            },

            // Roep deze aan vanuit de control om map clicks te delegeren
            handleMapClickForAnalysis: function(mapClickEvent) {
                // mapClickEvent is het Leaflet mouse event
                this.fire('analysis:mapclick', mapClickEvent);
            },

			highlightSegmentOnMap: function(trackKey, startTime, endTime, options) { // options bevat nu { color, opacity, ... }
                const track = this.getTrackByKey(trackKey);
                if (track && this.draw) {
                    const points = track.getPointsInTimeRange(startTime, endTime);
                    if (points && points.length > 0) {
                        const highlightId = options.id || `${trackKey}_${startTime}_${endTime}`; // Gebruik meegegeven ID of maak een nieuwe
                        // --- BEGIN LOGGING ---
                        console.log("TrackPlayBack.highlightSegmentOnMap: Adding highlight with options:", options, "for ID:", highlightId);
                        // --- EINDE LOGGING ---
                        this.draw._segmentsToHighlight.push({
                            id: highlightId,
                            points: points,
                            options: options // Geef het volledige options object door
                        });
                        this.draw.update();
                    }
                }
            },

			clearSegmentHighlight: function(highlightIdToRemove = null) { // Optionele ID parameter
				if (this.draw && this.draw._segmentsToHighlight) {
					// --- BEGIN HIGHLIGHT ---
					if (highlightIdToRemove) {
						this.draw._segmentsToHighlight = this.draw._segmentsToHighlight.filter(
							highlight => highlight.id !== highlightIdToRemove
						);
					} else {
						// Wis alle highlights
						this.draw._segmentsToHighlight = [];
					}
					this.draw.update();
					// --- EINDE HIGHLIGHT ---
				}
			},

			// Voeg deze methode toe (of pas aan als hij al bestaat):
			loadSession: function(sessionData) {
				console.log("TrackPlayBack.loadSession (Simplified Priority Focus) CALLED. SessionData keys:", sessionData ? Object.keys(sessionData) : 'null');

				if (!sessionData || !this._map) {
					console.error("TrackPlayBack.loadSession: Invalid sessionData or map not available.");
					return;
				}

				// PRIO 1: Tracks & Playback basis
				// - Tracks zijn al geladen in this.tracks door L.trackplayback() in main-playback.js.
				// - Playback start standaard aan het begin.
				// - Kaart view wordt gefit op tracks in main-playback.js.
				// We doen hier dus niets extra's voor Prio 1, 4, 5, 6.

				// PRIO 2: Herstel Leaflet-Geoman Tekeningen
				if (sessionData.geomanDrawings && Array.isArray(sessionData.geomanDrawings) && this._map.pm) {
					console.log(`TrackPlayBack.loadSession: Restoring ${sessionData.geomanDrawings.length} Geoman drawings.`);
					sessionData.geomanDrawings.forEach(featureGeoJSON => {
						try {
							const layerStyle = (featureGeoJSON.properties && featureGeoJSON.properties.style) ? featureGeoJSON.properties.style : {};
							
							const leafletLayer = n.a.geoJSON(featureGeoJSON, { // Gebruik n.a.geoJSON
								style: function(feature) { return layerStyle; },
								pointToLayer: function (feature, latlng) {
									if (layerStyle.radius) { 
										return n.a.circleMarker(latlng, layerStyle); // Gebruik n.a.circleMarker
									}
									return n.a.marker(latlng); // Gebruik n.a.marker
								}
							}).getLayers()[0]; 

							if (leafletLayer) {
								leafletLayer.addTo(this._map);
								// Optioneel: maak bewerkbaar als je dat wilt
								// if (leafletLayer.pm && leafletLayer.pm.enable && !leafletLayer.pm.enabled()) {
								//     leafletLayer.pm.enable(leafletLayer.options.pmOptions || {});
								// }
							}
						} catch (loadErr) {
							console.error("TrackPlayBack.loadSession: Error restoring a Geoman drawing:", loadErr, featureGeoJSON);
						}
					});
					console.log("TrackPlayBack.loadSession: Geoman drawings restoration attempt complete.");
				} else {
					console.log("TrackPlayBack.loadSession: No Geoman drawings to restore or map.pm not available.");
				}

				// PRIO 3: Herstel Segment Analyse Data
				if (sessionData.analysisData && sessionData.analysisData.selectedSegments && this.segmentAnalysisHandler) {
					console.log(`TrackPlayBack.loadSession: Restoring ${sessionData.analysisData.selectedSegments.length} analysis segments.`);
					
					// Zorg dat de segmentAnalysisHandler klaar is voor nieuwe data
					this.segmentAnalysisHandler.clearComparison(); // Wis eventuele oude segmenten in de handler
					// this.segmentAnalysisHandler._selectedSegmentsForComparison = []; // Directe manipulatie, clearComparison is beter

					sessionData.analysisData.selectedSegments.forEach(segment => {
						this.segmentAnalysisHandler._selectedSegmentsForComparison.push({
							...(segment.stats || segment), 
							trackKey: segment.trackKey,
							startTime: segment.startTime,
							endTime: segment.endTime,
							highlightId: segment.highlightId,
							trackColor: segment.trackColorForHighlight 
						});

						this.highlightSegmentOnMap( // Deze methode moet bestaan op TrackPlayBack
							segment.trackKey,
							segment.startTime,
							segment.endTime,
							{
								color: segment.trackColorForHighlight,
								weight: 8,
								opacity: 0.3,
								id: segment.highlightId
							}
						);
					});
					
					this.segmentAnalysisHandler.fire('comparisonupdate', { segments: this.segmentAnalysisHandler._selectedSegmentsForComparison });
					
					if (this.segmentAnalysisHandler._selectedSegmentsForComparison.length > 0 && 
						this.segmentAnalysisHandler.displayControl) {
						this.segmentAnalysisHandler.displayControl.show();
						this.segmentAnalysisHandler.fire('statusupdate', { message: `${this.segmentAnalysisHandler._selectedSegmentsForComparison.length} segment(s) loaded.` });
					}
					console.log("TrackPlayBack.loadSession: Analysis segments restoration attempt complete.");
				} else {
					console.log("TrackPlayBack.loadSession: No analysis data to restore or segmentAnalysisHandler not available.");
				}

				console.log("TrackPlayBack.loadSession (Simplified Priority Focus): Process complete.");
				// Geen alert hier, dat kan in main-playback.js na de aanroep als je wilt.
				this.fire('sessionloaded'); // Vuur event af
			},
            // --- EINDE HIGHLIGHT ---
			})
			// Aanpassing in de Draw class _trackLayerUpdate om de highlight te tekenen
			l.prototype._trackLayerUpdate = function(){
				this._updateFrameRequested = null;
				if (!this._ctx || !this._bufferTracks) return; // Moet zijn: !this._ctx || !this._canvas
				this._clearLayer();
			
				// Teken normale tracks
				if (this._bufferTracks.length > 0) { // Moet zijn: this._bufferTracks && this._bufferTracks.length > 0
					this._bufferTracks.forEach(trackPoints => {
						if (trackPoints && trackPoints.length > 0) {
							this._drawTrack(trackPoints);
						}
					});
				}
			
				// Teken highlights
				// --- BEGIN CORRECTIE VAN SCOPE/NAAM ---
				// 'this' hier is de Draw instantie (l).
				// _segmentsToHighlight is een eigenschap van de Draw instantie.
				if (this._segmentsToHighlight && this._segmentsToHighlight.length > 0) {
					console.log("%cDraw._trackLayerUpdate: Redrawing highlights. Count: " + this._segmentsToHighlight.length, "color: blue; font-weight: bold;", JSON.parse(JSON.stringify(this._segmentsToHighlight))); // LOG A
					this._segmentsToHighlight.forEach(highlight => {
						if (highlight && highlight.points && highlight.options) {
							console.log("%cDraw._trackLayerUpdate: Calling drawSegmentHighlight for ID:", "color: blue;", highlight.id, "with options:", JSON.parse(JSON.stringify(highlight.options))); // LOG B
							this.drawSegmentHighlight(highlight.points, highlight.options); // Roep direct aan op 'this'
						} else {
							console.warn("Draw._trackLayerUpdate: Skipping highlight due to missing points or options.", highlight);
						}
					});
				}
				// --- EINDE CORRECTIE VAN SCOPE/NAAM ---
			};


			;n.a.TrackPlayBack=_,n.a.trackplayback=function(t,i,e){ return new _(t,i,e) }
	}
	])
});
//# sourceMappingURL=leaflet.trackplayback.js.map