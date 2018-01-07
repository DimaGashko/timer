﻿(function(){
	'use strict';
	
	function Stopwatch() {
		ITimerBase.apply(this, arguments);
	}
	
	var fnBase = ITimerBase.prototype;
	Stopwatch.prototype = Object.create(fnBase);
	
	var fn = Stopwatch.prototype;
	fn.constructor = Stopwatch;
	
	fn.nextPeriod = function() {
		this.updateTime();
		this.renderTime();
	};
	
	fn.start = function() {
		var answer = fnBase.start.apply(this, arguments);
		if (answer === 'return') return this;
		
		if (!this.timeStart) {
			this.timeStart = Date.now();
		}
		
		if (this.startPaused) {
			this.timeStart += Date.now() - this.startPaused;
		}
		
		return this;
	};
	
	fn.stop = function() {	
		var answer = fnBase.stop.apply(this, arguments);
		if (answer === 'return') return this;
		
		return this;
	};
	
	fn._stop = function() {
		var answer = fnBase._stop.apply(this, arguments);
		if (answer === 'return') return this;
		
		this.startPaused = Date.now();
	};
	
	fn.lap = function() {
		if (!this._running) return;
		
		var lap = this.formatTime(this.h, 2) + ':'
			+ this.formatTime(this.m, 2) + ':'
			+ this.formatTime(this.s, 2) + '.'
			+ this.formatTime(this.ms, 3);
		
		this.laps.push(lap);
		
		this._renderLap(this.laps, this.laps.length - 1);
		
		return this;
	};
	
	fn.reset = function() {
		var answer = fnBase.reset.apply(this, arguments);
		if (answer === 'return') return this;
		
		this.timeStart = 0;
		this.startPaused = 0;
		
		this.laps.length = 0; //Очищаем массив так, что бы массив остался тот же
		//И если на него делали ссылки, что бы они остались актуальными
			
		this.els.lapsList.innerHTML = '';
		
		return this;
	};
	
	fn._renderLap = function(laps, index) {
		var html = this._tmpls.lap(laps[index], index);
		this.els.lapsList.insertAdjacentHTML('afterbegin', html);
	};
	
	fn.updateTime = function() {
		var date = new Date(Date.now() - this.timeStart);
		
		this.h = date.getUTCHours();
		this.m = date.getUTCMinutes();
		this.s = date.getUTCSeconds();
		this.ms = date.getUTCMilliseconds();
	};
	
	fn._initEvents = function() {
		this.els.start.addEventListener('click', () => {
			if (!this._disable) this.start();
		});
		
		this.els.stop.addEventListener('click', () => {
			if (!this._disable) {
				this.lap();
				this.stop();
			}
		});
		
		this.els.lap.addEventListener('click', () => {
			if (!this._disable) this.lap();
		});
		
		this.els.reset.addEventListener('click', () => {
			if (!this._disable) this.reset();
		});
		
		document.addEventListener('keyup', (event) => {
			if (this._disable) return; 
			
			switch (event.keyCode) {
				
			case this.KEYS.start: 
				event.preventDefault();
				if (this._running) this.lap();
				this.toggleStart();
				break;
				
			case this.KEYS.lap:
				if (event.altKey) {
					event.preventDefault();
					this.lap();
				}
				break;
				
			case this.KEYS.reset:
				if (event.altKey) {
					event.preventDefault();
					this.reset();
				}
				break;
				
			default: break;
			}
		});
		
		document.addEventListener('keydown', (event) => {
			if (this._disable) return;
			
			switch (event.keyCode) {
				
			case this.KEYS.start: 
				event.preventDefault();
				break;
				
			case this.KEYS.lap:
				if (event.altKey) event.preventDefault();
				break;
				
			case this.KEYS.reset:
				if (event.altKey) event.preventDefault();
				break;
				
			default: break;
			}
		});
	};
	
	fn._getElements = function() {
		fnBase._getElements.apply(this, arguments);
		
		this.els.lap = this.els.root.querySelector('.iTimer__lap');
		this.els.lapsList = this.els.root.querySelector('.iTimer__lapslist');
	};
	
	fn._createParametrs = function() {
		fnBase._createParametrs.apply(this, arguments);
		
		this.timeStart = 0;
		this.startPaused = 0;
		
		this.laps = [];
	};
	
	fn.iTimerType = 'stopwatch';
	
	fn.KEYS = {
		start: 32,
		lap: 76,
		reset: 82,
	};
	
	fn._tmpls = {
		
		lap: function(lap, index) {
			return `<li class="iTimer__lapItem">Замер №${index + 1}. ${lap}</li>`;
		},
		
		lapsList: function(laps) {
			return `
				${laps.slice()
					.reverse()
					.map((item, i) => this.lap(item, (laps.length - i - 1) % laps.length))
					.join('')}
			`;
		};
		
	};
	
	window.Stopwatch = Stopwatch;
}());