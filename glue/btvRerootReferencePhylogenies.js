// map each segment number to a set of basal genogroups.
// during rerooting this is transformed to a where clause selecting members of the relevant GENO_CODON in the basal group
// e.g. ["G", "J"] becomes
// "(sequence.referenceSequences.name like 'REF_S2_GGrG%') or (sequence.referenceSequences.name like 'REF_S2_GGrJ%')"


var segmentToBasalGroupWhereClause = {
		"1": ["C", "D", "E"],
		"2": ["G", "J"],
		"3": ["C", "D", "E"],
		"4": ["C", "D", "E", "F", "G"],		
	    "5": ["D", "E", "F", "G", "H"],
	    "6": ["A", "B", "G"],
	    "7": ["D", "E", "H"],
	    "8": ["C", "D", "E", "H"], 
		"9": ["C"], 
		"10": ["D", "E", "H"]
};

_.each(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], function(segNum) {
	glue.logInfo("Importing reference tree for segment "+segNum);
	glue.inMode("module/btvPhyloImporter", function() {
		glue.command(["import", "phylogeny", "BTV_GENO_CODON_"+segNum, "-a", 
				"-i", "trees/reference/S"+segNum+"_reference.tree", "NEWICK_BOOTSTRAPS",
				"-f", "phylogeny"]);
	});
	glue.logInfo("Rerooting reference tree for segment "+segNum);
	var outgroupWhereClause = _.map(segmentToBasalGroupWhereClause[segNum], 
			function(ggrName) { return "(sequence.referenceSequences.name like 'REF_S"+segNum+"_GGr"+ggrName+"%')";})
			.join(" or ");
	glue.logInfo("Outgroup where clause: "+outgroupWhereClause);
	glue.inMode("module/btvPhyloUtility", function() {
		glue.command(["reroot-alignment-phylogeny", "BTV_GENO_CODON_"+segNum, "phylogeny", 
			"-w", outgroupWhereClause, 
			"-o", "trees/reference/S"+segNum+"_reference_rerooted.tree", "NEWICK_BOOTSTRAPS"]);
	});
});
