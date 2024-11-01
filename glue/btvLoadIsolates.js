glue.command(["multi-delete", "isolate", "-a"]);

var isolateObjs;

glue.inMode("module/btvTabularUtility", function() {
	isolateObjs = glue.tableToObjects(glue.command(["load-tabular", "tabular/formatted/all_segs_per_isolate.txt"]));
});

var unlabelledIsolateObjs;

glue.inMode("module/btvTabularUtility", function() {
	unlabelledIsolateObjs = glue.tableToObjects(glue.command(["load-tabular", "tabular/formatted/unlabelled_isolates.txt"]));
});

function handleNull(input) {
	if(input == '-') {
		return null;
	}
	return input;
}

_.each(unlabelledIsolateObjs, function(unlabelledIsolateObj) {
	var isolateObj = {
		isolate: "Unlabelled_"+unlabelledIsolateObj["sequenceID"],
		country: handleNull(unlabelledIsolateObj["who_country.display_name"]),
		place_sampled: handleNull(unlabelledIsolateObj["gb_place_sampled"]),
		host: handleNull(unlabelledIsolateObj["gb_host"]),
		collection_year: handleNull(unlabelledIsolateObj["gb_collection_year"]),
		collection_month: handleNull(unlabelledIsolateObj["gb_collection_year_month"]),
		collection_month_day: handleNull(unlabelledIsolateObj["gb_collection_month_day"])
	};
	
	isolateObj["Seg-"+unlabelledIsolateObj.recogniser_segment] = unlabelledIsolateObj["sequenceID"];
	
	isolateObjs.push(isolateObj);
});


var seqIdToSegs = {};

var isolatePKtoIsolateObjs = {};

var i = 2;
_.each(isolateObjs, function(isolateObj) {

	glue.logInfo("row", i);
	glue.logInfo("isolateObj", isolateObj);
	i++;

	for(var i = 1; i <= 10; i++) {
		var seqID = isolateObj["Seg-"+i];
		if(seqID != null) {
			seqID = seqID.trim();
			var segList = seqIdToSegs[seqID];
			if(segList == null) {
				segList = [];
				seqIdToSegs[seqID] = segList;
			}
			segList.push(i);
		}
	}
	var isolatePK = isolateObjToIsolatePK(isolateObj);
	var isolateObjs = isolatePKtoIsolateObjs[isolatePK];
	if(isolateObjs == null) {
		isolateObjs = [];
		isolatePKtoIsolateObjs[isolatePK] = isolateObjs;
	}
	isolateObjs.push(isolateObj);
});

var metadataFields = ["host",
                      "country", 
                      "display_name",
                      "collection_year",
                      "collection_month",
                      "collection_month_day",
                      "sample_type",
                      "place_sampled",
                      "tissue_sampled",
                      "passage_history",
                      "passage_cells",
                      "clinical_symptoms"];

var multiGroups = [];

_.each(_.pairs(isolatePKtoIsolateObjs), function(pair) {
	var isolatePK = pair[0];
	var isolateObjs = pair[1];
	var isolateGroups = [];
	if(isolateObjs.length == 1) {
		isolateGroups = [isolateObjs];
	} else {
		var clashingFields = [];
		_.each(isolateObjs, function(isolateObj) {
			var addedToGroup = false;
			for(var k = 0; k < isolateGroups.length; k++) {
				var isolateGroup = isolateGroups[k];
				var possibleMemberOfGroup = true;
				for(var j = 0; j < isolateGroup.length; j++) {
					var isolateGroupMember = isolateGroup[j];
					for(var i = 0; i < metadataFields.length; i++) {
						var metadataField = metadataFields[i];
						if(isolateObj[metadataField] != null && isolateGroupMember[metadataField] != null &&
								isolateObj[metadataField].trim() != isolateGroupMember[metadataField].trim()) {
							possibleMemberOfGroup = false;
							clashingFields.push(metadataField);
						}
					}
					if(!possibleMemberOfGroup) {
						break;
					}
				}
				if(possibleMemberOfGroup) {
					isolateGroup.push(isolateObj);
					addedToGroup = true;
					break;
				}
			}
			if(!addedToGroup) {
				isolateGroups.push([isolateObj]);
			}
		});
		if(isolateGroups.length > 1) {
			clashingFields = _.uniq(clashingFields);
			multiGroups.push({
				isolatePK: isolatePK,
				isolateGroups: isolateGroups,
				clashingFields: clashingFields
			});
		}
	}
});

