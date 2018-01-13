﻿;(function(){
   "use strict"
   
   function Timer() {
      ITimerBase.apply(this, arguments);
   }
   
   var fnBase = ITimerBase.prototype;
   Timer.prototype = Object.create(fnBase);
   
   var fn = Timer.prototype;
   fn.constructor = Stopwatch;
   
   fn.nextPeriod = function() {
      this.updateTime();
      this.renderTime();
   }
   
   fn._init = function() {
      if (this._running) return this;
      fnBase._init.apply(this, arguments);
      
      this.showSet();
   }
   
   fn.start = function() {
      if (this._running) return this;
      this.saveTime();
      
      if (this.allTime <= 0) {
         this.editTime();
         return;
      }
      
      this.startTime += Date.now() - this.pausedStart;
      
      fnBase.start.apply(this, arguments);
      
      return this;
   }
   
   fn.stop = function() {      
      if (!this._running) return this;
      fnBase.stop.apply(this, arguments);
      
      this.pausedStart = Date.now();
      
      return this;
   }
   
   fn.updateTime = function() {      
      var allMs = this.allTime - (Date.now() - this.startTime)
      
      if (allMs <= 0) {
         this.end();
         return;
      }
      
      var date = new Date(allMs);
      
      this.m = date.getUTCMinutes();
      this.s = date.getUTCSeconds();
      this.ms = date.getUTCMilliseconds();
      
      this.h = allMs - (this.m*60*1000) - (this.s*1000) - this.ms;
      this.h = Math.floor(this.h / (60*60*1000) );
   }
   
   fn.end = function() {
      this.stop();
      this.reset();
      this.renderTime();
      
      setTimeout(() => {
         alert('End!');
         this.showSet();
      }, 50);
   }
   
   fn.reset = function() {
      fnBase.reset.apply(this, arguments);
      
      this.startTime = 0;
      this.pausedStart= 0;
      this.allTime = 0;
      
      return this;
   }
   
   fn.updateAllTime = function() {
      this.allTime = this.h*60*60*1000 
         + this.m*60*1000 
         + this.s*1000 
         + this.ms;
   }
   
   fn.readSetTime = function() {
      this.h = +this.els.set.h.value;
      this.m = +this.els.set.m.value;
      this.s = +this.els.set.s.value;
      this.ms = +this.els.set.ms.value;
   }
   
   fn.writeSetTime = function() {
      this.els.set.h.value = this.h;
      this.els.set.m.value = this.m;
      this.els.set.s.value = this.s;
      this.els.set.ms.value = this.ms;
   }
   
   fn.showSet = function() {
      this.els.root.classList.add('timer-set');
   }
   
   fn.hideSet = function() {
      this.els.root.classList.remove('timer-set');
   }
   
   fn.saveTime = function() {
      this.reset();
      this.hideSet();
      this.readSetTime();
      this.renderTime();
      this.updateAllTime(); 
   }
   
   fn.cancelSet = function() {
      this.hideSet();
   }
   
   fn.editTime = function() {
      this.stop();
      this.writeSetTime();
      this.showSet();
   }
   
   fn._initEvents = function() {     
      this.els.start.addEventListener('click', () => {
         if (this._disable) return;
         this.start();
      });
      
      this.els.stop.addEventListener('click', () => {
         if (this._disable) return;
         this.stop();
      });
      
      this.els.reset.addEventListener('click', () => {
         if (this._disable) return;
         
         this.reset();
         this.writeSetTime();
         this.editTime();
      });
      
      this.els.edit.addEventListener('click', () => {
         this.editTime();
      });
      
      this.els.save.addEventListener('click', () => {
            this.saveTime();
      });
      
      this.els.cancel.addEventListener('click', () => {
         this.cancelSet();
      });
      
      document.addEventListener('keyup', (event) => {
         if (this._disable) return; 
         
         switch (event.keyCode) {               
            case this.KEYS.start: 
               event.preventDefault();
               this.toggleStart();
               break;
               
            case this.KEYS.reset:
               if (!event.altKey) return;
               event.preventDefault();
               
               this.reset();
               this.writeSetTime();
               this.editTime();
               
               break;
               
            case this.KEYS.edit:
               if (!event.altKey) return;
               event.preventDefault();
               
               this.editTime();
               break;
               
            case this.KEYS.save:
               event.preventDefault();
               
               this.saveTime();
               break;
               
            case this.KEYS.cancel:
               event.preventDefault();
               
               this.cancelSet();
               break;
               
            case this.KEYS.editH:
               this._focusEditComponent('h');
               break;
            
            case this.KEYS.editM:
               this._focusEditComponent('m');
               break;
               
            case this.KEYS.editS:
               this._focusEditComponent('s');
               break;
               
            case this.KEYS.editMs:
               this._focusEditComponent('ms');
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
               
            case this.KEYS.reset:
            case this.KEYS.edit:
               if (event.altKey) event.preventDefault();
               break;
               
            case this.KEYS.editH:
            case this.KEYS.editM:
            case this.KEYS.editS:
            case this.KEYS.editMs:
               event.preventDefault();
               break;
               
            default: break;
         }
      });
   }
   
   fn._focusEditComponent = function(key) {
      this.editTime();
      this.els.set[key].focus();
   }
   
   fn._getElements = function() {
      fnBase._getElements.apply(this, arguments);
      var r = this.els.root;
      
      this.els.save = r.querySelector('.timer__save');
      this.els.edit = r.querySelector('.timer__edit');
      this.els.cancel = r.querySelector('.timer__cancel');
      
      var set = this.els.set = {};
      set.h = r.querySelector('.timer__seth');
      set.m = r.querySelector('.timer__setm');
      set.s = r.querySelector('.timer__sets');
      set.ms = r.querySelector('.timer__setms');
   }
   
   fn._createParametrs = function() {
      fnBase._createParametrs.apply(this, arguments);
      
      this.allTime = 0; //Оставшееся время в миллисекундах
      this.startTime = 0;
      this.pausedStart = 0;
   }
   
   fn.KEYS = {
      start: 32,
      reset: 82,
      cancel: 27,
      edit: 69,
      save: 13,
      editH: 112,
      editM: 113,
      editS: 114,
      editMs: 115,
   }
   
   fn._tmpls = {
         
         
      
   }
   
   fn.iTimerType = 'timer';
   
   window.Timer = Timer;
}());