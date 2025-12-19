"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting database seed...');
    const categories = [
        { name: 'Study Session', icon: 'book' },
        { name: 'Party', icon: 'music' },
        { name: 'Sports & Fitness', icon: 'dumbbell' },
        { name: 'Food & Dining', icon: 'utensils' },
        { name: 'Outdoor Activity', icon: 'tree' },
        { name: 'Gaming', icon: 'gamepad' },
        { name: 'Movie Night', icon: 'film' },
        { name: 'Concert', icon: 'music' },
        { name: 'Networking', icon: 'users' },
        { name: 'Workshop', icon: 'briefcase' },
        { name: 'Volunteer', icon: 'heart' },
        { name: 'Social Gathering', icon: 'coffee' },
    ];
    console.log('Seeding event categories...');
    for (const category of categories) {
        await prisma.eventCategory.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    const interests = [
        'Sports & Fitness',
        'Arts & Music',
        'Technology & Gaming',
        'Food & Cooking',
        'Travel & Adventure',
        'Reading & Writing',
        'Movies & TV',
        'Business & Entrepreneurship',
        'Science & Research',
        'Social Justice & Activism',
        'Photography & Design',
        'Dance & Theater',
        'Outdoor Activities',
        'Volunteering',
        'Fashion & Beauty',
    ];
    console.log('Seeding interest categories...');
    for (const interest of interests) {
        await prisma.interestCategory.upsert({
            where: { name: interest },
            update: {},
            create: { name: interest },
        });
    }
    const colleges = [
        {
            name: 'Stanford University',
            domain: 'stanford.edu',
            location: 'Stanford, CA',
        },
        {
            name: 'Harvard University',
            domain: 'harvard.edu',
            location: 'Cambridge, MA',
        },
        { name: 'MIT', domain: 'mit.edu', location: 'Cambridge, MA' },
        {
            name: 'UC Berkeley',
            domain: 'berkeley.edu',
            location: 'Berkeley, CA',
        },
        { name: 'UCLA', domain: 'ucla.edu', location: 'Los Angeles, CA' },
        {
            name: 'Yale University',
            domain: 'yale.edu',
            location: 'New Haven, CT',
        },
        {
            name: 'Princeton University',
            domain: 'princeton.edu',
            location: 'Princeton, NJ',
        },
        {
            name: 'Columbia University',
            domain: 'columbia.edu',
            location: 'New York, NY',
        },
        {
            name: 'University of Chicago',
            domain: 'uchicago.edu',
            location: 'Chicago, IL',
        },
        {
            name: 'University of Pennsylvania',
            domain: 'upenn.edu',
            location: 'Philadelphia, PA',
        },
        {
            name: 'Duke University',
            domain: 'duke.edu',
            location: 'Durham, NC',
        },
        {
            name: 'Northwestern University',
            domain: 'northwestern.edu',
            location: 'Evanston, IL',
        },
        {
            name: 'Cornell University',
            domain: 'cornell.edu',
            location: 'Ithaca, NY',
        },
        {
            name: 'USC',
            domain: 'usc.edu',
            location: 'Los Angeles, CA',
        },
        {
            name: 'NYU',
            domain: 'nyu.edu',
            location: 'New York, NY',
        },
    ];
    console.log('Seeding colleges...');
    for (const college of colleges) {
        await prisma.college.upsert({
            where: { name: college.name },
            update: {},
            create: college,
        });
    }
    const cities = [
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
        'Austin', 'Jacksonville', 'San Francisco', 'Columbus', 'Fort Worth', 'Charlotte', 'Seattle', 'Denver', 'Washington', 'Boston',
        'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee',
        'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh',
        'Miami', 'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans', 'Wichita',
        'Cleveland', 'Bakersfield', 'Aurora', 'Honolulu', 'Anaheim', 'Santa Ana', 'Riverside', 'Corpus Christi', 'Lexington', 'Henderson',
        'Stockton', 'Saint Paul', 'St. Louis', 'Cincinnati', 'St. Petersburg', 'Pittsburgh', 'Greensboro', 'Lincoln', 'Anchorage', 'Plano',
        'Orlando', 'Irvine', 'Newark', 'Durham', 'Chula Vista', 'Toledo', 'Fort Wayne', 'St. Louis', 'Chandler', 'Laredo',
        'Norfolk', 'Madison', 'Durham', 'Lubbock', 'Buffalo', 'Jersey City', 'Chandler', 'Scottsdale', 'Glendale', 'Reno',
        'Winston-Salem', 'North Las Vegas', 'Gilbert', 'Chesapeake', 'Birmingham', 'Fremont', 'Richmond', 'Boise', 'San Bernardino', 'Spokane',
        'Baton Rouge', 'Des Moines', 'Modesto', 'Rochester', 'Tacoma', 'Fontana', 'Oxnard', 'Moreno Valley', 'Fayetteville', 'Yonkers',
        'Huntington Beach', 'Glendale', 'Santa Clarita', 'Grand Rapids', 'Amarillo', 'Port St. Lucie', 'Huntsville', 'Grand Prairie', 'Brownsville', 'Overland Park',
        'Santa Clarita', 'Providence', 'Garden Grove', 'Chattanooga', 'Oceanside', 'Jackson', 'Fort Lauderdale', 'Santa Rosa', 'Rancho Cucamonga', 'Portland',
        'Ontario', 'Vancouver', 'Sioux Falls', 'Peoria', 'Oxnard', 'Aurora', 'Rockford', 'Elk Grove', 'Salem', 'Corona',
        'Pembroke Pines', 'Eugene', 'Fort Collins', 'Cary', 'Santa Ana', 'Springfield', 'Lancaster', 'Salinas', 'Palmdale', 'Hayward',
        'Pomona', 'Alexandria', 'Lakewood', 'Sunnyvale', 'Hollywood', 'Torrance', 'Naperville', 'Escondido', 'Kansas City', 'Joliet',
        'Bridgeport', 'Savannah', 'Paterson', 'McAllen', 'Syracuse', 'Pasadena', 'Mesquite', 'Dayton', 'Fullerton', 'Orange',
        'Olathe', 'Thornton', 'Miramar', 'Denton', 'Roseville', 'Carrollton', 'Waco', 'Surprise', 'Sterling Heights', 'Vallejo',
        'Pasadena', 'Victorville', 'Allentown', 'Abilene', 'Norman', 'Beaumont', 'Independence', 'Evansville', 'Odessa', 'Frisco',
        'Ann Arbor', 'Athens', 'Round Rock', 'Thousand Oaks', 'Topeka', 'Simi Valley', 'Fargo', 'Concord', 'Lakeland', 'Clovis',
        'Columbia', 'El Monte', 'Abilene', 'Lansing', 'Downey', 'Westminster', 'Berkeley', 'Midland', 'Carlsbad', 'Richardson',
        'Arvada', 'Richmond', 'Fairfield', 'Inglewood', 'Broken Arrow', 'Miami Gardens', 'Burbank', 'Rochester', 'Gresham', 'Daly City',
        'Lewisville', 'Tempe', 'South Bend', 'Elgin', 'West Covina', 'Clearwater', 'Waterbury', 'Santa Clara', 'Provo', 'West Jordan',
        'Gainesville', 'Antioch', 'Cambridge', 'Edinburg', 'Lowell', 'Pueblo', 'Lafayette', 'Lakeland', 'Wilmington', 'Arlington',
        'Ventura', 'Everett', 'Davenport', 'Rialto', 'Tuscaloosa', 'Centennial', 'Murfreesboro', 'High Point', 'Billings', 'Richmond',
        'Killeen', 'Sandy Springs', 'Jurupa Valley', 'Hialeah', 'Allen', 'Rio Rancho', 'Yuma', 'Spokane Valley', 'Santa Monica', 'Kenosha',
        'El Cajon', 'Renton', 'Davenport', 'South Gate', 'Brockton', 'Las Cruces', 'Compton', 'Tyler', 'Nampa', 'Avondale',
        'Bend', 'Fayetteville', 'San Mateo', 'Hesperia', 'Green Bay', 'Westminster', 'Santa Barbara', 'Boca Raton', 'Albany', 'Norwalk',
        'San Angelo', 'Racine', 'Murrieta', 'Temecula', 'Sparks', 'Bellingham', 'Lakewood', 'Gary', 'Mission Viejo', 'Roswell',
        'Lynn', 'Redding', 'Yakima', 'Turlock', 'Greenville', 'St. George', 'Boulder', 'Kennewick', 'Fall River', 'Largo',
        'Thousand Oaks', 'Santa Monica', 'El Centro', 'Oshkosh', 'San Leandro', 'Appleton', 'Chico', 'Newton', 'Manteca', 'San Marcos',
        'Concord', 'Hammond', 'Fargo', 'Lodi', 'Carmel', 'Bismarck', 'San Rafael', 'Woodland', 'Palo Alto', 'Redwood City',
        'Yuba City', 'Madera', 'Santa Cruz', 'Eureka', 'Davis', 'Capitola', 'Monterey', 'Salinas', 'Watsonville', 'Hollister',
        'London', 'Paris', 'Tokyo', 'Sydney', 'Melbourne', 'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton',
        'Mexico City', 'Guadalajara', 'Monterrey', 'Buenos Aires', 'São Paulo', 'Rio de Janeiro', 'Brasília', 'Lima', 'Bogotá', 'Santiago',
        'Madrid', 'Barcelona', 'Rome', 'Milan', 'Naples', 'Venice', 'Florence', 'Berlin', 'Munich', 'Hamburg',
        'Frankfurt', 'Cologne', 'Amsterdam', 'Rotterdam', 'Brussels', 'Vienna', 'Zurich', 'Geneva', 'Stockholm', 'Oslo',
        'Copenhagen', 'Helsinki', 'Dublin', 'Edinburgh', 'Glasgow', 'Manchester', 'Liverpool', 'Birmingham', 'Leeds', 'Bristol',
        'Lisbon', 'Porto', 'Athens', 'Thessaloniki', 'Istanbul', 'Ankara', 'Dubai', 'Abu Dhabi', 'Doha', 'Riyadh',
        'Jeddah', 'Cairo', 'Alexandria', 'Casablanca', 'Lagos', 'Nairobi', 'Johannesburg', 'Cape Town', 'Mumbai', 'Delhi',
        'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
        'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Chongqing', 'Hangzhou', 'Wuhan', 'Xi\'an', 'Nanjing',
        'Hong Kong', 'Singapore', 'Bangkok', 'Jakarta', 'Manila', 'Ho Chi Minh City', 'Hanoi', 'Seoul', 'Busan', 'Taipei',
        'Kuala Lumpur', 'Phnom Penh', 'Vientiane', 'Yangon', 'Dhaka', 'Kathmandu', 'Colombo', 'Karachi', 'Lahore', 'Islamabad',
        'Tehran', 'Baghdad', 'Damascus', 'Beirut', 'Amman', 'Jerusalem', 'Tel Aviv', 'Haifa', 'Nicosia', 'Limassol',
        'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong',
        'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Napier', 'Palmerston North', 'Rotorua', 'New Plymouth', 'Invercargill',
        'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Kyoto', 'Saitama',
        'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu', 'Sakai', 'Niigata', 'Hamamatsu', 'Shizuoka', 'Okayama', 'Kumamoto',
        'Kagoshima', 'Hachioji', 'Utsunomiya', 'Matsuyama', 'Kanazawa', 'Nagano', 'Oita', 'Fukushima', 'Akita', 'Aomori',
        'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod', 'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don',
        'Ufa', 'Krasnoyarsk', 'Voronezh', 'Perm', 'Volgograd', 'Krasnodar', 'Saratov', 'Tyumen', 'Tolyatti', 'Izhevsk',
        'Barnaul', 'Ulyanovsk', 'Irkutsk', 'Khabarovsk', 'Yaroslavl', 'Vladivostok', 'Makhachkala', 'Tomsk', 'Orenburg', 'Kemerovo',
        'Novokuznetsk', 'Ryazan', 'Astrakhan', 'Naberezhnye Chelny', 'Penza', 'Lipetsk', 'Kirov', 'Cheboksary', 'Kaliningrad', 'Tula',
    ];
    console.log('Seeding cities...');
    let seededCount = 0;
    for (const cityName of cities) {
        try {
            await prisma.city.upsert({
                where: { name: cityName },
                update: {},
                create: {
                    name: cityName,
                },
            });
            seededCount++;
        }
        catch (error) {
            console.error(`Error seeding city ${cityName}:`, error);
        }
    }
    console.log(`Seeded ${seededCount} cities`);
    console.log('Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map