_.each(["2", "6"], function(segment) {

	
	var recogniserResultObjs;
	var reverseHits = [];
	var multipleHits = [];

	var recogniserResultObjs;
	glue.inMode("module/btvTabularUtility", function() {
		recogniserResultObjs = glue.tableToObjects(glue.command(["load-tabular", "tabular/formatted/seg"+segment+"GenotypeRecogniserResults.txt"]));
	});

	var querySeqIdToHits = {};

	_.each(recogniserResultObjs, function(recogniserResultObj) {
		var objList = querySeqIdToHits[recogniserResultObj.querySequenceId];
		if(objList == null) {
			objList = [];
			querySeqIdToHits[recogniserResultObj.querySequenceId] = objList;
		}
		objList.push(recogniserResultObj);
	});

	_.each(_.pairs(querySeqIdToHits), function(pair) {
		var idBits = pair[0].split('/');
		var sourceName = idBits[0];
		var sequenceID = idBits[1];
		var objs = pair[1];
		
		if(objs.length > 1) {
			multipleHits.push(sequenceID);
		} else if(objs[0].direction == 'FORWARD') {
			glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
				glue.command(["set", "field", "recogniser_genotype", objs[0].categoryId.replace('S'+segment+'_genotype_', '')]);
			});
		} else {
			reverseHits.push(sequenceID);
		}
		
	});

	glue.logInfo("segment "+segment+" reverse hits", reverseHits);
	glue.logInfo("segment "+segment+" multiple hits", multipleHits);
	
	
});

