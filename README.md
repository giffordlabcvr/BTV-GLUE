## BTV-GLUE: Phylogenomic analysis of Bluetongue Virus


### Background

BTV-GLUE is a sequence-oriented resource for comparative genomic analysis of Bluetongue virus (BTV), developed using the GLUE software framework.

**Bluetongue virus (BTV)** is a double-stranded RNA virus from the *[Reoviridae](https://ictv.global/report_9th/dsRNA/Reoviridae)* family that causes bluetongue disease, primarily affecting domestic and wild ruminants like sheep, cattle, and goats. Transmitted by biting midges (*Culicoides* species), BTV can lead to severe disease, especially in sheep, characterized by fever, swelling, and cyanosis of the tongue, resulting in high mortality rates. While cattle and goats often show subclinical infections, the economic impact of BTV outbreaks is significant due to livestock losses, trade restrictions, and veterinary costs.

BTV's genome consists of 10 RNA segments, encoding structural and non-structural proteins, and the virus's segmented nature allows for genetic reassortment, leading to the emergence of new strains. With over 27 known serotypes and the potential for reassortment, developing effective vaccines is challenging. Current control measures include vaccination, vector control, and movement restrictions. Research efforts focus on improving vaccines that target multiple serotypes and understanding the virus's transmission dynamics, particularly its interactions with insect vectors.

**GLUE** is an open, integrated software toolkit designed for storing and interpreting sequence data. It supports the creation of custom projects, incorporating essential data items for comparative genomic analysis, such as sequences, multiple sequence alignments, genome feature annotations, and other associated metadata. Projects are loaded into the GLUE "engine," creating a relational database that represents the semantic relationships between data items. This structure enables systematic comparative analyses and the development of robust, sequence-based resources.

### Features

-   **Comprehensive Database**: Contains a curated collection of BTV sequences linked to isolates with detailed metadata, providing a robust foundation for comparative genomics.

-   **Genotyping and Visualization Tool**: Supports genotyping and visualization of submitted segment 2 sequences, enabling detailed analysis and comparison within this key genomic region.

-   **Pre-built Multiple Sequence Alignments**: Includes pre-built alignments for all 10 BTV segments, available for download in user-defined sections, to support customized genomic analyses.

-   **Phylogenetic Structure**: Organizes BTV sequence data in a phylogenetically-structured format, allowing users to explore evolutionary relationships among BTV strains and serotypes effectively.

-   **Automated Genotyping**: Utilizes GLUE's maximum likelihood clade assignment (MLCA) algorithm to classify BTV sequences by serotype and lineage, supporting systematic strain classification.

-   **Rich Annotations**: Features annotated reference sequences to enable comparative analysis, focusing on conservation, structural context, and genotype-to-phenotype relationships.

-   **Web User Interface**: The BTV-GLUE-WEB extension provides a web interface for browsing the BTV-GLUE database, along with tools for sequence analysis and visualization.

-   **Exploratory and Operational Applicability**: Suitable for research and public health applications, supporting exploratory studies and routine genomic surveillance of BTV.


Usage
-----

GLUE provides an interactive command line environment designed for the development and use of GLUE projects by bioinformaticians. This environment includes productivity-oriented features such as command completion, command history, and interactive paging through tabular data.

For detailed instructions on using BTV-GLUE for comparative genomic analysis, refer to the [GLUE reference documentation](http://glue-tools.cvr.gla.ac.uk/).

Data Sources
------------

BTV-GLUE relies on the following data sources:

-   [NCBI Nucleotide](https://www.ncbi.nlm.nih.gov/nuccore)
-   [NCBI Taxonomy](https://www.ncbi.nlm.nih.gov/taxonomy)

Contributing
------------

We welcome contributions from the community! If you're interested in contributing to BTV-GLUE, please review our [Contribution Guidelines](./md/CONTRIBUTING.md).

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./md/code_of_conduct.md)

License
-------

The project is licensed under the [GNU Affero General Public License v. 3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

Contact
-------

For questions, issues, or feedback, please contact us at <gluetools@gmail.com> or open an issue on the [GitHub repository](https://github.com/giffordlabcvr/BTV-GLUE/issues).

* * * * *
