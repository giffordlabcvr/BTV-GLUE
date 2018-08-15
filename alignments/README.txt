Guide to the unconstrained alignments of BTV-GLUE

{n} is segment number.

alignments/btvCompSegNt/BTV_COMPL_SEG_NT_{n}.fna
alignments/btvCompSegNt/BTV_COMPL_SEG_NT_{n}.json
-- nucleotide alignments of ncbi-curated BTV complete segments, computed using MAFFT. 
-- these are used really just to identify the coding regions of each sequence.

alignments/btvOutgroupProtein/BTV_OUTG_UNALIGNED_{n}.faa
-- per segment protein FASTA file, including all BTV complete segments plus outgroups.

alignments/btvOutgroupProtein/BTV_OUTG_ALIGNED_{n}.faa
-- per segment protein FASTA alignment file, generated from above using plain MAFFT.

alignments/btvOutgroupCodon/BTV_OUTG_CODON_{n}.fna
alignments/btvOutgroupCodon/BTV_OUTG_CODON_{n}.json
-- per segment codon (i.e. nucleotide) alignments generated using GLUE BLAST importer, from BTV_OUTG_ALIGNED_{n}
-- these will be used to generate trees, to allow the selection of per segment genotypes.

alignments/btvOutgroupCodonAsProtein/BTV_OUTG_CODON_AS_PROTEIN_{n}.faa
-- these are just the results of applying the
fastaProteinAlignmentExporter to the btvOutgroupCodon alignments;
should be basically the same as BTV_OUTG_ALIGNED...
-- just looking at these in order to check that they will be OK for
GLUE to use when generating RAXML protein trees.

alignments/btvOutgroupCodon/BTV_OUTG_CODON_FULLGENOME.fna
alignments/btvOutgroupCodon/BTV_OUTG_CODON_FULLGENOME.json
-- Full genome concatenations of the above BTV_OUTG_CODON_{n} alignments.
