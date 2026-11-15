// Everything you are likely to change lives in this one file.
//
// Hero media: for each view, put a video and (optionally) a still image in
// assets/views, named after the "file" value below, for example:
//   assets/views/01-clouds.mp4   the looping background clip
//   assets/views/01-clouds.jpg   the still (also .png or .webp), used for the
//                                thumbnail and shown while the video loads
//
// NOTE: sizes, floors, drive times, address, phone and email below are
// placeholders. Replace them with the real project details before launch.
window.SITE = {
  brand: "ELARA",
  place: "Sea Face Residences, Mumbai",
  bookingEmail: "sales@example.com",
  phone: "+91 00000 00000",
  mediaFolder: "assets/views",

  views: [
    {
      file: "01-clouds",
      label: "Above the clouds",
      title: "Mornings above the clouds",
      facts: "3 towers, 62 floors",
    },
    {
      file: "02-sea",
      label: "On the sea",
      title: "On the Arabian Sea",
      facts: "Worli Sea Face, Mumbai",
    },
    {
      file: "03-terrace",
      label: "Terrace",
      title: "Pool terrace",
      facts: "Penthouse, 410 m²",
    },
    {
      file: "04-skypool",
      label: "Sky pool",
      title: "A pool in the sky",
      facts: "Between the towers, on floor 58",
    },
    {
      file: "05-above",
      label: "From above",
      title: "From above",
      facts: "Gardens on every level",
    },
    {
      file: "06-sunrise",
      label: "Sunrise",
      title: "First light, every day",
      facts: "Completion 2028",
    },
  ],

  // The tower drawing has 62 floors. "floors" is [lowest, highest].
  residences: [
    {
      id: "two-bedroom",
      name: "Two-bedroom residence",
      size: 142,
      beds: 2,
      baths: 2,
      floors: [6, 24],
      note: "A corner living room with a full-width balcony facing the sea.",
    },
    {
      id: "three-bedroom",
      name: "Three-bedroom residence",
      size: 215,
      beds: 3,
      baths: 3,
      floors: [25, 44],
      note: "Half a floor to yourself, with morning light on one side and the sunset on the other.",
    },
    {
      id: "sky-villa",
      name: "Sky villa",
      size: 320,
      beds: 4,
      baths: 4,
      floors: [45, 57],
      note: "Two levels joined by a private stair, each with its own planted terrace.",
    },
    {
      id: "penthouse",
      name: "Penthouse",
      size: 410,
      beds: 5,
      baths: 5,
      floors: [59, 62],
      note: "The top four floors, above the sky bridge, with a private pool terrace.",
    },
  ],

  // "image" is a file name (without .jpg) in assets/gallery.
  amenities: [
    { image: "skypool", name: "Sky bridge pool", text: "A glass-sided pool that links all three towers on floor 58." },
    { image: "terrace", name: "Pool terrace", text: "A curved infinity pool with loungers and palms, looking straight out to sea." },
    { image: "gardens", name: "Garden terraces", text: "Planted terraces step up every tower, so there is green outside each home." },
    { image: "seafront", name: "Sea face promenade", text: "Walk out of the lobby and onto the waterfront." },
    { image: "arrival", name: "Cloud lounge", text: "A residents' lounge on floor 60 that sits above the monsoon cloud line." },
    { image: "sunrise", name: "Sunrise deck", text: "An east-facing roof deck for the first light of the day." },
  ],

  location: {
    title: ["Worli Sea Face,", "Mumbai"],
    text: "The towers stand on the curve of the bay, with the sea in front and the city directly behind. The business districts, the Sea Link and the old city are all a short drive away.",
    image: "seafront",
    places: [
      { name: "Bandra-Worli Sea Link", minutes: 4 },
      { name: "Mahalaxmi Racecourse", minutes: 8 },
      { name: "Lower Parel business district", minutes: 10 },
      { name: "Bandra Kurla Complex", minutes: 20 },
      { name: "Gateway of India", minutes: 30 },
      { name: "Mumbai International Airport", minutes: 35 },
    ],
    footnote: "Drive times are estimates outside peak hours.",
  },

  contact: {
    gallery: "Worli Sea Face, Mumbai 400030",
    hours: "Open every day, 10 am to 7 pm",
  },
};
