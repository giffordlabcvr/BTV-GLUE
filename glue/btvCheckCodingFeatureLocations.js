var segments = ["2"]; // add other segments as clade structure / reference sequences become established.

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


_.each(segments, function(segNum) {
	var linkingAlmtName = "BTV_GENO_CODON_"+segNum;

	var refObjs = glue.tableToObjects(glue.command(
			["list", "reference", "-w", 
			 "sequence.source.name = 'ncbi-s"+segNum+"-refseqs'"]));

	_.each(refObjs, function(refObj) {
		var refName = refObj.name;
		glue.log("FINEST", "Checking coding region for "+refName);
		var sourceName = refObj["sequence.source.name"];
		var sequenceID = refObj["sequence.sequenceID"];

		var codingFeatureName = segToFeatureName[segNum];
		glue.inMode("/reference/"+refName+"/feature-location/"+codingFeatureName, function() {
			var numStopCodons = glue.command(["count", "amino-acid", "*"]).featureLocCountAminoAcidResult.count;
			if(numStopCodons > 1) {
				throw new Error("Multiple stop codons in reference "+refName+", feature-location "+codingFeatureName);
			}
		});
	});
});

