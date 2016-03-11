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
