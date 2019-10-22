function findNullAssignments(segNum) {
	var cladeCategories;
	glue.inMode("module/btvS"+segNum+"MaxLikelihoodGenotyper", function() {
		glue.command(["load", "configuration", "modules/btvS"+segNum+"MaxLikelihoodGenotyper.xml"]);
		cladeCategories = glue.getTableColumn(glue.command(["list", "clade-category"]), "name");
	});
	var placementPath = "placement_seg"+segNum;
	var placementPathFiles = glue.tableToObjects(glue.command(["file-util", "list-files", "--directory", placementPath]));
	var resultObjs = [];
	var numUpdates = 0;
	_.each(placementPathFiles, function(placementPathFile) {
		if(placementPathFile.fileName.indexOf(".xml") < 0) {
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
		var batchSize = 500;
		_.each(batchGenotyperResults, function(genotyperResult) {
			var queryBits = genotyperResult.queryName.split("/");
			var sourceName = queryBits[0];
			var sequenceID = queryBits[1];

			var anyNull = false;
			var resultObj = {
					sourceName: sourceName, 
					sequenceID: sequenceID,
					path: placementPath+"/"+placementPathFile.fileName
			};
			_.each(cladeCategories, function(cladeCategory) {
				resultObj[cladeCategory] = genotyperResult[cladeCategory+"FinalClade"];
				if(resultObj[cladeCategory] == null) {
					anyNull = true;
				}
			});
			if(anyNull) {
				resultObjs.push(resultObj);
			}
			numUpdates++;
			if(numUpdates % batchSize == 0) {
				glue.command("new-context");
				glue.log("FINE", "Clade assignment completed for "+numUpdates+" sequences.");
			}
		});
		glue.command("new-context");
		glue.log("FINE", "Clade assignment completed for "+numUpdates+" sequences.");
	});
	glue.log("FINE", "Null assignments found for "+resultObjs.length+" sequences.");
	return resultObjs;
}
