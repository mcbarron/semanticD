/*** LICENSE *************************************************************************************
 * @title Semantic popluation analysis and decomposition
 * @author Michael Barron / Bugseed
 * @license Creative Commons Attribution-ShareAlike 3.0 Unported License; to view a copy of this
 *  ___ ____ license, visit http://creativecommons.org/licenses/by-sa/3.0/
 * | _ ) __/ You may not remove or alter this licence or attribution information.  Enhancements
 * | _ \__ \ or modifications made to this code must be shared under the same license.
 * |___/___/
 *
 *************************************************************************************************/

#var $ = require("jquery");
var BreakdownBy = require("BreakdownBy.js");

/**
 * - BASIC DEFINITIONS ------------------------------------------------------------------------------------------
 */
if (typeof String.prototype.startsWith === "undefined") {
	String.prototype.startsWith = function(prefix) { return (this.length > 0 && this.charAt(0) === prefix); };
}
if (typeof String.prototype.endsWith === "undefined") {
	String.prototype.endsWith = function(suffix) { return this.indexOf(suffix, this.length - suffix.length) !== -1; };
}

/**
 * --------------------------------------------------------------------------------------------------------------
 */
function Individual(uri, obj) {
	this.uri = uri;
	this.attributes = {};
	if (typeof obj === "undefined")  {
		// assume uri is also original object
		obj = uri;
	}
	if (obj) {
		if (obj.attributes) {
			this.attributes = obj.attributes;
		} else {
			for (var a in obj) {
				if (typeof a === "string") {
					this.attributes[a] = obj[a];
				}
			}
		}
	}
}
Individual.prototype.getAttributes = function() {
	return this.attributes;
}
/**
 * @description Provides a way to lookup an attribute by only passing a partial string (not the full URI).
 * For example, allows us to query for ":hasStatus" instead of "YOUR_SOURCE_NAMESPACE:hasStatus"
 */
Individual.prototype.attribute = function(attributeID, newAttributeValue) {
	if (typeof newAttributeValue !== "undefined") {
		// we are setting the attribute to a NEW value - be careful!!!
		this.attributes[attributeID] = newAttributeValue;
	} else if (attributeID && !this.attributes[attributeID] && attributeID.startsWith(":")) {
		// if there is not an exact match then search for an attribute that ends with the passed ID
		for (var a in this.attributes) {
			if (a.endsWith(attributeID)) {
				return this.attributes[a];
			}
		}
	}
	// return an exact match (if one exists)
	return this.attributes[attributeID];
}
Individual.prototype.getURI = function() {
	return this.uri;
}

/**
 * --------------------------------------------------------------------------------------------------------------
 */
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

/**
 * --------------------------------------------------------------------------------------------------------------
 */
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

/**
 * --------------------------------------------------------------------------------------------------------------
 */
