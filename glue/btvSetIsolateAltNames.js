var seqObjs = glue.tableToObjects(glue.command(["list", "sequence", "-w", "source.name = 'ncbi-curated' and gb_isolate != null", "sequenceID", "gb_isolate", "isolate.id"]));

var isolateIDToAltNames = {};

_.each(seqObjs, function(seqObj) {
	var isolateID = seqObj["isolate.id"];
	if(isolateID != null) {
		var altNames = isolateIDToAltNames[isolateID];
		if(altNames == null) {
			altNames = [];
			isolateIDToAltNames[isolateID] = altNames;
		}
		altNames.push(seqObj.gb_isolate);
	}
});

_.each(_.pairs(isolateIDToAltNames), function(pair) {
	var isolateID = pair[0];
	var altNames = _.uniq(pair[1]);
	glue.inMode("custom-table-row/isolate/"+isolateID, function() {
		var displayName = glue.command(["show", "property", "display_name"]).propertyValueResult.value;
		altNames = _.without(altNames, displayName);
		if(altNames.length > 0) {
			glue.command(["set", "field", "alt_names", altNames.join(";")]);
		}
	});
	
});