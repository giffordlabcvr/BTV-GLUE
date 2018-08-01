var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
function almtName(segment) {
	return "PHYLO_UNC_S"+segment;
}

_.each(segments, function(segment) {
	var alName = almtName(segment);
	glue.command(["import", "alignment", "-f", "alignments/phyloUnconstrained/"+alName+".json"]);
	glue.inMode("module/btvPhyloImporter", function() {
	    glue.command(["import", "phylogeny", alName, 
	                  "-w", "sequence.source.name = 'ncbi-curated'", 
	                  "-i", "trees/phyloTrees/S"+segment+"_mp_rerooted.tree", "NEWICK_BOOTSTRAPS", 
	                  "-f", "phylogeny" ]);
	});
	glue.log("FINEST", "Imported phylo alignment/tree for segment "+segment);
});