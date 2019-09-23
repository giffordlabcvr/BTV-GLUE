
function pad(num, size) {
    var s = num+"";
    while (s.length < size) {
    	s = "0" + s;
    }
    return s;
}


function placeCuratedSeg2() {
	glue.log("INFO", "Deleting files in placement path "+placement.path);
	var placementPathFiles = glue.tableToObjects(glue.command(["file-util", "list-files", "--directory", placement.path]));
	_.each(placementPathFiles, function(placementPathFile) {
		glue.command(["file-util", "delete-file", placement.path+"/"+placementPathFile.fileName]);
	});
	glue.log("INFO", "Deleted "+placementPathFiles.length+" files");
	var fileSuffix = 1;
	var whereClause = "source.name = 'ncbi-curated' and isolate_segment = '2' and excluded = 'false'";
	placeCurated(whereClause, fileSuffix);
}

function placeCurated(whereClause, fileSuffix) {
	glue.log("INFO", "Counting sequences where "+whereClause);
	var numSequences = glue.command(["count", "sequence", "--whereClause", whereClause]).countResult.count;
	glue.log("INFO", "Found "+numSequences+" sequences where "+whereClause);
	var batchSize = 50;
	var offset = 0;
	while(offset < numSequences) {
		glue.log("INFO", "Placing sequences starting at offset "+offset);
		glue.inMode("module/"+modules.placer, function() {
			fileSuffixString = pad(fileSuffix, 6);
			var outputFile = placement.path + "/" + placement.prefix + fileSuffixString + ".xml";
			glue.command(["place", "sequence", 
                           "--whereClause", whereClause,
                           "--pageSize", batchSize, "--fetchLimit", batchSize, "--fetchOffset", offset, 
                           "--outputFile", outputFile]);
		});
		offset += batchSize;
		fileSuffix++;
	}
}


function genotypeCuratedSeg2() {
	var placementPathFiles = glue.tableToObjects(glue.command(["file-util", "list-files", "--directory", placement.path]));
	
	var alignmentsToRecompute = [];
	
	_.each(placementPathFiles, function(placementPathFile) {
		if(placementPathFile.fileName.indexOf(".xml") < 0) {
			return;
		}
		glue.log("INFO", "Computing genotype results for placement file "+placementPathFile.fileName);
		var batchGenotyperResults;
		glue.inMode("module/"+modules.genotyper, function() {
			batchGenotyperResults = glue.tableToObjects(glue.command(
					["genotype", "placer-result", 
					 "--fileName", placement.path+"/"+placementPathFile.fileName, 
					 "--detailLevel", "HIGH"]));
		});
		glue.log("INFO", "Assigning genotype metadata for "+batchGenotyperResults.length+" genotyping results from placement file "+placementPathFile.fileName);
		var batchSize = 500;
		var numUpdates = 0;
		_.each(batchGenotyperResults, function(genotyperResult) {
			var queryBits = genotyperResult.queryName.split("/");
			var sourceName = queryBits[0];
			var sequenceID = queryBits[1];

			if(genotyperResult.serotypeFinalClade != null) {
				targetAlignmentName = genotyperResult.serotypeFinalClade;
			} else if(genotyperResult.genogroupFinalClade != null) {
				targetAlignmentName = genotyperResult.genogroupFinalClade;
			} else if(genotyperResult.speciesFinalClade != null) {
				targetAlignmentName = genotyperResult.speciesFinalClade;
			} else {
				targetAlignmentName = null;
			}
			if(targetAlignmentName != null) {
				glue.inMode("alignment/"+targetAlignmentName, function() {
					glue.command(["add", "member", sourceName, sequenceID]);
				});

				var isolateID;
				
				alignmentsToRecompute.push(targetAlignmentName);

				glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
					isolateID = glue.command(["show", "property", "isolate.id"]).propertyValueResult.value;
				});
				if(isolateID != null) {
					glue.inMode("custom-table-row/isolate/"+isolateID, function() {
						glue.command(["set", "link-target", "seg2clade", "alignment/"+targetAlignmentName]);
					});
				}
			}
			if(numUpdates % batchSize == 0) {
				glue.command("commit");
				glue.command("new-context");
				glue.log("FINE", "Clade assigned for "+numUpdates+" sequences.");
			}
			numUpdates++;
		});
		glue.command("commit");
		glue.command("new-context");
		glue.log("FINE", "Major/minor clade assigned for "+numUpdates+" sequences.");
	});
	
	alignmentsToRecompute = _.uniq(alignmentsToRecompute);
	glue.log("FINE", "Alignments to recompute: ", alignmentsToRecompute);
	
	_.each(alignmentsToRecompute, function(alignmentName) {
		glue.log("FINE", "Recomputing constrained alignment "+alignmentName);
		glue.command(["compute", "alignment", alignmentName, "s2CompoundAligner",
		              "--whereClause", "sequence.source.name = 'ncbi-curated'"]);
	});
	
}
