for(var segNum = 1; segNum <= 10; segNum++) {
	var placementPath = "placement_seg"+segNum;
	var whereClause = "source.name = 'ncbi-outgroup' and isolate_segment = '"+segNum+"'";
	glue.inMode("module/btvS"+segNum+"MaxLikelihoodPlacer", function() {
		var outputFile = placementPath + "/ncbi_outgroup_seg" +segNum+".xml";
		glue.command(["place", "sequence", 
			"--whereClause", whereClause,
			"--outputFile", outputFile]);
	});
}

