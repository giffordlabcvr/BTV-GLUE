function exportIsolateTable(whereClause, sortProperties, lineFeedStyle) {
	
	var multiRenderResult = 
		var allObjects = "false";
		if(whereClause == null) {
			allObjects = "true";
		}
		glue.command({
		    "multi-render":{
		        "whereClause":whereClause,
		        "sortProperties":sortProperties,
		        "tableName":"isolate",
		        "allObjects":allObjects,
		        "rendererModuleName":"btvIsolateRenderer"
		    }
		});
	
	var columns = ["id"];
	
	var rows = [];
	
	_.each(multiRenderResult.multiRenderResult.resultDocument, function(renderResultDoc) {
		
		rows.push({
			"value": [renderResultDoc.isolate.id]
		});
	});
	
	var tableResult = {
			"exportIsolateTableResult": {
				"column": columns,
				"row": rows,
				"objectType": "renderedIsolateRow"
			}
	};
	
	var saveResult;
	
	glue.inMode("module/btvTabularUtility", function() {
		saveResult = glue.command({
			"save-tabular-web": {
				"lineFeedStyle": lineFeedStyle,
				"fileName": "isolates.txt",
				"tabularData": tableResult
			}
		});
	});
	
	return saveResult;
}