glue.command(["multi-unset", "link-target", "host_alternate_name", "-a", "host"]);
glue.command(["multi-delete", "host", "-a"]);
glue.command(["multi-delete", "host_alternate_name", "-a"]);

var hostObjs;

glue.inMode("module/btvTabularUtility", function() {
	hostObjs = glue.tableToObjects(glue.command(["load-tabular", "tabular/formatted/hosts.txt"]));
});


_.each(hostObjs, function(hostObj) {
	var linneanName = hostObj["LinneanName"].trim();
	var hostId = linneanName.replace(" ", "_");
 	glue.command(["create", "custom-table-row", "host", hostId]);
	glue.inMode("custom-table-row/host/"+hostId, function() {
		glue.command(["set", "field", "display_name", linneanName]);
	}); 	 	
 	var aNameIdx = 1;
 	var alternateNames = hostObj["AlternateNames"].split(",");
 	_.each(alternateNames, function(alternateName) {
 		var aNameId = hostId+":"+aNameIdx;
 	 	glue.command(["create", "custom-table-row", "host_alternate_name", aNameId]);
 	 	aNameIdx++;
 		glue.inMode("custom-table-row/host_alternate_name/"+aNameId, function() {
			glue.command(["set", "field", "display_name", alternateName.trim()]);
			glue.command(["set", "link-target", "host", "custom-table-row/host/"+hostId]);
		}); 	 	
 	});
});