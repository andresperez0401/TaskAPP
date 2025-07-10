const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
        SELECTED_COUNTRIES: ["Australia","United Kingdom","Canada","Brazil"],
        infoPaises: [
            { country: "Australia", name: "Australia", description: "Descubre los mejores cursos de idiomas en Australia, donde el inglés no sera un problema.", imageUrl: "https://example.com/australia.jpg" },
            { country: "United Kingdom", name: "United Kingdom", description: "Cursos de inglés en el Reino Unido, desde Londres hasta Edimburgo.", imageUrl: "https://example.com/uk.jpg" },
            { country: "Canada", name: "Curso en Canadá", description: "Aprende Inglés en las mejores escuelas de Canadá.", imageUrl: "https://example.com/canada.jpg" },
            { country: "Brazil", name: "Curso en Brasil", description: "São Paulo, portugués brasileño.", imageUrl: "https://example.com/brazil.jpg" }
        ],
        cursos: [
            {
                country: "CampamentoVerano",
                name: "Campamento de Verano",
                destinos: "United States, Canada, Malta, Irlanda, Sudáfrica, Dubai, Reino Unido",
                edades: "12-17 años",
                description: "Un campamento de verano para jóvenes de 12 a 17 años.",
                imageUrl: "https://example.com/summer_camp.jpg",
                duration: "2 semanas",
                services: "Alojamiento, actividades, clases de inglés, excursiones",
                idiomas: "Inglés"
                },
                {
                country: "InglesUK",
                name: "Curso de Inglés en UK",
                destinos: "Reino Unido",
                edades: "18+",
                description: "Curso intensivo de inglés en Londres.",
                imageUrl: "https://example.com/uk_english.jpg",
                duration: "4 semanas",
                services: "Alojamiento con familia, clases, actividades culturales",
                idiomas: "Inglés"
                },
        ]
    },
    actions: {

    },
 };
};


export default getState;