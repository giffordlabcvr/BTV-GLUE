
for SEG in {1..10}
do 
 mafft --globalpair --maxiterate 1000 S${SEG}_unaligned.faa > S${SEG}_aligned.faa
done

