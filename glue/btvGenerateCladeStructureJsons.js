
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
	cladeStructureObj.alignmentName = "AL_S"+segNum+"_MASTER";
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

		var firstSequenceID;
		_.each(refObjs, function(refObj) {
			var sequenceID = refObj["Accesion No"];
			if(firstSequenceID == null) {
				firstSequenceID = sequenceID;
			}
			var sourceName = 'ncbi-curated';
			if(sequenceID == 'AM744982') {
				sourceName = 'ncbi-outgroup';
			}
			if(sequenceID == segObj.masterRef) {
				ggrObj.constrainingRef = {sequenceID: sequenceID};
				
			}
			var numSequences = glue.command(["count", "sequence", "-w", 
				"source.name in ('ncbi-curated', 'ncbi-outgroup') and sequenceID = '"+sequenceID+"'"]).countResult.count;
			if(numSequences != 1) {
				throw new Error("Seg "+segNum+": Sequence not found: "+sequenceID);
			}

			var isolateSegNum;
			glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
				isolateSegNum = 
					glue.command(["show", "property", "isolate_segment"])
						.propertyValueResult.value;
			});
			if(isolateSegNum != segNum) {
				throw new Error("Table segment number "+segNum+" does not match DB segment number "+isolateSegNum+" for sequence "+sequenceID);
			}
		});
		if(ggrObj.constrainingRef == null) {
			ggrObj.constrainingRef = {sequenceID: firstSequenceID};
		}
		ggrObj.alignmentName = "AL_S"+segNum+"_GGr"+ggrName;
		ggrObj.almtDisplayName = "Genogroup "+ggrName;
		ggrObj.alphaSortKey = ggrName;
		ggrObj.cladeCategory = "genogroup"; 

		checkClusterIDs(refObjs, segObj.genogroupPThreshold, segNum, ggrObj.almtDisplayName);
		

		var genogroupRefSeqObjs = [];
		
		if(segObj.genotypePThreshold != null) {
			// group the reference sequences within this genogroup into genotypes
			var gtNameToRefObjs = _.groupBy(refObjs, function(ro) {return ro["GenotypeName"];} );
			ggrObj.childAlignments = []; 
			
			_.each(_.pairs(gtNameToRefObjs), function(pair2) {
				var gtName = pair2[0];
				var gtRefObjs = pair2[1];

				if(gtName == "unclassified") {
					_.each(gtRefObjs, function(uncRefObj) {
						var uncGtObj = {};
						var uncSequenceID = uncRefObj["Accesion No"];
						uncGtObj.alignmentName = "AL_S"+segNum+"_GGr"+ggrName+"_Unclassified_"+uncSequenceID;
						uncGtObj.almtDisplayName = "Unclassified Genogroup "+ggrName+" ("+uncSequenceID+")";
						uncGtObj.cladeCategory = "genotype";
						uncGtObj.numericSortKey = "999";
						uncGtObj.alphaSortKey = uncSequenceID;
						uncGtObj.constrainingRef = { sequenceID: uncSequenceID};
						uncGtObj.referenceSequences = [{ sequenceID: uncSequenceID}];
						ggrObj.childAlignments.push(uncGtObj);
					});
					
				} else {
					var gtObj = {};
					gtObj.alignmentName = "AL_S"+segNum+"_GGr"+ggrName+"_Gt"+gtName;
					gtObj.almtDisplayName = "Genotype "+gtName;
					gtObj.cladeCategory = "genotype"

					checkClusterIDs(gtRefObjs, segObj.genotypePThreshold, segNum, gtObj.almtDisplayName);
		
					var alphaSortKey = gtName.replace(/[\d]+/g, "");
					if(alphaSortKey.length > 0) {
						gtObj.alphaSortKey = alphaSortKey;
					}
					gtObj.numericSortKey = gtName.replace(/[A-Z]+/g, "");

					var firstSequenceID;
					_.each(gtRefObjs, function(gtRefObj) {
						var sequenceID = gtRefObj["Accesion No"];
						if(firstSequenceID == null) {
							firstSequenceID = sequenceID;
						}
						if(sequenceID == segObj.masterRef) {
							gtObj.constrainingRef = {sequenceID: sequenceID};
							
						}
					});
					if(gtObj.constrainingRef == null) {
						gtObj.constrainingRef = {sequenceID: firstSequenceID};
					}

					
					gtObj.referenceSequences = _.map(gtRefObjs, function(gtro) {
						return { "sequenceID": gtro["Accesion No"] };
					});
					
					ggrObj.childAlignments.push(gtObj);
				}
				
			});
			
		} else {
			ggrObj.referenceSequences = _.map(refObjs, function(ro) {
				return { "sequenceID": ro["Accesion No"] };
			});
		}
		
		cladeStructureObj.childAlignments.push(ggrObj);
		
	});
	
	glue.command(["file-util", "save-string", JSON.stringify(cladeStructureObj, null, 2), "json/S"+segNum+"_clade_structure_and_refs.json"]);
	
});

function checkClusterIDs(refObjs, pThreshold, segNum, cladeName) {
	var tableClusterIDs = _.uniq(_.map(refObjs, function(refObj) {
		return refObj["Cluster_tbe_n75_"+pThreshold].toLowerCase();
	}));
	if(tableClusterIDs.length > 1) {
		throw new Error("Multiple table cluster IDs ["+tableClusterIDs+"] for "+cladeName+", segment "+segNum);
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
					"cluster_tbe_n75_p"+pThreshold])
					.propertyValueResult.value;
		});
		return dbClusterID == null ? "singleton" : dbClusterID;
	}));
	if(dbClusterIDs.length > 1) {
		throw new Error("Multiple DB cluster IDs ["+dbClusterIDs+"] for "+cladeName+", segment "+segNum);
	}
}