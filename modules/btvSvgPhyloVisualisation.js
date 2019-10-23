// simple recursive function to set treevisualiser-collapse to true on subtrees if 
// glueAlignmentName is set and the collapse flag is not already set.
function collapseClades(subtree, foundAnyAlignment) {
	var userData;
	var subtreeType;
	if(subtree.internal != null) { // internal node
		userData = subtree.internal.userData;
		subtreeType = "internal";
	} else { // leaf node
		userData = subtree.leaf.userData;
		subtreeType = "leaf";
	}
	var alignmentNames = userData.glueAlignmentNames;
	var recurse = true;
	var nextFoundAnyAlignment = foundAnyAlignment;
	var collapsed = userData["treevisualiser-collapsed"];
	if(subtreeType == "leaf" && userData["name"].indexOf("refseqs") > 0) {
		userData["treevisualiser-leafSourceName"] = "ncbi-curated";
		userData["treevisualiser-leafSequenceID"] = userData["name"].substring(userData["name"].lastIndexOf("/")+1);
	}
	var unclassified = false;
	var mainAlignmentName;
	if(collapsed == null) { // collapsed not already set to false
		var collapsedLabel = "";
		if(alignmentNames != null && alignmentNames.length > 0) {
			mainAlignmentName = alignmentNames[0];
			glue.inMode("alignment/"+mainAlignmentName, function() {
				collapsedLabel = glue.command(["show", "property", "displayName"]).propertyValueResult.value;
			});
			if(collapsedLabel.indexOf('Unclassified') >= 0) {
				unclassified = true;
			} else {
				nextFoundAnyAlignment = true;
			}
		}
		// don't collapse anything before you have found an alignment.
		if(nextFoundAnyAlignment && !unclassified) { 
			userData["treevisualiser-collapsed"] = "true";
			userData["treevisualiser-collapsedLabel"] = collapsedLabel;
			if(mainAlignmentName != null) {
				userData["treevisualiser-collapsedAlignment"] = mainAlignmentName;
			}
			recurse = false;
		}
	}
	if(subtreeType == "internal" && recurse) { // internal node
		var branches = subtree.internal.branch;
		_.each(branches, function(branch) {
			collapseClades(branch, nextFoundAnyAlignment);
		});
	}
}

function visualisePhyloAsSvg(document) {
	var glueTree;
	
	var queryName = document.inputDocument.queryName;
	var placementIndex = document.inputDocument.placementIndex;
	var maxNeighbours = null;
	var maxDistance = document.inputDocument.maxDistance;
	var placerResult = document.inputDocument.placerResult;
	var placerModule = document.inputDocument.placerModule;
	
	glue.logInfo("step 1");
	
	// generate a tree for the placement, as a command document.
	glue.inMode("module/"+placerModule, function() {
		glueTree = glue.command({
				"export": {
					"placement-from-document": {
						"phylogeny": {
							"placerResultDocument": placerResult,
							"placementIndex": placementIndex,
							"queryName": queryName, 
							"leafName": queryName
						}
					}
				}
		});
	});

	glue.logInfo("step 2");

	
	var neighbourObjs;

	glue.inMode("module/"+placerModule, function() {
		neighbourObjs = glue.tableToObjects(glue.command({
				"list": {
					"neighbour-from-document": {
						"placerResultDocument": placerResult,
						"placementIndex": placementIndex,
						"queryName": queryName, 
						"maxNeighbours": maxNeighbours, 
						"maxDistance": maxDistance
					}
				}
		}));
	});

	var neighbourLeafNames = [queryName];

	glue.logInfo("step 3");

	_.each(neighbourObjs, function(neighbourObj) {
		neighbourLeafNames.push("alignment/"+neighbourObj.alignmentName+"/member/"+neighbourObj.sourceName+"/"+neighbourObj.sequenceID);
	});

	glue.logInfo("step 4");

	
	glue.inMode("module/btvPhyloUtility", function() {
		// suppress the collapse of any subtree which is an ancestor of the query leaf or its neighbours
		glueTree = glue.command({
			"update-ancestor-subtrees" : {
				propertyName: "treevisualiser-collapsed",
				propertyValue: "false",
				leafNodeNames : neighbourLeafNames, 
				inputPhyloTree: glueTree
			}
		});
		
		glue.logInfo("step 5");
		
		// set leaf node to highlighted
		glueTree = glue.command({
			"update-leaves" : {
				propertyName: "treevisualiser-highlighted",
				propertyValue: "true",
				leafNodeNames : [queryName], 
				inputPhyloTree: glueTree
			}
		});

		glue.logInfo("step 6");

		// set leaf node to non-member
		glueTree = glue.command({
			"update-leaves" : {
				propertyName: "treevisualiser-nonmember",
				propertyValue: "true",
				leafNodeNames : [queryName], 
				inputPhyloTree: glueTree
			}
		});
		
		glue.logInfo("step 7");

		// set ancestor branches of leaf node to highlighted
		glueTree = glue.command({
			"update-ancestor-branches" : {
				propertyName: "treevisualiser-highlighted",
				propertyValue: "true",
				leafNodeNames : [queryName], 
				inputPhyloTree: glueTree
			}
		});

		glue.logInfo("step 8");

	});

	collapseClades(glueTree.phyloTree.root, false);

	glue.logInfo("step 9");
	
	// generate a visualisation document for the tree, 
	// with the visualisation maths etc. done
	var visualiseTreeResult;

	glue.inMode("module/btvTreeVisualiser", function() {
		visualiseTreeResult = glue.command({
			"visualise" : {
				"tree-document": {
					"treeDocument" : glueTree, 
					"pxWidth" : document.inputDocument.pxWidth, 
					"pxHeight" : document.inputDocument.pxHeight,
					"legendPxWidth" : document.inputDocument.legendPxWidth, 
					"legendPxHeight" : document.inputDocument.legendPxHeight,
					"leafTextAnnotationName": "sequenceIDPlusClade"
				}
			}
		});
	});

	glue.logInfo("step 10");

	// from the visualisation documents, generate SVGs as GLUE web files.
	var treeTransformResult;
	glue.inMode("module/btvTreeVisualisationTransformer", function() {
		treeTransformResult = glue.command({ "transform-to-web-file": 
			{
				"webFileType": "WEB_PAGE",
				"commandDocument":{
					transformerInput: {
						treeVisualisation: visualiseTreeResult.visDocument.treeVisualisation
					}
				},
				"outputFile": document.inputDocument.fileName
			}
		});
	});

	glue.logInfo("step 11");

	var legendTransformResult;
	glue.inMode("module/btvTreeVisualisationLegendTransformer", function() {
		legendTransformResult = glue.command({ "transform-to-web-file": 
			{
				"webFileType": "WEB_PAGE",
				"commandDocument":{
					transformerInput: {
						treeVisualisationLegend: visualiseTreeResult.visDocument.treeVisualisationLegend
					}
				},
				"outputFile": document.inputDocument.legendFileName
			}
		});
	});

	glue.logInfo("step 12");

	glue.logInfo("legendTransformResult", legendTransformResult);
	
	return {
		visualisePhyloAsSvgResult: {
			treeTransformResult: treeTransformResult,
			legendTransformResult: legendTransformResult
		}
	}
}