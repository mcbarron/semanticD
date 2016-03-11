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

