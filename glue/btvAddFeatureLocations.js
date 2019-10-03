var segments = ["1", "2", "3", "4", "5", 
	"6", "7", "8", "9", "10"]; 

var segToFeatures = {};

segToFeatures["1"] = { mainCodingFeature: "VP1", codingFeatures: ["VP1"] };
segToFeatures["2"] = { mainCodingFeature: "VP2", codingFeatures: ["VP2"] };
segToFeatures["3"] = { mainCodingFeature: "VP3", codingFeatures: ["VP3"] };
segToFeatures["4"] = { mainCodingFeature: "VP4", codingFeatures: ["VP4"] };
segToFeatures["5"] = { mainCodingFeature: "NS1", codingFeatures: ["NS1"] };
segToFeatures["6"] = { mainCodingFeature: "VP5", codingFeatures: ["VP5"] };
segToFeatures["7"] = { mainCodingFeature: "VP7", codingFeatures: ["VP7"] };
segToFeatures["8"] = { mainCodingFeature: "NS2", codingFeatures: ["NS2"] };
segToFeatures["9"] = { mainCodingFeature: "VP6", codingFeatures: ["VP6", "VP6a", "NS4"] };
segToFeatures["10"] = { mainCodingFeature: "NS3", codingFeatures: ["NS3", "NS3a", "NS5"] };


var problematicRefs = {};


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
			var codingFeatures = segToFeatures[segNum].codingFeatures;
			var mainCodingFeature = segToFeatures[segNum].mainCodingFeature;
			_.each(codingFeatures, function(codingFeatureName) {
				glue.command(["inherit", "feature-location", "--spanGaps", 
		              linkingAlmtName, "--relRefName", masterRefObj.name, codingFeatureName]);
			});
			var refStart;
			var refEnd;
			glue.inMode("/feature-location/"+mainCodingFeature, function() {
				var segmentObjs = glue.tableToObjects(glue.command(["list", "segment"]));
				refStart = _.min(segmentObjs, function(obj) {return obj.refStart;}).refStart;
				refEnd = _.max(segmentObjs, function(obj) {return obj.refEnd;}).refEnd;
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

			_.each(codingFeatures, function(codingFeatureName) {
				var aaRows;
				glue.inMode("/feature-location/"+codingFeatureName, function() {
					aaRows = glue.tableToObjects(glue.command(["amino-acid"]));
				});
				for(var i = 0; i < aaRows.length; i++) {
					var aa = aaRows[i].aminoAcid;
					if(i == 0 && aa != "M") {
						glue.log("WARNING", "First residue of feature "+codingFeatureName+" (label "+aaRows[i].codonLabel+") on reference "+refName+" should be M");
						problematicRefs[refName] = "yes";
					}
					if(i < aaRows.length-1 && aa == "*") {
						glue.log("WARNING", "Intermediate residue of feature "+codingFeatureName+" (label "+aaRows[i].codonLabel+") on reference "+refName+" should not be *");
						problematicRefs[refName] = "yes";
					}
					if(i < aaRows.length-1 && aa == "X") {
						glue.log("WARNING", "Intermediate residue of feature "+codingFeatureName+" (label "+aaRows[i].codonLabel+") on reference "+refName+" should not be X");
						problematicRefs[refName] = "yes";
					}
					if(i == aaRows.length-1 && aa != "*") {
						glue.log("WARNING", "Last residue of feature "+codingFeatureName+" (label "+aaRows[i].codonLabel+") on reference "+refName+" should be *");
						problematicRefs[refName] = "yes";
					}
				}
			});

		
		});
	});
});

glue.logInfo("Problematic reference sequences: ", _.keys(problematicRefs));


