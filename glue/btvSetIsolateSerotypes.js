var seqObjs = glue.tableToObjects(glue.command(["list", "sequence", "-w", 
 "source.name = 'ncbi-curated' and excluded = false and isolate_segment in ('2','6')",
 "sequenceID", "isolate.id", "isolate_segment", "gb_serotype", "recogniser_serotype"]));

// no isolate serotypes should be set from these sequences; they are post-serotype 27 and have not been classified yet.
var excluded_seqIDs = [
	"MF124283", "MF124287",
	"MF673721", "MF673725",
	"KX695171", "KX695175",
	"KY365755",
	"KX234079", "KX234083",
	"KR061882", "KR061883",
	"KP196604", "KP196608" 
                       ];

var isolateIDToSeg2Seqs = {};
var isolateIDToSeg6Seqs = {};

_.each(seqObjs, function(seqObj) {
	var isolateID = seqObj["isolate.id"];
	if(isolateID != null) {
		if(seqObj["isolate_segment"] == '2') {
			var seg2seqs = isolateIDToSeg2Seqs[isolateID];
			if(seg2seqs == null) {
				seg2seqs = [];
				isolateIDToSeg2Seqs[isolateID] = seg2seqs;
			}
			seg2seqs.push(seqObj);
		}
		if(seqObj["isolate_segment"] == '6') {
			var seg6seqs = isolateIDToSeg6Seqs[isolateID];
			if(seg6seqs == null) {
				seg6seqs = [];
				isolateIDToSeg6Seqs[isolateID] = seg6seqs;
			}
			seg6seqs.push(seqObj);
		}
	}
});

function setIsolateSegment(map, segment) {
	_.each(_.pairs(map), function(pair) {
		var isolateID = pair[0];
		var seqs = pair[1];
		
		var gb_serotype = null;
		var recogniser_serotype = null;
		
		_.each(seqs, function(seqObj) {
			if(excluded_seqIDs.indexOf(seqObj.sequenceID) == -1) {
				if(seqObj["gb_serotype"] != null) {
					if(gb_serotype == null) {
						gb_serotype = seqObj["gb_serotype"];
					} else if(gb_serotype != seqObj["gb_serotype"]) {
						throw new Error("gb_serotypes disagree for seg "+segment+" isolate "+isolateID);
					}
				}
				if(seqObj["recogniser_serotype"] != null) {
					if(recogniser_serotype == null) {
						recogniser_serotype = seqObj["recogniser_serotype"];
					} else if(recogniser_serotype != seqObj["recogniser_serotype"]) {
						throw new Error("recogniser_serotype disagree for seg "+segment+", isolate "+isolateID);
					}
				}
			}
		});
		glue.inMode("custom-table-row/isolate/"+isolateID, function() {
			if(gb_serotype != null) {
				glue.command(["set", "field", "seg"+segment+"serotype", gb_serotype]);
			} else if(recogniser_serotype != null) {
				glue.command(["set", "field", "seg"+segment+"serotype", recogniser_serotype]);
			}
		});
	});
}

setIsolateSegment(isolateIDToSeg2Seqs, "2");
setIsolateSegment(isolateIDToSeg6Seqs, "6");

