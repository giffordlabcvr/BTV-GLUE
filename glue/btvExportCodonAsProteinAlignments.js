
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
	glue.inMode("module/fastaProteinAlignmentExporter", function() {
		glue.command(["export", "BTV_OUTG_CODON_"+segNum, 
		              "-r", "REF_S"+segNum+"_MASTER", 
		              "-f", segToFeatureName[segNum], "-a",
		              "-o", "alignments/btvOutgroupCodonAsProtein/BTV_OUTG_CODON_AS_PROTEIN_"+segNum+".faa"]);
	});
});