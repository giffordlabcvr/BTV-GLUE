glue.inMode("module/btvRaxmlPhylogenyGenerator", function() {
    glue.command(["generate","nucleotide", "phylogeny", "BTV_OUTG_CODON_FULLGENOME", 
                  "-s", "btvFullGenomesPhyloColumnsSelector", "-w", "sequence.source.name in ('ncbi-curated-fullgenomes','ncbi-outgroup-fullgenomes')", 
                  "-o", "trees/phyloTrees/FULL_GENOMES.tree", "NEWICK_BOOTSTRAPS"]);
});
