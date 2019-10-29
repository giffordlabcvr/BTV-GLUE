// delete ncbi-curated alignment members from all constrained alignments.

glue.command(["multi-delete", "alignment_member", "-w", "sequence.source.name = 'ncbi-curated' and alignment.refSequence != null"]);

// delete links between isolates and alignments.

glue.command(["multi-unset", "link-target", "isolate", "-a", "seg1genogroup"]);
glue.command(["multi-unset", "link-target", "isolate", "-a", "seg2genogroup"]);
glue.command(["multi-unset", "link-target", "isolate", "-a", "seg2genotype"]);
glue.command(["multi-unset", "link-target", "isolate", "-a", "seg3genogroup"]);
glue.command(["multi-unset", "link-target", "isolate", "-a", "seg4genogroup"]);
glue.command(["multi-unset", "link-target", "isolate", "-a", "seg5genogroup"]);
glue.command(["multi-unset", "link-target", "isolate", "-a", "seg6genogroup"]);
glue.command(["multi-unset", "link-target", "isolate", "-a", "seg7genogroup"]);
glue.command(["multi-unset", "link-target", "isolate", "-a", "seg8genogroup"]);
glue.command(["multi-unset", "link-target", "isolate", "-a", "seg9genogroup"]);
glue.command(["multi-unset", "link-target", "isolate", "-a", "seg10genogroup"]);


for(var segNum = 1; segNum <= 10; segNum++) {
	var placementPath = "placement_seg"+segNum;
	var placementPathFiles = glue.tableToObjects(glue.command(["file-util", "list-files", "--directory", placementPath]));
	
	var alignmentsToRecompute = [];
	
	var numUpdates = 0;
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
			var cladeCategory;
			var parentAlmtName;
			if(targetAlignmentName != null) {
				glue.inMode("alignment/"+targetAlignmentName, function() {
					glue.command(["add", "member", sourceName, sequenceID]);
					cladeCategory = glue.command(["show", "property", "clade_category"]).propertyValueResult.value;
					parentAlmtName = glue.command(["show", "parent"]).alignmentShowParent["parent.name"];
				});
				var parentCladeCategory;
				
				if(parentAlmtName != null) {
					glue.inMode("alignment/"+parentAlmtName, function() {
						parentCladeCategory = glue.command(["show", "property", "clade_category"]).propertyValueResult.value;
					});
					
				}

				var isolateID;
				
				alignmentsToRecompute.push(targetAlignmentName);

				glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
					isolateID = glue.command(["show", "property", "isolate.id"]).propertyValueResult.value;
				});
				if(isolateID != null) {
					glue.inMode("custom-table-row/isolate/"+isolateID, function() {
						if(cladeCategory != null && cladeCategory != "species") {
							glue.command(["set", "link-target", "seg"+segNum+cladeCategory, "alignment/"+targetAlignmentName]);
						}
						if(parentCladeCategory != null && parentCladeCategory != "species") {
							glue.command(["set", "link-target", "seg"+segNum+parentCladeCategory, "alignment/"+parentAlmtName]);
						}
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
