glue.inMode("module/btvPhyloUtility", function() {
    glue.command(["reroot-alignment-phylogeny", 
                  "BTV_OUTG_CODON_FULLGENOME", "phylogeny", 
                  "--whereClause", "sequence.source.name in ('ncbi-outgroup-fullgenomes')", 
                  "-o", "trees/phyloTrees/FULL_GENOMES_og_rerooted.tree", "NEWICK_BOOTSTRAPS"]);
});
