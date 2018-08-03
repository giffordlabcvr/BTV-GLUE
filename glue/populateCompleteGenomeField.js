var seqObjs = glue.tableToObjects(glue.command(["list", "sequence", "-w", 
                            "source.name = 'ncbi-curated' and excluded = false and "+
                            "isolate != null and complete_segment = true", 
                            "sequenceID",
                            "isolate.id", 
                            "isolate_segment"]));

// map of isolate ID to array of segment numbers for which the isolate has at least one complete segment.
var isolateIDToCompleteSegments = {};

_.each(seqObjs, function(seqObj) {
	var isolateID = seqObj["isolate.id"];
	
	var completeSegments = isolateIDToCompleteSegments[isolateID];
	if(completeSegments == null) {
		completeSegments = [];
		isolateIDToCompleteSegments[isolateID] = completeSegments;
	}
	completeSegments.push(seqObj["isolate_segment"]);
});

_.each(_.pairs(isolateIDToCompleteSegments), function(pair) {
	var isolateID = pair[0];
	var completeSegments = _.uniq(pair[1]);
	glue.inMode("custom-table-row/isolate/"+isolateID, function() {
		glue.logInfo("isolateID", isolateID);
		glue.logInfo("completeSegments", completeSegments);
		if(completeSegments.length == 10) {
			glue.command(["set", "field", "complete_genome", "true"]);
		}
	});
});

glue.command(["multi-set", "field", "isolate", "-w", "complete_genome = null", "complete_genome", "false"]);
