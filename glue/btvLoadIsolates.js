

var isolateObjs;

glue.inMode("module/btvTabularUtility", function() {
	isolateObjs = glue.tableToObjects(glue.command(["load-tabular", "tabular/formatted/all_segs_per_isolate.txt"]));
});

var seqIdToSegs = {};


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
/*	var isolatePK = isolateObjToIsolatePK(isolateObj);
	
	glue.command(["create", "custom-table-row", "isolate", isolatePK]);
	
	glue.inMode("custom-table-row/isolate/"+isolatePK, function() {
		glue.command(["set", "field", "display_name", isolateObj.isolate])
		for(var i = 1; i <= 10; i++) {
			var seqID = isolateObj["Seg-"+i];
			if(seqID != null) {
				seqID = seqID.trim();
				glue.command(["set", "link-target", "seg_"+i, "sequence/ncbi-curated/"+seqID]);
			}
		}
	});
*/	
});

_.each(_.pairs(seqIdToSegs), function(pair) {
	var seqID = pair[0];
	var segs = pair[1];
	glue.inMode("sequence/ncbi-curated/"+seqID, function() {
		glue.command(["set", "field", "spreadsheet_segment", segs.join('/')]);
	});
});

function isolateObjToIsolatePK(isolateObj) {
	glue.logInfo("isolateObj.isolate", isolateObj.isolate);
	return isolateObj.isolate.replace(/ |\//g, '_');
}