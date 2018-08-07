// create per segment unaligned protein FASTA file, including all BTV complete segments plus outgroups.

var segToFeatureName = {};
segToFeatureName["1"] = "VP1";
segToFeatureName["2"] = "VP2";
segToFeatureName["3"] = "VP3";
segToFeatureName["4"] = "VP4";
segToFeatureName["5"] = "NS1";
segToFeatureName["6"] = "VP5";
segToFeatureName["7"] = "VP7";
segToFeatureName["8"] = "NS2";
segToFeatureName["9"] = "VP6";
segToFeatureName["10"] = "NS3";

_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], function(segNum) {
	
	var fastMapCombined;
	
	glue.inMode("module/fastaProteinExporter", function() {
		var fastaMapOutgroup = glue.command(["export", "reference",
		                                     "-f", segToFeatureName[segNum], 
		                                     "-w", "sequence.isolate_segment = '"+segNum+"' and (name like '%OUTGROUP' or name like '%MASTER')", "-p"]);
		var fastaMapBtv = glue.command(["export", "member", 
		                                "BTV_COMPL_SEG_NT_"+segNum, 
		                                "-r", "REF_S"+segNum+"_MASTER", 
		                                "-f", segToFeatureName[segNum], 
		                                "-w", "sequence.source.name = 'ncbi-curated'", "-p"]);
		
		var combinedSeqs = _.union(fastaMapOutgroup.aminoAcidFasta.sequences, 
				fastaMapBtv.aminoAcidFasta.sequences);
		
		fastMapCombined = {"aminoAcidFasta": { "sequences": combinedSeqs } };
	});
	
	glue.inMode("module/fastaUtility", function() {
		glue.command({"save-amino-acid-fasta": {
			"fastaCommandDocument": fastMapCombined,
			"outputFile": "alignments/btvOutgroupProtein/BTV_OUTG_UNALIGNED_"+segNum+".faa"
		}});
	});
	
});