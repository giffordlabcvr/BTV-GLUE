
function findDiscrepancies() {
	
	
	var seqObjs = glue.tableToObjects(glue.command(["list", "sequence", "-w", "source.name = 'ncbi-curated' and excluded = false", "sequenceID",
	                                                "isolate_seg_1.id", "isolate_seg_2.id", "isolate_seg_3.id", "isolate_seg_4.id", "isolate_seg_5.id", 
	                                                "isolate_seg_6.id", "isolate_seg_7.id", "isolate_seg_8.id", "isolate_seg_9.id", "isolate_seg_10.id", 
	                                                "gb_collection_year", "gb_collection_month", "gb_collection_month_day",
	                                                "who_country.display_name", "gb_place_sampled", "gb_host"]));

	var discrepancyObjs = [];
	
	_.each(seqObjs, function(seqObj) {
		for(var i = 1; i <= 10; i++) {
			var isolateID = seqObj["isolate_seg_"+i+".id"];
			if(isolateID != null) {
				glue.inMode("custom-table-row/isolate/"+isolateID, function() {
					findDiscrepancy(discrepancyObjs, isolateID, seqObj, "gb_collection_year", "collection_year");
					findDiscrepancy(discrepancyObjs, isolateID, seqObj, "gb_collection_month", "collection_month");
					findDiscrepancy(discrepancyObjs, isolateID, seqObj, "gb_collection_month_day", "collection_month_day");
					findDiscrepancy(discrepancyObjs, isolateID, seqObj, "gb_place_sampled", "place_sampled");
					findDiscrepancy(discrepancyObjs, isolateID, seqObj, "gb_host", "host");
					findDiscrepancy(discrepancyObjs, isolateID, seqObj, "who_country.display_name", "who_country.display_name");
				});
			}
		}
	});
	
	return discrepancyObjs;
}

function findDiscrepancy(discrepancyObjs, isolateID, seqObj, seqField, isolateField) {
	var seqValue = seqObj[seqField];
	if(seqValue != null) {
		var isolateValue = glue.command(["show", "property", isolateField]).propertyValueResult.value;
		if(isolateValue != null && (seqValue+"").replace(/[, -]/g,'').toLowerCase() != (isolateValue+"").replace(/[, -]/g,'').toLowerCase()) {
			discrepancyObjs.push({
				sequenceID: seqObj.sequenceID,
				isolateID: isolateID, 
				field: isolateField,
				sequenceValue: seqValue,
				isolateValue: isolateValue
			});
		}
	}
}