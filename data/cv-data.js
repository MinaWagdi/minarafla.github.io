/**
 * CV Data - Personal Information and Sections
 * 
 * To update your CV, just edit this file!
 * All sections are automatically generated from this data.
 */

const cvData = {
    // Personal Information (used in header)
    personalInfo: {
        name: 'Mina Rafla',
        title: 'Data scientist, PhD',
        photo: 'images/my_photo.jpg',
        aboutMe: `
            Hi, I'm Mina—a Data Scientist at Autobiz, the European leader in vehicle valuation.
            I hold a PhD in Computer Science and a degree in Computer Engineering. 
            I'm passionate about developing AI and machine learning solutions, with a strong enthusiasm for coding.
        `,
    },

    // Work Experience
    workExperience: [
        {
            title: 'Data scientist',
            organization: 'Autobiz',
            period: '03/2024 - Present',
            description: [
                'Developed and optimized ML models for used vehicle pricing and identification',
                'Packaged and deployed ML models to ensure seamless integration with internal processes',
                'Utilized LLMs, NER, and Sentence Transformer models for entity extraction, semantic matching, and text representation in a key enterprise project.'
            ]
        },
        {
            title: 'PhD/Researcher in Machine learning',
            organization: 'Orange Innovation',
            period: '10/2020 - 11/2023',
            description: [
                'Proposed new Ensemble machine Learning algorithms: Bayesian Decision Trees and Random Forests for heterogeneous treatment effect estimation.',
                'Created a new Python library: KUPLIFT for parameter-free machine learning algorithms for uplift estimation'
            ]
        }
    ],

    // Education
    education: [
        {
            degree: 'PhD in Computer Science',
            institution: 'Université de Caen Normandie, Caen, France',
            period: '2020 - 2023',
            // description: 'Additional details, GPA, honors, or relevant coursework.'
        },
        {
            degree: 'Masters in Data Science',
            institution: 'Polytech Nantes, Université de Nantes, Nantes, France',
            period: '2019 - 2020',
            // description: 'Additional details or achievements.'
        },
        {
            degree: 'Bachelor in Computer Engineering (Bac+5)',
            institution: 'Ain Shams University, Cairo, Egypt',
            period: '2014 - 2019',
            // description: 'Additional details or achievements.'
        }
        
    ],

    // Publications
    publications: [
        {
            title: 'Parameter-Free Bayesian Framework for Uplift Modeling Application on Telecom Data.',
            authors: 'Rafla, Mina, Nicolas Voisine, and Bruno Crémilleux.',
            venue: 'Joint European Conference on Machine Learning and Knowledge Discovery in Databases. Cham: Springer Nature Switzerland, 2023.',
            links: [
                { label: 'PDF', url: 'https://www.researchgate.net/profile/Nicolas-Voisine/publication/373482331_A_Parameter-Free_Bayesian_Framework_for_Uplift_Modeling_-Application_on_Telecom_Data/links/64ee0009e081b872fd07ead1/A-Parameter-Free-Bayesian-Framework-for-Uplift-Modeling-Application-on-Telecom-Data.pdf' },
                // { label: 'DOI', url: '#' },
                // { label: 'arXiv', url: '#' }
            ]
        },
        {
            title: 'Parameter-free bayesian decision trees for uplift modeling.',
            authors: 'Rafla, Mina, Nicolas Voisine, and Bruno Crémilleux.',
            venue: 'Pacific-Asia Conference on Knowledge Discovery and Data Mining. Cham: Springer Nature Switzerland, 2023.',
            links: [
                { label: 'PDF', url: 'https://hal.science/hal-04173558/document' },
                // { label: 'DOI', url: '#' }
            ]
        },
        {
            title: "Une approche bayésienne non paramétrique de sélection de variables pour la modélisation de l'uplift",
            authors: 'Rafla, M., Voisine, N., Crémilleux, B., & Boullé, M.',
            venue: ' 23ème Journées Francophones Extraction et Gestion de Connaissances (EGC 2023). 2023.',
            links: [
                { label: 'PDF', url: 'https://hal.science/hal-04024418/document' },
                // { label: 'DOI', url: '#' }
            ]
        },
        {
            title: 'A non-parametric bayesian approach for uplift discretization and feature selection',
            authors: 'Rafla, M., Voisine, N., Crémilleux, B., & Boullé, M.',
            venue: 'Joint European Conference on Machine Learning and Knowledge Discovery in Databases. Cham: Springer Nature Switzerland, 2022.',
            links: [
                { label: 'PDF', url: 'https://hal.science/hal-03788912/document' },
                // { label: 'DOI', url: '#' }
            ]
        },
        {
            title: 'Evaluation of uplift models with non-random assignment bias.',
            authors: 'Rafla, Mina, Nicolas Voisine, and Bruno Crémilleux. ',
            venue: 'International Symposium on Intelligent Data Analysis. Cham: Springer International Publishing, 2022.',
            links: [
                { label: 'PDF', url: 'https://hal.science/hal-03698545v1/file/mainIDA22.pdf' },
                // { label: 'DOI', url: '#' }
            ]
        },
        {
            title: "Evaluation de l'uplift sur des données biaisées dans le cas du Non-Random Assignment.",
            authors: 'Rafla, Mina, Nicolas Voisine, and Bruno Crémilleux. ',
            venue: 'EGC. 2022.',
            links: [
                { label: 'PDF', url: 'https://hal.science/hal-03707022/document' },
                // { label: 'DOI', url: '#' }
            ]
        }
    ],

    // Skills (organized by category)
    skills: [
        {
            category: 'Programming Languages',
            items: ['Python', 'JavaScript', 'Java', 'C++']
        },
        {
            category: 'Frameworks & Tools',
            items: ['React', 'Node.js', 'Docker', 'Git']
        },
        {
            category: 'Languages',
            items: ['English (Fluent)', 'French (Native)', 'Arabic (Native)']
        }
    ],

    // Highlights
    highlights: [
        {
            title: 'KUPLIFT Library',
            organization: 'Open Source Project',
            year: '2023',
            description: 'Created a Python library for parameter-free machine learning algorithms for uplift estimation. Available on GitHub and PyPI.',
            icon: '📦',
            link: 'https://github.com/UData-Orange/kuplift'
        },
        {
            title: 'Three Minute Thesis',
            organization: 'Université de Caen Normandie',
            year: '2023',
            description: 'Participated in the Three Minute Thesis competition, presenting PhD research in an accessible format.',
            icon: '🎤',
            link: 'https://drive.google.com/file/d/1lzOL_ZKkUEn52Pjock64_-ZpRBhXzk4y/view?usp=sharing'
        }
    ]
};

