function Population(existing) {
	this.individuals = {};
	this.attributes = {};
	this.size = 0;
	this.first = undefined;
	this.last = undefined;
	if (typeof existing === "object") {
		if (typeof existing.getIndividuals === "function") {
			// This is an existing Population - add each individual to our collective
			for (var uri in existing.individuals) {
				this.addIndividual(existing.individuals[uri]);
			}
		} else {
			this.mergeIn(existing);
		}
	}
}
/**
 * @description Adds an individual to this population
 * You can either pass a single argument of type "Individual" or a raw object itself.
 * Raw objects are added as if they are "new" (so duplicates may be created if you are not careful)
 */
Population.prototype.addIndividual = function(ind) {
	var uri, attributeID, aValue;
	if (ind instanceof Individual) {
		uri = ind.getURI();
	} else {
		// Add as a new entry
		uri = "_id_"+this.size;
		ind = new Individual(uri, ind);
	}
	if (!this.individuals[uri]) {
		// This is a new individual for this population
		this.size++;
		this.last = uri;
		if (!this.first) {
			this.first = uri;
		}
	}
	this.individuals[uri] = ind;
	// Keep track of all the attributes and values that are actually present in the individual population
	for (attributeID in ind.getAttributes()) {
		aValue = ind.attribute(attributeID);
		if (typeof aValue === "string") {
			if (this.attributes[attributeID] === undefined) {
				this.attributes[attributeID] = {};
			}
			if (this.attributes[attributeID][aValue] === undefined) {
				this.attributes[attributeID][aValue] = 1;
			} else {
				this.attributes[attributeID][aValue]++;
			}
		}
	}
	// Now record the missing attributes of this individual
	for (attributeID in this.attributes) {
		if (ind.attribute(attributeID) === undefined) {
			this.attributes[attributeID][""] = 0;
		}
	}
	return ind;
};
/**
 * Merges the population in (we can simply extend since it's an existing population)
 */
Population.prototype.mergeIn = function(pop) {
	if (pop.individuals) {
		for (var uri in pop.individuals) {
			if (typeof uri === "string") {
				this.addIndividual(pop.get(uri));
			}
		}
	} else {
		// Unknown population structure, assume regular objects and seek out attributes.
		if (Array.isArray(pop)) {
			for (var i in pop) {
				this.addIndividual(pop[i]);
			}
		}
	}
}
/**
 * @return Returns the individual identified by the URI
 */
Population.prototype.get = function(uri) {
	var ind = this.individuals[uri];
	if (ind) {
		return ind;
	}
	if (uri.startsWith("#") || uri.startsWith(":")) {
		// Try looking up the individual by it's pound-hashed URI
		for (var i in this.individuals) {
			if (typeof i === "string" && i.endsWith(uri)) {
				return this.individuals[i];
			}
		}
	}
	return null;
};
/**
 * @return Returns the total number of UNIQUE individuals in this population
 */
Population.prototype.getSize = function() {
	return this.size;
};
/**
 * @return Simple check to see if there are any individuals
 */
Population.prototype.hasIndividuals = function() {
	return this.size > 0;
};
/**
 * @return Returns an object that can be interated using the "for (var ind in population.getIndividuals())" where "ind" will be the URI of the individual.  See "get()" to retrieve the individual itself.
 */
Population.prototype.getIndividuals = function() {
	return this.individuals;
};
/**
 * @return Returns the FIRST individual added to the population (if any)
 */
Population.prototype.getFirst = function() {
	if (this.hasIndividuals()) {
		return this.get(this.first);
	}
	return undefined;
};
/**
 * @return Returns the LAST individual added to the population (if any)
 */
Population.prototype.getLast = function() {
	if (this.hasIndividuals()) {
		return this.get(this.last);
	}
	return undefined;
};
Population.prototype.getAttributes = function(attributeID) {
	if (typeof attributeID === "string") {
		if (this.attributes[attributeID]) {
			return this.attributes[attributeID];
		}
		if (attributeID.startsWith("#") || attributeID.startsWith(":")) {
			// Try looking up the individual by it's pound-hashed URI
			for (var a in this.attributes) {
				if (typeof a === "string" && a.endsWith(attributeID)) {
					return this.attributes[a];
				}
			}
		}
	}
	return {};
};
Population.prototype.getAttributeValues = function(attributeID) {
	var rv = [];
	if (typeof attributeID === "string") {
		var attributeObj = this.getAttributes(attributeID);
		if (typeof attributeObj === "object") {
			for (var key in attributeObj) {
				rv.push(key);
			}
		}
	}
	return rv;
};
/**
 * @description Returns a new population composed of the members that match the passed filter
 */
