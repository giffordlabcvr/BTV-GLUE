
var segments = [
	{ segNum: "1",
	  masterRef: "JX680457",
	  genogroupPThreshold: "20"},
	{ segNum: "2",
      masterRef: "JX680458",
	  genogroupPThreshold: "35",
	  genotypePThreshold: "24" },
	{ segNum: "3",
	  masterRef: "JX680459",
	  genogroupPThreshold: "20" },
	{ segNum: "4",
	  masterRef: "JX680460",
	  genogroupPThreshold: "20" },
	{ segNum: "5",
	  masterRef: "JX680461",
	  genogroupPThreshold: "20" },
	{ segNum: "6",
	  masterRef: "JX680462",
	  genogroupPThreshold: "33" },
	{ segNum: "7",
	  masterRef: "JX680463",
	  genogroupPThreshold: "20" },
	{ segNum: "8",
	  masterRef: "JX680464",
	  genogroupPThreshold: "20" },
	{ segNum: "9",
	  masterRef: "JX680465",
	  genogroupPThreshold: "20" },
	{ segNum: "10",
	  masterRef: "JX680466",
	  genogroupPThreshold: "20" },
];

_.each(segments, function(segObj) {
	
	var segNum = segObj.segNum;

	var cladeStructureObj = {};
	
	cladeStructureObj.referenceSourceName = "ncbi-s"+segNum+"-refseqs";
	cladeStructureObj.alignmentName = "AL_"+segNum+"_MASTER";
	cladeStructureObj.almtDisplayName = "BTV Segment "+segNum;
	cladeStructureObj.cladeCategory = "species";
	cladeStructureObj.constrainingRef = { "sequenceID": segObj.masterRef };
	cladeStructureObj.childAlignments = [];
	
	var refListObjs;
	
	glue.inMode("module/btvTabularUtility", function() {
		refListObjs = glue.tableToObjects(glue.command(["load-tabular", "tabular/formatted/Segment"+segNum+"RefList.txt"]));
	}); 
	
	var ggrNameToRefObjs = _.groupBy(refListObjs, function(rlo) {return rlo["GenogroupName"];} );

	_.each(_.pairs(ggrNameToRefObjs), function(pair) {
		var ggrName = pair[0];
		var refObjs = pair[1];
		var ggrObj = {};
		
		_.each(refObjs, function(refObj) {
			var sequenceID = refObj["Accesion No"];
			var sourceName = 'ncbi-curated';
			if(sequenceID == 'AM744982') {
				sourceName = 'ncbi-outgroup';
			}
			var numSequences = glue.command(["count", "sequence", "-w", 
				"source.name in ('ncbi-curated', 'ncbi-outgroup') and sequenceID = '"+sequenceID+"'"]).countResult.count;
			if(numSequences != 1) {
				glue.log("SEVERE", "Seg "+segNum+": Sequence not found: "+sequenceID);
			}

			var isolateSegNum;
			glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
				isolateSegNum = 
					glue.command(["show", "property", "isolate_segment"])
						.propertyValueResult.value;
			});
			if(isolateSegNum != segNum) {
				glue.log("SEVERE", "Table segment number "+segNum+" does not match DB segment number "+isolateSegNum+" for sequence "+sequenceID);
			}

		});
		
		var tableClusterIDs = _.uniq(_.map(refObjs, function(refObj) {
			return refObj["Cluster_tbe_n75_"+segObj.genogroupPThreshold].toLowerCase();
		}));
		if(tableClusterIDs.length > 1) {
			glue.log("SEVERE", "Multiple table cluster IDs ["+tableClusterIDs+"] for Genogroup "+ggrName+", segment "+segNum);
		}

		var dbClusterIDs = _.uniq(_.map(refObjs, function(refObj) {
			var dbClusterID;
			var sequenceID = refObj["Accesion No"];
			var sourceName = 'ncbi-curated';
			if(sequenceID == 'AM744982') {
				sourceName = 'ncbi-outgroup';
			}
			
			glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
				dbClusterID = 
					glue.command(["show", "property", 
						"cluster_tbe_n75_p"+segObj.genogroupPThreshold])
						.propertyValueResult.value;
			});
			return dbClusterID == null ? "singleton" : dbClusterID;
		}));
		if(dbClusterIDs.length > 1) {
//			throw new Error("Multiple DB cluster IDs ["+dbClusterIDs+"] for Genogroup "+ggrName+", segment "+segNum);
			glue.log("SEVERE", "Multiple DB cluster IDs ["+dbClusterIDs+"] for Genogroup "+ggrName+", segment "+segNum);
		}

		ggrObj.alignmentName = "AL_S"+segNum+"_GGr"+ggrName;
		ggrObj.almtDisplayName = "Genogroup "+ggrName;
		ggrObj.alphaSortKey = "Genogroup "+ggrName;
		ggrObj.cladeCategory = "genogroup"; 
		
	});
	
	// glue.logInfo("cladeStructureObj", cladeStructureObj);
	
});