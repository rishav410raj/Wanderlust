
require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../models/listing");

const categoriesData = [
    {
        title: "Cozy Beachfront Cottage",
        categories: ["Trending", "Rooms", "Amazing Pools"]
    },
    {
        title: "Modern Loft in Downtown",
        categories: ["Trending", "Rooms", "Iconic Cities"]
    },
    {
        title: "Mountain Retreat",
        categories: ["Trending", "Rooms", "Mountains"]
    },
    {
        title: "Historic Villa in Tuscany",
        categories: ["Trending", "Rooms", "Farms"]
    },
    {
        title: "Secluded Treehouse Getaway",
        categories: ["Trending", "Camping", "Farms"]
    },
    {
        title: "Beachfront Paradise",
        categories: ["Trending", "Rooms", "Amazing Pools"]
    },
    {
        title: "Rustic Cabin by the Lake",
        categories: ["Trending", "Camping", "Mountains"]
    },
    {
        title: "Luxury Penthouse with City Views",
        categories: ["Trending", "Rooms", "Iconic Cities"]
    },
    {
        title: "Ski-In/Ski-Out Chalet",
        categories: ["Trending", "Rooms", "Mountains"]
    },
    {
        title: "Safari Lodge in the Serengeti",
        categories: ["Trending", "Camping"]
    },
    {
        title: "Historic Canal House",
        categories: ["Trending", "Rooms", "Iconic Cities"]
    },
    {
        title: "Private Island Retreat",
        categories: ["Trending", "Rooms", "Amazing Pools"]
    },
    {
        title: "Charming Cottage in the Cotswolds",
        categories: ["Trending", "Rooms", "Farms"]
    },
    {
        title: "Historic Brownstone in Boston",
        categories: ["Trending", "Rooms", "Iconic Cities"]
    },
    {
        title: "Beachfront Bungalow in Bali",
        categories: ["Trending", "Rooms", "Amazing Pools"]
    },
    {
        title: "Mountain View Cabin in Banff",
        categories: ["Trending", "Camping", "Mountains"]
    },
    {
        title: "Art Deco Apartment in Miami",
        categories: ["Trending", "Rooms", "Iconic Cities"]
    },
    {
        title: "Tropical Villa in Phuket",
        categories: ["Trending", "Rooms", "Amazing Pools"]
    },
    {
        title: "Historic Castle in Scotland",
        categories: ["Trending", "Rooms", "Castles"]
    },
    {
        title: "Desert Oasis in Dubai",
        categories: ["Trending", "Rooms", "Amazing Pools"]
    },
    {
        title: "Rustic Log Cabin in Montana",
        categories: ["Trending", "Camping", "Mountains"]
    },
    {
        title: "Beachfront Villa in Greece",
        categories: ["Trending", "Rooms", "Amazing Pools"]
    },
    {
        title: "Eco-Friendly Treehouse Retreat",
        categories: ["Trending", "Camping", "Farms"]
    },
    {
        title: "Historic Cottage in Charleston",
        categories: ["Trending", "Rooms", "Iconic Cities"]
    },
    {
        title: "Modern Apartment in Tokyo",
        categories: ["Trending", "Rooms", "Iconic Cities"]
    },
    {
        title: "Lakefront Cabin in New Hampshire",
        categories: ["Trending", "Camping", "Mountains"]
    },
    {
        title: "Luxury Villa in the Maldives",
        categories: ["Trending", "Rooms", "Amazing Pools"]
    },
    {
        title: "Ski Chalet in Aspen",
        categories: ["Trending", "Rooms", "Mountains"]
    },
    {
        title: "Secluded Beach House in Costa Rica",
        categories: ["Trending", "Rooms", "Amazing Pools","Arctic"]
    }
];

async function addCategories() {
    try {
        if (!process.env.ATLASDB_URL) {
            throw new Error("ATLASDB_URL is missing from your .env file");
        }

        await mongoose.connect(process.env.ATLASDB_URL);

        console.log("Connected to MongoDB");

        const collection = Listing.collection;

        let matched = 0;
        let updated = 0;
        let notFound = [];

        for (const item of categoriesData) {
            const result = await collection.updateOne(
                { title: item.title },
                { $set: { categories: item.categories } }
            );

            if (result.matchedCount > 0) {
                matched++;

                if (result.modifiedCount > 0) {
                    updated++;
                }

                console.log(
                    `${item.title}: matched=${result.matchedCount}, modified=${result.modifiedCount}`
                );
            } else {
                notFound.push(item.title);
                console.log(`${item.title}: NOT FOUND`);
            }
        }

        console.log("\n========== SUMMARY ==========");
        console.log(`Total titles: ${categoriesData.length}`);
        console.log(`Matched listings: ${matched}`);
        console.log(`Modified listings: ${updated}`);
        console.log(`Not found: ${notFound.length}`);

        if (notFound.length > 0) {
            console.log("\nTitles not found in your database:");
            console.log(notFound.join("\n"));
        }

        const sample = await collection.findOne(
            { title: "Cozy Beachfront Cottage" },
            { projection: { title: 1, categories: 1 } }
        );

        console.log("\nVerification:");
        console.dir(sample, { depth: 3 });

    } catch (error) {
        console.error("Category update failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
}

addCategories();