Population.prototype.filter = function(filtersOrFilterProp, optionalFilterValue) {
	var rv = new Population();
	var filters;
	if (filtersOrFilterProp instanceof Filters) {
		filters = filtersOrFilterProp;
	} else {
		if (typeof filtersOrFilterProp === "string" && typeof optionalFilterValue === "string") {
			filters = new Filters();
			filters.addFilter(filtersOrFilterProp, optionalFilterValue);
		} else {
			throw "You must either pass a Filters object or a (string) Property and Value to Popoulation.filter()";
		}
	}
	for (var uri in this.getIndividuals()) {
		var individual = this.get(uri);
		if (filters.isIndividualVisible(individual)) {
			rv.addIndividual(individual);
		}
	}
	return rv;
};
/**
 * @description 
 * @return a BreakdownBy object containing the individuals, broken down by the requested attribute.  Note that the jQuery object is NOT returned!!!
 */
Population.prototype.breakdownBy = function(attributeID) {
	var rv = new BreakdownBy(attributeID);
	var aValue,ind;
	if (typeof attributeID === "string") {
		for (ind in this.getIndividuals()) {
			aValue = this.get(ind).attribute(attributeID);
			if (typeof aValue === "undefined") {
				aValue = '';
			}
			rv.get(aValue, true).addIndividual(this.get(ind));
		}
	}
	return rv;
};
/**
 * @description Averages the values of an attribute across all individuals in a given population
 * @return a number (or undefined if no individuals are in the population)
 */
Population.prototype.getAverage = function(attributeId, includeUndefines) {
	var aValue, rv = [];
	for (var ind in this.getIndividuals()) {
		aValue = this.get(ind).attribute(attributeId);
		if (typeof aValue === "undefined") {
			if (!includeUndefines) {
				continue; // ignore individuals with undefined attributes
			} else {
				aValue = '';
			}
		}
		rv.push(aValue);
	}
	if (rv.length === 0) {
		return undefined;
	}
	var total = 0;
	for (var i = 0; i < rv.length; i++) {
		if (rv[i] && rv[i] !== '') {
			try {
				total += parseFloat(rv[i]);
			} catch (e) {
				console.log("The value '"+rv[i]+"' for attribute '"+attributeId+"' could not be parsed as a number to calculate the average: "+e);
			}
		}
	}
	return total / rv.length;
};
/**
 * @description Returns the median value of an attribute across all individuals in a given population
 * @return a number (or undefined if no individuals are in the population with the attribute as passed)
 */
Population.prototype.getMedian = function(attributeId) {
	var aValue, rv = [];
	for (var ind in this.getIndividuals()) {
		aValue = this.get(ind).attribute(attributeId);
		if (typeof aValue === "undefined") {
			continue; // ignore individuals with undefined attributes
		}
		try {
			rv.push(parseFloat(aValue));
		} catch (e) {
			console.log("The values '"+aValue+"' for attribute '"+attributeId+"' on individual '"+ind+"' could not be parsed as a number to calculate the median: "+e);
		}
	}
	if (rv.length === 0) {
		return undefined;
	}
	if (rv.length === 1) {
		return rv[0];
	}
	rv.sort(function(a,b){return a - b;});
	if (rv.length % 2 === 0) {
		// Even number of elements; average two near midpoint
		var midpoint = (rv.length/2);
		return (rv[midpoint] + rv[midpoint-1])/2;
	} else {
		return parseFloat(rv[Math.floor(rv.length/2)]);
	}
};
/**
 * @description Sums the values of an attribute across all individuals in a given population
 * @return a number (the number zero will be returned if no individuals exist in the population)
 */
Population.prototype.getSum = function(attributeId) {
	var aValue, rv = 0;
	for (var ind in this.getIndividuals()) {
		aValue = this.get(ind).attribute(attributeId);
		if (aValue && aValue !== '') {
			try {
				rv += parseFloat(aValue);
			} catch (e) {
				console.log("The value '"+aValue+"' for attribute '"+attributeId+"' could not be parsed as a number to calculate the sum: "+e);
			}
		}
	}
	return rv;
};
/**
 * @description Find the largest number for the given attribute
 * @return a number (or undefined will be returned if no individuals exist in the population)
 */
Population.prototype.getMax = function(attributeId) {
	var aValue, rv = undefined;
	for (var ind in this.getIndividuals()) {
		aValue = this.get(ind).attribute(attributeId);
		if (aValue && aValue !== '') {
			try {
				aValue = parseFloat(aValue);
				if (!rv || aValue > rv) {
					rv = aValue;
				}
			} catch (e) {
				console.log("The value '"+aValue+"' for attribute '"+attributeId+"' could not be parsed as a number to calculate the max: "+e);
			}
		}
	}
	return rv;
};
/**
 * @description Find the smallest number for the given attribute
 * @return a number (or undefined will be returned if no individuals exist in the population)
 */
Population.prototype.getMin = function(attributeId) {
	var aValue, rv = undefined;
	for (var ind in this.getIndividuals()) {
		aValue = this.get(ind).attribute(attributeId);
		if (aValue && aValue !== '') {
			try {
				aValue = parseFloat(aValue);
				if (!rv || aValue < rv) {
					rv = aValue;
				}
			} catch (e) {
				console.log("The value '"+aValue+"' for attribute '"+attributeId+"' could not be parsed as a number to calculate the min: "+e);
			}
		}
	}
	return rv;
};
