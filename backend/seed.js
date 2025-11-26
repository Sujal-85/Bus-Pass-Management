const mongoose = require('mongoose');
const BusPass = require('./models/BusPass');
const Route = require('./models/Route');
require('dotenv').config();

const departments = ['Computer Techology', 'Mechanical Engineering', 'Electronics & Telecommunication', 'Civil Engineering', 'Electrical Engineering'];
const passTypes = ['semester', 'yearly'];

const busData = [
    {
        name: "takari",
        from: "Vita",
        stops: [
            { name: "shirte", semester: 8450, yearly: 16900 },
            { name: "yedemachhindra", semester: 8450, yearly: 16900 },
            { name: "bhavaninaar", semester: 8450, yearly: 16900 },
            { name: "dudhari", semester: 8450, yearly: 16900 },
            { name: "takari", semester: 8450, yearly: 16900 },
            { name: "tupari", semester: 7800, yearly: 15600 },
            { name: "ghoaan", semester: 7800, yearly: 15600 },
            { name: "kundal", semester: 7150, yearly: 14300 },
            { name: "balavadi", semester: 5200, yearly: 10400 },
            { name: "aalsund", semester: 3900, yearly: 7800 }
        ]
    },
    {
        name: "kirloskarwadi",
        from: "Vita",
        stops: [
            { name: "dudhondi", semester: 8450, yearly: 16900 },
            { name: "kirloskarwadi", semester: 7800, yearly: 15600 },
            { name: "palus colony", semester: 7800, yearly: 15600 },
            { name: "palus", semester: 7800, yearly: 15600 },
            { name: "balavadi fata", semester: 5525, yearly: 11050 },
            { name: "aalsund", semester: 3900, yearly: 7800 },
            { name: "khambale", semester: 2275, yearly: 4550 }
        ]
    },
    {
        name: "aamanaapur",
        from: "Vita",
        stops: [
            { name: "burli", semester: 8125, yearly: 16250 },
            { name: "Aamanapur", semester: 8450, yearly: 16900 },
            { name: "palus", semester: 7800, yearly: 15600 },
            { name: "sandgewadi", semester: 7800, yearly: 15600 },
            { name: "bambavde", semester: 7800, yearly: 15600 },
            { name: "andhali fata", semester: 6500, yearly: 13000 },
            { name: "balavadi fata", semester: 5525, yearly: 11050 },
            { name: "yealavi fata", semester: 9100, yearly: 18200 }
        ]
    },
    {
        name: "kadegaon",
        from: "Vita",
        stops: [
            { name: "nerli", semester: 8450, yearly: 16900 },
            { name: "kadegaon", semester: 7150, yearly: 14300 },
            { name: "soholi", semester: 6500, yearly: 13000 },
            { name: "hingangaon", semester: 7150, yearly: 14300 },
            { name: "Aamarapur", semester: 6500, yearly: 13000 },
            { name: "shivani", semester: 6045, yearly: 12090 },
            { name: "yavlewadi", semester: 5395, yearly: 10790 },
            { name: "hanmantdiye", semester: 5200, yearly: 10400 },
            { name: "Aambegaon", semester: 4550, yearly: 9100 }
        ]
    },
    {
        name: "bhalavni",
        from: "Vita",
        stops: [
            { name: "bhalavni", semester: 5200, yearly: 10400 },
            { name: "panchlingnagr", semester: 5200, yearly: 10400 },
            { name: "kalabi", semester: 4225, yearly: 8450 },
            { name: "dhavleshwar", semester: 3900, yearly: 7800 },
            { name: "suryanagar", semester: 3250, yearly: 6500 },
            { name: "vita", semester: 7800, yearly: 15600 },
            { name: "adarsh clg", semester: 7800, yearly: 15600 }
        ]
    },
    {
        name: "kharsundi",
        from: "Vita",
        stops: [
            { name: "kharsundi", semester: 11700, yearly: 23400 },
            { name: "dhabadwadi", semester: 11050, yearly: 22100 },
            { name: "aaotewadi", semester: 11050, yearly: 22100 },
            { name: "nelkaranji", semester: 9750, yearly: 19500 },
            { name: "bhivgaat", semester: 9100, yearly: 18200 },
            { name: "sultangade", semester: 7800, yearly: 15600 },
            { name: "khanapur", semester: 7150, yearly: 14300 },
            { name: "tamkhadi", semester: 6500, yearly: 13000 },
            { name: "jakhinwadi", semester: 6500, yearly: 13000 },
            { name: "yenwadi", semester: 5200, yearly: 10400 },
            { name: "renavi", semester: 4550, yearly: 9100 }
        ]
    },
    {
        name: "tasagaon",
        from: "Vita",
        stops: [
            { name: "tasagaon", semester: 7150, yearly: 14300 },
            { name: "vanjarwadi", semester: 6175, yearly: 12350 },
            { name: "visapur", semester: 5200, yearly: 10400 },
            { name: "shirgaav", semester: 5200, yearly: 10400 },
            { name: "panmalewadi", semester: 5250, yearly: 10500 },
            { name: "baorgaon", semester: 5750, yearly: 11500 },
            { name: "limba", semester: 3250, yearly: 6500 },
            { name: "aalte", semester: 3250, yearly: 6500 },
            { name: "karve", semester: 2750, yearly: 5500 },
            { name: "adarsh clg", semester: 3900, yearly: 7800 }
        ]
    },
    {
        name: "devrashtri",
        from: "Vita",
        stops: [
            { name: "vadireyabaag", semester: 5525, yearly: 11050 },
            { name: "shelkbaav", semester: 5200, yearly: 10400 },
            { name: "vangi", semester: 6175, yearly: 12350 },
            { name: "ambak fata", semester: 7150, yearly: 13800 },
            { name: "chinchni ambak", semester: 7800, yearly: 15600 },
            { name: "aasad fata", semester: 7800, yearly: 15600 },
            { name: "mohitevadegaon", semester: 7800, yearly: 15600 },
            { name: "devrashtri", semester: 7800, yearly: 15600 },
            { name: "shirgaon", semester: 7625, yearly: 15210 },
            { name: "shirgaon fata", semester: 6175, yearly: 12350 },
            { name: "vita", semester: 7625, yearly: 15210 },
            { name: "adarsh clg", semester: 7950, yearly: 15900 }
        ]
    },
    {
        name: "kaolagao",
        from: "Vita",
        stops: [
            { name: "kaolagao", semester: 2275, yearly: 4550 },
            { name: "siddhewadi", semester: 3120, yearly: 6240 },
            { name: "savalaj", semester: 7410, yearly: 14820 },
            { name: "bastwade", semester: 4290, yearly: 8580 },
            { name: "balagavde", semester: 5100, yearly: 10200 },
            { name: "manjarde", semester: 6750, yearly: 13500 },
            { name: "hatnur", semester: 7500, yearly: 15000 },
            { name: "hatnoli", semester: 7500, yearly: 15000 },
            { name: "dhamani", semester: 7650, yearly: 15300 },
            { name: "bamani", semester: 7500, yearly: 15000 },
            { name: "chinchni", semester: 8700, yearly: 17400 },
            { name: "mangrula", semester: 9000, yearly: 18000 },
            { name: "karve", semester: 10500, yearly: 21000 },
            { name: "adarsh clg", semester: 10650, yearly: 21300 }
        ]
    },
    {
        name: "vikhale",
        from: "Vita",
        stops: [
            { name: "bhambade", semester: 4650, yearly: 9300 },
            { name: "devnagar fata", semester: 5150, yearly: 10300 },
            { name: "jondhalkhindi fata", semester: 5250, yearly: 10500 },
            { name: "lenge", semester: 5700, yearly: 11400 },
            { name: "pamp", semester: 5850, yearly: 11700 },
            { name: "shala", semester: 6150, yearly: 12300 },
            { name: "bus stand", semester: 6450, yearly: 12900 },
            { name: "galake vastifata", semester: 6600, yearly: 13200 },
            { name: "devkhandi kaman", semester: 7200, yearly: 14400 },
            { name: "main chauk", semester: 7200, yearly: 14400 },
            { name: "bhikwadi fata", semester: 5700, yearly: 11400 },
            { name: "kaledhona fata", semester: 5850, yearly: 11700 },
            { name: "shivshakti dhaba", semester: 6150, yearly: 12300 },
            { name: "stand fata", semester: 6450, yearly: 12900 },
            { name: "aatkari mala", semester: 6900, yearly: 13800 },
            { name: "mahalakshmi servicing center", semester: 7200, yearly: 14400 },
            { name: "khandoba mandir", semester: 3900, yearly: 7800 },
            { name: "highschool", semester: 3900, yearly: 7800 },
            { name: "vikhale fata", semester: 8100, yearly: 16200 }
        ]
    },
    {
        name: "pusesavali",
        from: "Vita",
        stops: [
            { name: "jayramswami vadgaon", semester: 11700, yearly: 23400 },
            { name: "pusesavali", semester: 11700, yearly: 23400 },
            { name: "raygaon", semester: 10400, yearly: 20800 },
            { name: "hingangaon budrul", semester: 9750, yearly: 19500 },
            { name: "upale mayani", semester: 8450, yearly: 16900 },
            { name: "yede fata", semester: 8060, yearly: 16120 },
            { name: "belvade", semester: 7800, yearly: 15600 },
            { name: "soholi", semester: 7150, yearly: 14300 },
            { name: "kadepur", semester: 6500, yearly: 13000 }
        ]
    },
    {
        name: "maayani",
        from: "Vita",
        stops: [
            { name: "maayani", semester: 6825, yearly: 13650 },
            { name: "mahuli", semester: 6500, yearly: 13000 },
            { name: "chikhali", semester: 5850, yearly: 11700 },
            { name: "bhagyanagar", semester: 4550, yearly: 9100 },
            { name: "nagewadi", semester: 3250, yearly: 6500 },
            { name: "ghanavad", semester: 3250, yearly: 6500 },
            { name: "gardi", semester: 3250, yearly: 6500 },
            { name: "vita", semester: 3250, yearly: 6500 },
            { name: "adarsh clg", semester: 3250, yearly: 6500 }
        ]
    },
    {
        name: "aatpadi",
        from: "Vita",
        stops: [
            { name: "aatpadi", semester: 17550, yearly: 35100 },
            { name: "tadwale", semester: 14300, yearly: 28600 },
            { name: "kargani", semester: 13650, yearly: 27300 },
            { name: "gonewadi", semester: 12350, yearly: 24700 },
            { name: "bhivghat", semester: 9650, yearly: 19300 },
            { name: "manewadi", semester: 11375, yearly: 22750 },
            { name: "bhud", semester: 7085, yearly: 14170 },
            { name: "chinchale", semester: 8840, yearly: 17680 },
            { name: "valvan", semester: 7800, yearly: 15600 }
        ]
    },
    {
        name: "khanapur",
        from: "Vita",
        stops: [
            { name: "khanapur", semester: 7150, yearly: 14300 },
            { name: "tamkhadi", semester: 6500, yearly: 13000 },
            { name: "kacherawadi", semester: 6050, yearly: 12100 },
            { name: "ghotiwadi", semester: 5900, yearly: 11800 },
            { name: "ghotikhurda", semester: 6200, yearly: 12400 },
            { name: "paare", semester: 4850, yearly: 9700 },
            { name: "kurli fata", semester: 3500, yearly: 7000 }
        ]
    },
    {
        name: "mhasvad",
        from: "Vita",
        stops: [
            { name: "mhasvad", semester: 12500, yearly: 25000 },
            { name: "divad", semester: 14300, yearly: 28600 },
            { name: "dhakani", semester: 13000, yearly: 26000 },
            { name: "vadjal", semester: 12155, yearly: 24310 },
            { name: "kukudvada", semester: 10010, yearly: 20020 },
            { name: "agasthwadi fata", semester: 9100, yearly: 18200 }
        ]
    }
];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await BusPass.deleteMany({});
        await Route.deleteMany({});
        console.log('Cleared existing data');

        // Seed Routes
        await Route.insertMany(busData);
        console.log(`Seeded ${busData.length} routes`);

        const branches = ['Diploma', 'Engineering', 'Pharmacy', 'ITI'];
        const students = [];

        for (const branch of branches) {
            for (let i = 0; i < 15; i++) { // 15 students per branch = 60 total
                const route = randomItem(busData);
                const passType = randomItem(passTypes);
                const passAmount = passType === 'semester' ? 5000 : 9000;
                const receivedAmount = randomInt(1000, passAmount);

                students.push({
                    formType: branch,
                    date: new Date(2025, randomInt(0, 11), randomInt(1, 28)),
                    academicYear: '2025-2026',
                    studentId: `${branch.substring(0, 3).toUpperCase()}${2025000 + i}`,
                    studentName: `${branch} Student ${i + 1}`,
                    mobileNo: `98765432${String(i).padStart(2, '0')}`,
                    EmailId: `student${branch}${i + 1}@example.com`,
                    department: randomItem(departments),
                    class: `${randomInt(1, 4)}th Year`,
                    semester: `${randomInt(1, 8)}`,
                    busRoute: route.name,
                    routeTo: 'College',
                    passType: passType,
                    passAmount: passAmount,
                    receivedAmount: receivedAmount,
                    pendingAmount: passAmount - receivedAmount,
                    status: 'active',
                });
            }
        }

        await BusPass.insertMany(students);
        console.log(`Seeded ${students.length} student records`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
