glue.inMode("module/btvPhyloImporter", function() {
    glue.command(["import", "phylogeny", "BTV_OUTG_CODON_FULLGENOME", 
                  "-w", "sequence.source.name in ('ncbi-curated-fullgenomes', 'ncbi-outgroup-fullgenomes')", 
                  "-i", "trees/phyloTrees/FULL_GENOMES.tree", "NEWICK_BOOTSTRAPS", 
                  "-f", "phylogeny" ]);
});
