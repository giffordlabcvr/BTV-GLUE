
for SEG in {1..10}
do 
 mafft BTV_OUTG_UNALIGNED_${SEG}.faa > BTV_OUTG_ALIGNED_${SEG}.faa
done

