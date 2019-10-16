
function pad(num, size) {
    var s = num+"";
    while (s.length < size) {
    	s = "0" + s;
    }
    return s;
}


for(var segNum = 1; segNum <= 10; segNum++) {
	var placementPath = "placement_seg"+segNum;
	glue.log("INFO", "Deleting files in placement path "+placementPath);
	var placementPathFiles = glue.tableToObjects(glue.command(["file-util", "list-files", "--directory", placementPath]));
	_.each(placementPathFiles, function(placementPathFile) {
		glue.command(["file-util", "delete-file", placementPath+"/"+placementPathFile.fileName]);
	});
	glue.log("INFO", "Deleted "+placementPathFiles.length+" files");
	var fileSuffix = 1;
	var whereClause = "source.name = 'ncbi-curated' and isolate_segment = '"+segNum+"' and excluded = 'false'";
	glue.log("INFO", "Counting sequences where "+whereClause);
	var numSequences = glue.command(["count", "sequence", "--whereClause", whereClause]).countResult.count;
	glue.log("INFO", "Found "+numSequences+" sequences where "+whereClause);
	var batchSize = 50;
	var offset = 0;
	while(offset < numSequences) {
		glue.log("INFO", "Placing sequences starting at offset "+offset);
		glue.inMode("module/btvS"+segNum+"MaxLikelihoodPlacer", function() {
			fileSuffixString = pad(fileSuffix, 6);
			var outputFile = placementPath + "/ncbi_curated_seg" +segNum + "_" + fileSuffixString + ".xml";
			glue.command(["place", "sequence", 
				"--whereClause", whereClause,
				"--pageSize", batchSize, "--fetchLimit", batchSize, "--fetchOffset", offset, 
				"--outputFile", outputFile]);
		});
		offset += batchSize;
		fileSuffix++;
	}
}

