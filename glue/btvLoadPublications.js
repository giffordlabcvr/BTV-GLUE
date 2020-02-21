glue.command(["multi-delete", "publication", "-a"]);

var pubObjs;

function loadPublications(fileName) {

	glue.inMode("module/btvTabularUtility", function() {
		pubObjs = glue.tableToObjects(glue.command(["load-tabular", fileName]));
	});
	
	_.each(pubObjs, function(pubObj) {
		glue.log("FINEST", "Loading publication with ID", pubObj.id);
		glue.command(["create", "custom-table-row", "publication", pubObj.id]);
		glue.inMode("custom-table-row/publication/"+pubObj.id, function() {
			glue.command(["set", "field", "title", pubObj.title]);
			glue.command(["set", "field", "authors_short", pubObj.authors_short]);
			glue.command(["set", "field", "authors_full", pubObj.authors_full]);
			glue.command(["set", "field", "year", pubObj.year]);
			glue.command(["set", "field", "journal", pubObj.journal]);
			if(pubObj.volume != null) {
				glue.command(["set", "field", "volume", pubObj.volume]);
			}
			if(pubObj.issue != null) {
				glue.command(["set", "field", "issue", pubObj.issue]);
			}
			if(pubObj.pages != null) {
				glue.command(["set", "field", "pages", pubObj.pages]);
			}
			if(pubObj.doi != null) {
				glue.command(["set", "field", "url", pubObj.doi]);
			} else if(pubObj.url != null) {
				glue.command(["set", "field", "url", pubObj.url]);
			} else {
				glue.command(["set", "field", "url", "https://www.ncbi.nlm.nih.gov/pubmed/"+pubObj.id]);
			}
		});
	});

}

loadPublications("tabular/formatted/pubmed_publications.txt");

loadPublications("tabular/formatted/non_pubmed_publications.txt");
