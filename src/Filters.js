function Filters(existing) {
	this.filters = {};
	this.filterCounts = {};
	this.totalCount = 0;
	if (typeof existing === "object") {
		jQuery.extend(this, existing);
	}
	return this;
}
Filters.prototype.reset = function() {
	this.filters = {};
	this.filterCounts = {};
	this.totalCount = 0;
	return this;
}
Filters.prototype.getFilters = function() {
	return this.filters;
}
Filters.prototype.getFilterValues = function(filterID) {
	var rv = [];
	if (this.hasFilter(filterID)) {
		for (var f in this.filters[filterID]) {
			rv.push(f);
		}
	}
	return rv;
}
Filters.prototype.hasFilters = function() {
	return (this.totalCount > 0);
}
Filters.prototype.hasFilter = function(filterID, filterValue) {
	if (filterValue === undefined) {
		// If no value is passed then just check to see if ANY filter exists
		return (this.filters[filterID] !== undefined && this.filterCounts[filterID] > 0);
	} else {
		return (this.filters[filterID] !== undefined && this.filters[filterID][filterValue] === true);
	}
}
/**
 * @return 
 */
Filters.prototype.addFilter = function(filterID, filterValue) {
	// If the filter ID isn't present then ignore - it's impossible to filter on an undefined attribute.
	if (typeof filterID === "undefined") {
		return false;
	}
	if (this.filters[filterID] === undefined) {
		this.filters[filterID] = {};
		this.filterCounts[filterID] = 0;
	}
	if (typeof filterValue === 'object') {
		for (var fValue in filterValue) {
			if (this.filters[filterID][fValue] !== true) {
				this.filters[filterID][fValue] = true;
				this.filterCounts[filterID]++;
				this.totalCount++;
			}
		}
	} else {
		if (this.filters[filterID][filterValue] !== true) {
			this.filters[filterID][filterValue] = true;
			this.filterCounts[filterID]++;
			this.totalCount++;
		}
	}
	return this;
}
Filters.prototype.removeFilter = function(filterID, filterValue) {
	if (filterID && this.filters[filterID] !== undefined) {
		if (typeof filterValue === "undefined") {
			// remove ALL keys
			for (var k in this.filters[filterID]) {
				this.removeFilter(filterID, k);
			}
		} else if (this.filters[filterID][filterValue] !== undefined) {
			delete this.filters[filterID][filterValue];
			this.filterCounts[filterID]--;
			this.totalCount--;
			if (this.filterCounts[filterID] === 0) {
				delete this.filters[filterID];
				delete this.filterCounts[filterID];
			}
		}
	}
	return this;
}
Filters.prototype.isIndividualVisible = function(individual) {
	for (var filterID in this.filters) {
		var iValue = individual.attribute(filterID);
		// Undefined values should be treated as empty strings
		if (iValue === undefined) {
			iValue = "";
		}
		var filterMatch = this.filters[filterID][iValue];
		if (filterMatch === true) { // || (filterMatch === 'fuzzy')) { // TODO - for now we just continue... must do work to make fuzzy functional
		// continue checking other filters
		} else {
			// This individual does not match the filter - stop now and return false
			return false;
		}
	}
	return true;
};