(function($) {
	if (typeof $.fn.ontology !== "undefined") {
		// do not re-declare on multiple includes
		return;
	}

	$.fn.ontology = function(method) {
		// Method calling logic
		try {
			if (methods[method]) {
				methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if (typeof method === 'object' || !method) {
				methods.init.apply(this, arguments);
			} else {
				console.error('Method ' +  method + ' does not exist within "jQuery().ontology" namespace.');
				$.error('Method ' +  method + ' does not exist within "jQuery().ontology" namespace.');
			}
		} catch (e) {
			console.error(e);
		}
		return this;
	};

	var methods = {
		init: function(userOptions) {
			return this.each(function(){
				var jThis = $(this);
				var options = jThis.data('options');
				// If the plugin hasn't been initialized yet, initialize
				if (!options) {
					jThis.data('options', $.extend(true, {
						'filters':new Filters(),
						'cache': {}
					}, $.fn.ontology.defaults)); // define the default options
					jThis.ontology('extendOptions', userOptions); // extend any user-passed information
					jThis.data('filteredPopulation', new Population());
					jThis.addClass('ontologyRoot');
				}
			});
		},
		
		load: function(ontURL, resetBeforeLoad, clearCache) {
			return this.each(function(){
				var jThis = $(this);
				console.log("["+jThis.prop("id")+"] load: "+ontURL+"  |  resetBeforeLoad: "+resetBeforeLoad+"  |  clearCache:"+clearCache);
				var options = jThis.data('options');
				if (resetBeforeLoad) {
					jThis.ontology('reset', false, clearCache);
				}
				if (options.status[ontURL] === "loaded" && options.cache[ontURL]) {
					jThis.ontology('ontologyCallback', options.cache[ontURL], "", ontURL, {});
				} else if (options.status[ontURL] !== 'pending') {
					options.status[ontURL] = "pending";
					var jThat = jThis;
					$.ajax({
						type: "GET",
						url: ontURL,
						success: function(data, textStatus, jqXHR){
							jThat.ontology('ontologyCallback', data, textStatus, ontURL, jqXHR);
						},
						error: function(jqXHR, textStatus, errorThrown) {
							jThat.ontology('ontologyCallbackError', errorThrown, textStatus, ontURL, jqXHR);
						}
					});
				}
			});
		},

		reset: function(updateFilteredPopulation, clearCache) {
			return this.each(function(){
				var jThis = $(this);
				console.log("["+jThis.prop("id")+"] reset: updateFilteredPopulation: "+updateFilteredPopulation+"  |  clearCache: "+clearCache);
				var options = jThis.data('options');
				jThis.removeData('population');
				jThis.removeData('filteredPopulation');
				options.filters.reset();
				if (clearCache) {
					options.cache = {};
					options.status = {};
				}
				if (updateFilteredPopulation) {
					// Update the filtered population
					jThis.ontology('updateFilteredIndividuals');
				}
			});
		},

		extendOptions: function(newOptions) {
			return this.each(function(){
				var jThis = $(this);
				if (typeof newOptions === "object") {
					$.extend(jThis.data('options'), newOptions);
				}
			});
		},
		
		ontologyCallback: function(data, textStatus, ontURL, jqXHR) {
			return this.each(function(){
				var jThis = $(this);

				var options = jThis.data('options');
				options.status[ontURL] = 'loaded';
				options.cache[ontURL] = data;
				var population = jThis.data('population');
				if (!population) {
					population = new Population();
					jThis.data('population', population);
				}
				var incomingOnt = eval('('+data+')');
				for (var i in incomingOnt.individuals) {
					population.addIndividual(incomingOnt.individuals[i]);
				}

				// RETURN immediately if we have any pending ontologies that havne't loaded yet.
				for (var s in options.status) {
					if (options.status[s] === "pending") {
						return;
					}
				}

				// Update the filtered population
				jThis.ontology('updateFilteredIndividuals');

				// Perform any defined callbacks
				if (typeof options.onloadCallback === 'function') {
					options.onloadCallback.call(jThis, population, options);
				}
			});
		},

		ontologyCallbackError: function(errorThrown, textStatus, ontURL, jqXHR) {
			return this.each(function(){
				var jThis = $(this);
				var options = jThis.data('options');
				options.status[ontURL] = 'error';
				alert("Error retriving '"+ontURL+"' ontology.\n" + errorThrown + "\n" + textStatus);
				jThis.ontology('updateFilteredIndividuals');
			});
		},
		
		addPopulation: function(pop) {
			return this.each(function(){
				var jThis = $(this);

				var options = jThis.data('options');
				var population = jThis.data('population');
				if (!population) {
					population = new Population();
					jThis.data('population', population);
				}
				population.mergeIn(pop);

				// RETURN immediately if we have any pending ontologies that havne't loaded yet.
				for (var s in options.status) {
					if (options.status[s] === "pending") {
						return;
					}
				}

				// Update the filtered population
				jThis.ontology('updateFilteredIndividuals');

				// Perform any defined callbacks
				if (typeof options.onloadCallback === 'function') {
					options.onloadCallback.call(jThis, population, options);
				}
			});
		},
		
		updateFilteredIndividuals: function() {
			return this.each(function(){
				var jThis = $(this);
				var options = jThis.data('options');
				var population = jThis.data('population');
				if (population) {
					var filteredPopulation = population.filter(options.filters);
					jThis.data('filteredPopulation', filteredPopulation);

					if (typeof options.onpopulationChangeCallback === 'function') {
						options.onpopulationChangeCallback.call(jThis, filteredPopulation, options);
					}
				}
			});
		},

		addFilter: function(attributeID, attributeValue, updateFilteredPopulation) {
			// If the attribute ID isn't present then ignore - it's nonesense
			if (!attributeID) {
				return this;
			}
			return this.each(function(){
				var jThis = $(this);
				var options = jThis.data('options');
				options.filters.addFilter(attributeID, attributeValue);
				if (updateFilteredPopulation) {
					jThis.ontology('updateFilteredIndividuals');
				}
			});
		},
		
		setFilters: function(newFilters, updateFilteredPopulation) {
			// If the attribute ID isn't present then ignore - it's nonesense
			if (typeof newFilters !== "object" && newFilters.constructor !== "Filter") {
				return this;
			}
			return this.each(function(){
				var jThis = $(this);
				var options = jThis.data('options');
				options.filters = newFilters;
				if (updateFilteredPopulation) {
					jThis.ontology('updateFilteredIndividuals');
				}
			});
		},

		removeFilter: function(attributeID, attributeValue, updateFilteredPopulation) {
			return this.each(function(){
				var jThis = $(this);
				var options = jThis.data('options');
				options.filters.removeFilter(attributeID, attributeValue);
				if (updateFilteredPopulation) {
					jThis.ontology('updateFilteredIndividuals');
				}
			});
		},

		removeAllFilters: function(updateFilteredPopulation) {
			return this.each(function(){
				var jThis = $(this);
				jThis.data('options').filters.reset();
				if (updateFilteredPopulation) {
					jThis.ontology('updateFilteredIndividuals');
				}
			});
		},

		debug: function(destinationElem) {
			return this.each(function(){
				var jThis = $(this);
				var options = jThis.data('options');
				var jElem = $(destinationElem);
				if (jElem.length === 0) {
					jElem = jThis.find(".debug:first");
					if (jElem.length === 0) {
						jThis.append("<div class='debug'></div>");
						jElem = jThis.find(".debug:first");
					}
				}
				jElem.empty();
				var individualsTable = "<div>";
				var population = jThis.data('population');
				individualsTable += "<h3>Matched Count: "+population.getSize()+"</h3>";
				for (var uri in population.getIndividuals()) {
					var ind = population.get(uri);
					individualsTable += "<table class='individual'>";
					individualsTable += "<tr><th colspan='2' style='overflow:ellipsis;'>"+uri+"</th></tr>";
					for (var a in ind.getAttributes()) {
						individualsTable += "<tr><td class='attributeLabel'>"+a+"</td><td>"+ind.attribute(a)+"</td></tr>";
					}
					individualsTable += "</table>";
				}
				individualsTable += "</div>";
				jElem.append(individualsTable);
				jElem.show();
			});
		}

	};

	$.fn.ontology.defaults = {
		onloadCallback: undefined,
		onpopulationChangeCallback: undefined,
		status: {},
		colorLookup: {
			'':''
		},
		defaultColors: [
		'#94D6CE', '#087B7B',
		'#94D639', '#527B10',
		'#94D6E7', '#0084A5',
		'#6373B5', '#082984',
		'#B552AD', '#730063',
		'#FF9473', '#AD0000',
		'#FFB573', '#AD4A18',
		'#D6C610', '#635208',
		'#7BC66B', '#186321',
		'#9C7BBD', '#29006B'
		],
		defaultColorIndex: 0
	};

	$.fn.ontology.util = {
		getColumnColor: function(options, columnTitle, alternateLookup) {
			if (options.colorLookup[columnTitle] !== undefined && options.colorLookup[columnTitle] !== '') {
				return options.colorLookup[columnTitle];
			} else if (options.colorLookup[alternateLookup] !== undefined && options.colorLookup[alternateLookup] !== '') {
				return options.colorLookup[alternateLookup];
			} else {
				if (options.defaultColors.length <= options.defaultColorIndex) {
					options.defaultColorIndex = 0;
				}
				return options.defaultColors[options.defaultColorIndex++];
			}
		}
	};

})(jQuery);

/**
 * --- GENERAL FUNCTIONS ----------------------------------------------------------------------------------------
 */
/**
 * @return Array of the keys.  Specifying a "fixedOrder" will override the natural order of matched keys.
 */
function getOrderedKeys(obj, fixedOrder) {
	var i, forcedSort = [], regularSort = [];
	if (fixedOrder !== undefined) {
		for (i = 0; i < fixedOrder.length; i++) {
			if (obj[fixedOrder[i]] !== undefined) {
				forcedSort.push(fixedOrder[i]);
			}
		}
	}
	for (i in obj) {
		if (!obj.hasOwnProperty(i)) {
			continue;
		}
		if (fixedOrder !== undefined) {
			if (jQuery.inArray(i, forcedSort) < 0) {
				// only insert to return array if it doesn't already exist
				regularSort.push(i);
			}
		} else {
			// always push
			regularSort.push(i);
		}
	}
	return forcedSort.concat(regularSort.sort());
}

/**
 * @return Array with any elements matching the fixed order passed first (and in order).  The remaining elements will also be sorted.
 */
function getOrderedArray(arr, fixedOrder, sortFunction) {
	var i, forcedSort = [], regularSort = [];
	if (typeof sortFunction === "function") {
		arr.sort(sortFunction);
	}
	if (fixedOrder !== undefined) {
		for (i = 0; i < fixedOrder.length; i++) {
			if (jQuery.inArray(fixedOrder[i], arr) >= 0) {
				forcedSort.push(fixedOrder[i]);
			}
		}
	}
	for (i = 0; i < arr.length; i++) {
		if (fixedOrder !== undefined) {
			if (jQuery.inArray(arr[i], forcedSort) < 0) {
				// only insert to return array if it doesn't already exist
				regularSort.push(arr[i]);
			}
		} else {
			// always push
			regularSort.push(i);
		}
	}
	return forcedSort.concat(regularSort.sort());
}

function roundNumber(num, dec, zeroPadded) {
	dec = (typeof dec !== "undefined") ? dec : 2; // default to 2 decimal places
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	if (zeroPadded) {
		result = result.toString()
		if (dec > 0) {
			if (result.indexOf('.') < 0) {
				result = result+".";
			}
			while (result.length - result.indexOf('.') <= dec) {
				result = result+"0";
			}
		}
	}
	return result;
}

function getNumberPrefix(ind) {
	if (ind.attribute(':hasDataType') === "Dollar") {
		return '$'
	}
	return '';
}
function getNumberSuffix(ind) {
	if (ind.attribute(':hasDataType') === "Percent") {
		return '%';
	} else if (ind.attribute(':hasDataType') === "Dollar" && ind.attribute(':hasDisplayLabel')) {
		return ind.attribute(':hasDisplayLabel');
	}
	return '';
}
function getNumberValue(ind, valueAttribute, returnFormattedString) {
	var value = ind.attribute(valueAttribute);
	if (ind.attribute(':hasDataType') === "Percent") {
		return roundNumber(100 * value, ind.attribute(':hasDataPrecision'), returnFormattedString);
	} else {
		return roundNumber(value, ind.attribute(':hasDataPrecision'), returnFormattedString);
	}
}
function getNumberFormatted(ind, valueAttribute, returnFormattedString) {
	var numberValue = getNumberValue(ind, valueAttribute, returnFormattedString);
	if (isNaN(numberValue)) {
		return "n/a";
	}
	return getNumberPrefix(ind) + addCommas(numberValue) + getNumberSuffix(ind);
}

function addCommas(num) {
	if (typeof num === "number") {
		num = num.toString();
	}
	if (typeof num === "string") {
		if (num.indexOf('.') < 0) {
			num = num.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
		} else {
			// split the number to make sure we don't add commas to the right of the decimal place
			var numSplit = num.split('.');
			num = numSplit[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '.' + numSplit[1];
		}
	}
	return num;
}

