var excludedObjs;

glue.inMode("module/btvTabularUtility", function() {
	excludedObjs = glue.tableToObjects(glue.command(["load-tabular", "tabular/formatted/sequences_to_exclude.txt"]));
});

_.each(excludedObjs, function(excludedObj) {
	glue.inMode("sequence/ncbi-curated/"+excludedObj.sequence_id, function() {
		glue.command(["set", "field", "excluded", "true"]);
		glue.command(["set", "field", "excluded_reason", excludedObj.excluded_reason]);
	});
});