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

// within each segment set there are various sequences for which deriving the protein sequence 
// from the BTV_COMPL_SEG_NT_ using fastaProteinExporter does not work, producing a protein with 
// stop codons in. This is for different reasons either to do with the sequence itself or how it aligns.
// In these cases we use the fastaProteinAlignmentExporter instead, which produces a protein
// sequence with gaps but no stop codons.

var segToBrokenCDS = {};
segToBrokenCDS["2"] = ["DQ191282"];
segToBrokenCDS["3"] = ["JQ822250"];
segToBrokenCDS["4"] = ["JX007926"];
segToBrokenCDS["5"] = ["MF124296", "JQ822252"];
segToBrokenCDS["7"] = ["DQ399835", "KP696666"];

_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], function(segNum) {
	
	var fastaMapOutgroup;
	var fastaMapBtv;
	var fastaMapBroken;
	
	var brokenCDSids = segToBrokenCDS[segNum];
	
	glue.inMode("module/fastaProteinExporter", function() {
		fastaMapOutgroup = glue.command(["export", "reference",
		                                     "-f", segToFeatureName[segNum], 
		                                     "-w", "sequence.isolate_segment = '"+segNum+"' and (name like '%OUTGROUP' or name like '%MASTER')", "-p"]);

		var whereClause = "sequence.source.name = 'ncbi-curated'";
		if(brokenCDSids != null) {
			var brokenCDSidSet = "('"+brokenCDSids.join("', '")+"')";
			whereClause = whereClause + " and not sequence.sequenceID in "+brokenCDSidSet
		}
		
		
		fastaMapBtv = glue.command(["export", "member", 
		                                "BTV_COMPL_SEG_NT_"+segNum, 
		                                "-r", "REF_S"+segNum+"_MASTER", 
		                                "-f", segToFeatureName[segNum], 
		                                "-w", whereClause, 
		                                "-p"]);
	});

	if(brokenCDSids != null) {
		var brokenCDSidSet = "('"+brokenCDSids.join("', '")+"')";

		glue.inMode("module/fastaProteinAlignmentExporter", function() {
			fastaMapBroken = glue.command(["export", 
			                               "BTV_COMPL_SEG_NT_"+segNum, 
			                               "-r", "REF_S"+segNum+"_MASTER", 
			                               "-f", segToFeatureName[segNum], 
			                               "-w", "sequence.source.name = 'ncbi-curated' and sequence.sequenceID in "+brokenCDSidSet, 
			                               "-p"]);
		});
	} else {
		fastaMapBroken = {"aminoAcidFasta": { "sequences": [] } }
	}
	
	
	var combinedSeqs = _.union(fastaMapOutgroup.aminoAcidFasta.sequences, 
			fastaMapBtv.aminoAcidFasta.sequences, fastaMapBroken.aminoAcidFasta.sequences);
	
	var fastMapCombined = {"aminoAcidFasta": { "sequences": combinedSeqs } };

	
	glue.inMode("module/fastaUtility", function() {
		glue.command({"save-amino-acid-fasta": {
			"fastaCommandDocument": fastMapCombined,
			"outputFile": "alignments/btvOutgroupProtein/BTV_OUTG_UNALIGNED_"+segNum+".faa"
		}});
	});
	
});