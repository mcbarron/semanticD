/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	function BreakdownBy(breakdownAttribute) {
		this.breakdownAttribute = breakdownAttribute;
		this.size = 0;
		this.popLookup = {};
		this.pops = [];
		this.keys = [];
	}
	BreakdownBy.prototype.getSize = function() {	
		return this.size;
	}
	BreakdownBy.prototype.getBreakdownAttribute = function() {	
		return this.breakdownAttribute;
	}
	BreakdownBy.prototype.get = function(key, addIfNotPresent) {
		if (addIfNotPresent && !this.popLookup.hasOwnProperty(key)) {
			this.size++;
			this.pops.push(this.popLookup[key] = new Population());
			this.keys.push(key);
		}
		return this.popLookup[key];
	}
	BreakdownBy.prototype.getKeys = function() {
		return this.keys;
	}
	BreakdownBy.prototype.getPops = function() {
		return this.pops;
	}
	BreakdownBy.prototype.getOrderedKeys = function(fixedOrder) {
		if (fixedOrder !== undefined) {
			var i, forcedSort = [], regularSort = [];
			for (i = 0; i < fixedOrder.length; i++) {
				if (this.popLookup[fixedOrder[i]] !== undefined) {
					forcedSort.push(fixedOrder[i]);
				}
			}
			for (i = 0; i < this.keys.length; i++) {
				if (fixedOrder !== undefined) {
					if (jQuery.inArray(this.keys[i], forcedSort) < 0) {
						// only insert to return array if it doesn't already exist
						regularSort.push(this.keys[i]);
					}
				} else {
					// always push
					regularSort.push(this.keys[i]);
				}
			}
			return forcedSort.concat(regularSort.sort());
		} else {
			return this.keys.slice(0).sort();
		}
	}
	BreakdownBy.prototype.getPopSizes = function() {
		var rv = {};
		for (var i = 0; i < this.pops.length; i++) {
			rv[this.keys[i]] = this.pops[i].getSize();
		}
		return rv;
	}


/***/ }
/******/ ]);