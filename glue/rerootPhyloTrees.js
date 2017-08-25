var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

_.each(segments, function(segment) {
	glue.inMode("module/btvPhyloUtility", function() {
	    glue.command(["reroot-phylogeny", 
	                  "-i", "trees/phyloTrees/S"+segment+".tree", "NEWICK_BOOTSTRAPS", 
	                  "--midpoint", 
	                  "-o", "trees/phyloTrees/S"+segment+"_mp_rerooted.tree", "NEWICK_BOOTSTRAPS"]);
	});
});