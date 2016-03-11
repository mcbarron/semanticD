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
