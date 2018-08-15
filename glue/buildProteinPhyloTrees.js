// reordered the segments to do the ones which have the more problematic rooting first.
var segments = ["5", "8", "9", "10", "1", "2", "3", "4", "6", "7"];

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
	glue.inMode("module/btvRaxmlProteinPhylogenyGenerator", function() {
	    glue.command(["generate","amino-acid", "phylogeny", alName, 
	                  "-r", "REF_S"+segment+"_MASTER", "-f", segToFeatureName[segment], "-w", "sequence.source.name in ('ncbi-curated','ncbi-outgroup')", 
	                  "-o", "trees/phyloTrees/S"+segment+"_protein.tree", "NEWICK_BOOTSTRAPS"]);
	});
});

