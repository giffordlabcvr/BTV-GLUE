var segments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

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

function almtName(segment) {
	return "BTV_OUTG_CODON_"+segment;
}

_.each(segments, function(segment) {
	var alName = almtName(segment);
	glue.inMode("module/btvRaxmlPhylogenyGenerator", function() {
	    glue.command(["generate","nucleotide", "phylogeny", alName, 
	                  "-r", "REF_S"+segment+"_MASTER", "-f", segToFeatureName[segment], "-w", "sequence.source.name in ('ncbi-curated','ncbi-outgroup')'", 
	                  "-o", "trees/phyloTrees/S"+segment+".tree", "NEWICK_BOOTSTRAPS"]);
	});
});

glue.inMode("module/btvRaxmlPhylogenyGenerator", function() {
    glue.command(["generate","nucleotide", "phylogeny", "BTV_OUTG_CODON_FULLGENOME", 
                  "-s", "btvFullGenomesPhyloColumnsSelector", "-w", "sequence.source.name in ('ncbi-curated-fullgenomes','ncbi-outgroup-fullgenomes')'", 
                  "-o", "trees/phyloTrees/FULL_GENOMES.tree", "NEWICK_BOOTSTRAPS"]);
});
