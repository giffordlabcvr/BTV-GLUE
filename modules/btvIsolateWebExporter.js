function exportIsolateTable(whereClause, sortProperties, fileName, lineFeedStyle) {
	
	var tableResult = previewIsolateTable(whereClause, sortProperties);
	
	var saveResult;
	
	glue.inMode("module/btvTabularUtility", function() {
		saveResult = glue.command({
			"save-tabular-web": {
				"lineFeedStyle": lineFeedStyle,
				"fileName": fileName,
				"tabularData": tableResult
			}
		});
	});
	
	return saveResult;
}

function previewIsolateTable(whereClause, sortProperties) {

	var cmdParams = {
	        "sortProperties":sortProperties,
	        "tableName":"isolate",
	        "rendererModuleName":"btvIsolateRenderer"
	};

	if(whereClause == null || whereClause == "") {
		cmdParams.allObjects = true;
	} else {
		cmdParams.allObjects = false;
		cmdParams.whereClause = whereClause;
	}

	var multiRenderResult = glue.command({
	    "multi-render": cmdParams
	});
	
	var columns = [
		"name",
		"segment1Sequence",
		"segment2Sequence",
		"segment3Sequence",
		"segment4Sequence",
		"segment5Sequence",
		"segment6Sequence",
		"segment7Sequence",
		"segment8Sequence",
		"segment9Sequence",
		"segment10Sequence",
		"completeGenome",
		"hostSpecies",
		"collectionYear",
		"collectionMonth",
		"collectionMonthDay",
        "region",
        "subRegion",
        "intermediateRegion",
		"country",
		"countryIsoCode",
        "placeSampled",
		"sampleType",
		"tissueSampled",
		"passageCells",
		"passageHistory",
	];
	
	var rows = [];
	
	_.each(multiRenderResult.multiRenderResult.resultDocument, function(renderResultDoc) {
		
		var isolate = renderResultDoc.isolate;
		
		var segToSeqIds = {};
		
		_.each(isolate.sequence, function(sequence) {
			var ids = segToSeqIds[sequence.segment];
			if(ids == null) {
				ids = sequence.sequenceID;
			} else {
				ids = ","+sequence.sequenceID
			}
			segToSeqIds[sequence.segment] = ids;
		});
		
		rows.push({
			"value": [
				isolate.displayName,
				segToSeqIds["1"] == null ? "-" : segToSeqIds["1"],
				segToSeqIds["2"] == null ? "-" : segToSeqIds["2"],
				segToSeqIds["3"] == null ? "-" : segToSeqIds["3"],
				segToSeqIds["4"] == null ? "-" : segToSeqIds["4"],
				segToSeqIds["5"] == null ? "-" : segToSeqIds["5"],
				segToSeqIds["6"] == null ? "-" : segToSeqIds["6"],
				segToSeqIds["7"] == null ? "-" : segToSeqIds["7"],
				segToSeqIds["8"] == null ? "-" : segToSeqIds["8"],
				segToSeqIds["9"] == null ? "-" : segToSeqIds["9"],
				segToSeqIds["10"] == null ? "-" : segToSeqIds["10"],
				isolate.completeGenome,
				isolate.host,
				isolate.collectionYear,
				isolate.collectionMonth,
				isolate.collectionMonthDay,
		        isolate.who_region_display_name,
		        isolate.who_sub_region_display_name,
		        isolate.who_intermediate_region_display_name,
				isolate.country,
				isolate.country_iso,
		        isolate.placeSampled,
				isolate.sampleType,
				isolate.tissueSampled,
				isolate.passageCells,
				isolate.passageHistory,
			]
		});
	});
	
	var tableResult = {
			"exportIsolateTableResult": {
				"column": columns,
				"row": rows,
				"objectType": "renderedIsolateRow"
			}
	};

	return tableResult;
}