glue.logInfo("multiGroups", multiGroups);

if(multiGroups.length > 0) {
	throw new Error("Resolve multiGroups");
}

_.each(_.pairs(isolatePKtoIsolateObjs), function(pair) {
	var isolatePK = pair[0];
	var isolateObjs = pair[1];
	//glue.log("FINEST", "isolatePK", isolatePK);
 	glue.command(["create", "custom-table-row", "isolate", isolatePK]);
	
 	var seqIDs = [];
 	var isolateObjPubId = null;
	glue.inMode("custom-table-row/isolate/"+isolatePK, function() {
		var metadataValues = {};
		glue.command(["set", "field", "display_name", isolateObjs[0].isolate]);
		_.each(isolateObjs, function(isolateObj) {
			if(isolateObj.pub_id != null && isolateObj.pub_id.trim() != "UP") {
				isolateObjPubId = isolateObj.pub_id.trim();
			}
			_.each(metadataFields, function(metadataField) {
				if(isolateObj[metadataField] != null) {
					metadataValues[metadataField] = isolateObj[metadataField].trim();
				}
			});
			for(var i = 1; i <= 10; i++) {
				var seqID = isolateObj["Seg-"+i];
				if(seqID != null) {
					seqID = seqID.trim();
					seqIDs.push(seqID);
					glue.command(["add", "link-target", "sequence", "sequence/ncbi-curated/"+seqID]);
				}
			}
		});
		_.each(_.pairs(metadataValues), function(pair) {
			var field = pair[0];
			var value = pair[1];
			if(field == "country") {
				var countryParseResult = glue.command(["data-util", "parse-country", value]).dataUtilParseCountryResult;
				if(countryParseResult.parseSucceeded) {
					glue.command(["set", "link-target", "who_country", "custom-table-row/who_country/"+countryParseResult.isoAlpha3]);
				} else {
					throw new Error("Failed to parse country string: \""+value+"\"");
				}
			} else if(field == "host") {
				glue.command(["set", "link-target", "host", "custom-table-row/host/"+value.replace(" ", "_")]);
			} else {
				glue.command(["set", "field", field, value]);
			}
		});
	});
	// some isolate - publication associations are set in the isolate spreadsheet rather than the 
	// sequence XML.
	if(isolateObjPubId != null) {
		var singlePubIds = isolateObjPubId.split(',');
		_.each(singlePubIds, function(singlePubId) {
			var pubID = singlePubId.trim();
			var isoPubId = isolatePK+":"+pubID;
			glue.command(["create", "custom-table-row", "--allowExisting", "isolate_publication", isoPubId]);
			
			glue.inMode("custom-table-row/isolate/"+isolatePK, function() {
				glue.command(["add", "link-target", "isolate_publication", "custom-table-row/isolate_publication/"+isoPubId]);
			});
			glue.inMode("custom-table-row/publication/"+pubID, function() {
				glue.command(["add", "link-target", "isolate_publication", "custom-table-row/isolate_publication/"+isoPubId]);
			});
		});
	}
});


_.each(_.pairs(seqIdToSegs), function(pair) {
	var seqID = pair[0];
	var segs = pair[1];
	glue.inMode("sequence/ncbi-curated/"+seqID, function() {
		if(segs.length > 1) {
			throw new Error("Sequence \""+seqID+"\" referenced as multiple segments: "+JSON.stringify(segs));
		} else {
			var segNumber = segs[0];
			glue.command(["set", "field", "isolate_segment", segNumber]);
		}
	});
});

function isolateObjToIsolatePK(isolateObj) {
	glue.logInfo("isolateObj.isolate", isolateObj.isolate);
	return isolateObj.isolate.replace(/ |\//g, '_');
}