var seqObjs = glue.tableToObjects(glue.command(["list", "sequence", "-w", "source.name = 'ncbi-curated' and gb_isolate != null", "sequenceID", "gb_isolate", 
                                     "isolate_seg_1.id", "isolate_seg_2.id", "isolate_seg_3.id", "isolate_seg_4.id", "isolate_seg_5.id", 
                                     "isolate_seg_6.id", "isolate_seg_7.id", "isolate_seg_8.id", "isolate_seg_9.id", "isolate_seg_10.id"]));

var isolateIDToAltNames = {};

_.each(seqObjs, function(seqObj) {
	for(var i = 1; i <= 10; i++) {
		var isolateID = seqObj["isolate_seg_"+i+".id"];
		if(isolateID != null) {
			var altNames = isolateIDToAltNames[isolateID];
			if(altNames == null) {
				altNames = [];
				isolateIDToAltNames[isolateID] = altNames;
			}
			altNames.push(seqObj.gb_isolate);
		}
	}
});

_.each(_.pairs(isolateIDToAltNames), function(pair) {
	var isolateID = pair[0];
	var altNames = _.uniq(pair[1]);
	glue.inMode("custom-table-row/isolate/"+isolateID, function() {
		var displayName = glue.command(["show", "property", "display_name"]).propertyValueResult.value;
		altNames = _.without(altNames, displayName);
	});
	
});