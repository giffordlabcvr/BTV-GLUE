
for(var segNum = 1; segNum <= 10; segNum++) {
	var placementPath = "placement_seg"+segNum;
	var placementPathFiles = glue.tableToObjects(glue.command(["file-util", "list-files", "--directory", placementPath]));
	
	var alignmentsToRecompute = [];
	
	_.each(placementPathFiles, function(placementPathFile) {
		if(placementPathFile.fileName.indexOf(".xml") < 0) {
			return;
		}
		if(placementPathFile.fileName.indexOf("ncbi_curated") != 0) {
			return;
		}
		glue.log("INFO", "Computing genotype results for placement file "+placementPathFile.fileName);
		var batchGenotyperResults;
		glue.inMode("module/btvS"+segNum+"MaxLikelihoodGenotyper", function() {
			batchGenotyperResults = glue.tableToObjects(glue.command(
					["genotype", "placer-result", 
					 "--fileName", placementPath+"/"+placementPathFile.fileName, 
					 "--detailLevel", "HIGH"]));
		});
		glue.log("INFO", "Assigning genotype metadata for "+batchGenotyperResults.length+" genotyping results from placement file "+placementPathFile.fileName);
		var batchSize = 500;
		var numUpdates = 0;
		_.each(batchGenotyperResults, function(genotyperResult) {
			var queryBits = genotyperResult.queryName.split("/");
			var sourceName = queryBits[0];
			var sequenceID = queryBits[1];

			if(genotyperResult.genotypeFinalClade != null) {
				targetAlignmentName = genotyperResult.genotypeFinalClade;
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
						glue.command(["set", "link-target", "seg"+segNum+"clade", "alignment/"+targetAlignmentName]);
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
		glue.command(["compute", "alignment", alignmentName, "s"+segNum+"CompoundAligner",
		              "--whereClause", "sequence.source.name = 'ncbi-curated'"]);
	});
	
}
