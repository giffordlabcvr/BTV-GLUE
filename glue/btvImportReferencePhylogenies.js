var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

_.each(segments, function(segNum) {
	  // import the segment reference phylogeny
	  glue.inMode("module/btvPhyloImporter", function() {
		    glue.command(["import", "phylogeny", "AL_S"+segNum+"_MASTER", "--recursive", "--anyAlignment",
		      "-w", "sequence.source.name = 'ncbi-s"+segNum+"-refseqs' and referenceMember = false",
		      "-i", "trees/reference/S"+segNum+"_reference_rerooted.tree", "NEWICK_BOOTSTRAPS",
		      "-f", "phylogeny"]);
	  });
	
});
