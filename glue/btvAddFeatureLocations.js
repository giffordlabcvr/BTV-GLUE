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


glue.command(["multi-delete", "feature_location", "-w", "referenceSequence.sequence.source.name like 'ncbi-s%-refseqs' and not (referenceSequence.name like '%MASTER%')"]);

_.each(segments, function(segNum) {
	var linkingAlmtName = "BTV_GENO_CODON_"+segNum;
	
	var masterRefObj = glue.tableToObjects(glue.command(["list", "reference", "-w", "name like 'REF_S"+segNum+"_MASTER%'"]))[0];
	
	var otherRefObjs = glue.tableToObjects(glue.command(
			["list", "reference", "-w", 
	         "name != '"+masterRefObj.name+"' and sequence.source.name = 'ncbi-s"+segNum+"-refseqs'"]));
	
	_.each(otherRefObjs, function(refObj) {
		var refName = refObj.name;
		var sourceName = refObj["sequence.source.name"];
		var sequenceID = refObj["sequence.sequenceID"];
		
		var seqLength;
		glue.inMode("/sequence/"+sourceName+"/"+sequenceID, function() {
			seqLength = glue.command(["show", "length"]).lengthResult.length;
		});
		
		var wholeGenomeFeatureName = "S"+segNum+"_whole_genome";
		
		glue.inMode("/reference/"+refName, function() {
			glue.command(["add", "feature-location", wholeGenomeFeatureName]);
			glue.inMode("/feature-location/"+wholeGenomeFeatureName, function() {
				glue.command(["add", "segment", 1, seqLength]);
			});
			var codingFeatureName = segToFeatureName[segNum];
			glue.command(["inherit", "feature-location", "--spanGaps", 
			              linkingAlmtName, "--relRefName", masterRefObj.name, codingFeatureName]);
			var refStart;
			var refEnd;
			glue.inMode("/feature-location/"+codingFeatureName, function() {
				var segmentObjs = glue.tableToObjects(glue.command(["list", "segment"]));
				refStart = _.min(segmentObjs, function(obj) {return obj.refStart;}).refStart;
				refEnd = _.max(segmentObjs, function(obj) {return obj.refEnd;}).refEnd;
				var numStopCodons = glue.command(["count", "amino-acid", "*"]).featureLocCountAminoAcidResult.count;
				if(numStopCodons > 1) {
					throw new Error("Multiple stop codons in reference "+refName+", feature-location "+codingFeatureName);
				}
				
			});
			var feature5utr = "S"+segNum+"_5UTR";
			if(refStart > 1) {
				glue.command(["add", "feature-location", feature5utr]);
				glue.inMode("/feature-location/"+feature5utr, function() {
					glue.command(["add", "segment", 1, refStart - 1]);
				});
			}
			var feature3utr = "S"+segNum+"_3UTR";
			if(refEnd < seqLength) {
				glue.command(["add", "feature-location", feature3utr]);
				glue.inMode("/feature-location/"+feature3utr, function() {
					glue.command(["add", "segment", refEnd+1, seqLength]);
				});
			}
		});
	});
});

