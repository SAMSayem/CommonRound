import "dotenv/config";
import { connectDatabase, closeDatabase } from "../db.js";

const sampleEvents = [
  {
    title: "A Warmer Winter for Mirpur",
    description: "Help us collect, sort, and distribute clean winter clothes to families who need an extra layer this season. Bring gently used sweaters, shawls, blankets, or simply a few hours to help organise the distribution.",
    eventType: "Donation",
    imageUrl: "https://encdn.bd-pratidin.com/public/news_images/2025/10/03/1759494195-f535bb60d1057a578b05cd0da157c9eb.jpg",
    location: "Mirpur 10, Dhaka",
    days: 5,
  },
  {
    title: "Plant the Next Shade Tree",
    description: "Spend a morning adding new saplings to a neighbourhood green space. We'll bring seedlings and basic tools; you bring comfortable shoes, a water bottle, and a little enthusiasm for a greener Dhaka.",
    eventType: "Plantation",
    imageUrl: "https://i0.wp.com/obhizatrik.org/wp-content/uploads/2024/07/IMG-20240702-WA0014-1.jpg?fit=1600%2C1201&ssl=1",
    location: "Dhanmondi Lake, Dhaka",
    days: 7,
  },
  {
    title: "Clean Streets, Clear Skies",
    description: "Let's give a familiar street a fresh start. Volunteers will work in small teams to collect litter, sort recyclables, and share simple waste-sorting tips with nearby shops and residents.",
    eventType: "Cleanup",
    imageUrl: "https://vbd.com.bd/images/2025/10/batch-whatsapp-image-2025-10-11-at-215706-72cfb041jpg_1760522436.jpg",
    location: "Banani 11, Dhaka",
    days: 9,
  },
  {
    title: "Books, Brighter Beginnings",
    description: "Join a small reading circle for school-age children. We'll organise donated books, read together, and help young learners discover stories that make them curious about the world around them.",
    eventType: "Education",
    imageUrl: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=85",
    location: "Mohammadpur, Dhaka",
    days: 12,
  },
  {
    title: "A Shared Table for Everyone",
    description: "Help prepare and distribute fresh meal packs in a welcoming, organised setting. Tasks include packing, setting up the distribution area, and making sure every guest is treated with dignity.",
    eventType: "Food Drive",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=85",
    location: "Shahbag, Dhaka",
    days: 14,
  },
  {
    title: "Health Checks, Human Touch",
    description: "Support a community health day by welcoming visitors, helping with registration, guiding queues, and sharing essential health information with local families alongside volunteer professionals.",
    eventType: "Health Camp",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85",
    location: "Uttara Sector 7, Dhaka",
    days: 18,
  },
];

async function seed() {
  try {
    const db = await connectDatabase();
    const collection = db.collection("events");
    const existing = await collection.countDocuments({ creatorId: "commonground-demo" });
    if (existing) {
      console.log("Demo events already exist. No changes made.");
      return;
    }
    const now = new Date();
    const docs = sampleEvents.map((event) => {
      const { days, ...values } = event;
      const eventDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      eventDate.setHours(9, 0, 0, 0);
      return {
        ...values,
        eventDate,
        creatorId: "commonground-demo",
        creatorEmail: "hello@commonground.local",
        creatorName: "CommonGround Team",
        createdAt: now,
        updatedAt: now,
      };
    });
    const result = await collection.insertMany(docs);
    console.log(`Inserted ${result.insertedCount} upcoming demo events.`);
  } finally {
    await closeDatabase();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
