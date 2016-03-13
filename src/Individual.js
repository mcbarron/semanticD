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
