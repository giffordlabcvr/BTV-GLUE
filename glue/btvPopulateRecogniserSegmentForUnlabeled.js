var recogniserResultObjs;
var reverseHits = [];
var multipleHits = [];

glue.inMode("module/btvSegmentRecogniser", function() {
	recogniserResultObjs = glue.tableToObjects(glue.command(["recognise", "sequence", "-w", 
	    "excluded = false and source.name = 'ncbi-curated'"+
	    " and isolate = null"+
	    " and not sequenceID like 'NC_%'"]));
})

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
			glue.command(["set", "field", "recogniser_segment", objs[0].categoryId.replace('S', '')]);
		});
	} else {
		reverseHits.push(sequenceID);
	}
	
});


glue.logInfo("reverse hits", reverseHits);
glue.logInfo("multiple hits", multipleHits);