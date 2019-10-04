// map each segment number to a set of basal genogroups.
// during rerooting this is transformed to a where clause selecting members of the relevant GENO_CODON in the basal group
// e.g. ["G", "J"] becomes
// "(sequence.referenceSequences.name like 'REF_S2_GGrG%') or (sequence.referenceSequences.name like 'REF_S2_GGrJ%')"


var segmentToBasalGroupWhereClause = {
		"1": ["C", "D", "E"],
		"2": ["G", "J"],
		"3": ["C", "D", "E"],
		"4": ["C", "D", "E", "F", "G"],		
	    "5": ["D", "E", "F", "G", "H"],
	    "6": ["A", "B", "G"],
	    "7": ["D", "E", "H"],
	    "8": ["C", "D", "E", "H"], 
		"9": ["C"], 
		"10": ["D", "E", "H"]
};