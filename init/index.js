
require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const MONGO_URL = process.env.ATLASDB_URL;
const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB Atlas");

    const listings = [];

    for (const obj of initData.data) {
        let geometry = obj.geometry;

        if (
            !geometry ||
            geometry.type !== "Point" ||
            !Array.isArray(geometry.coordinates)
        ) {
            const response = await geocodingClient
                .forwardGeocode({
                    query: `${obj.location}, ${obj.country}`,
                    limit: 1
                })
                .send();

            const feature = response.body.features[0];

            if (!feature) {
                console.log("Location not found:", obj.location);
                continue;
            }

            geometry = feature.geometry;
        }

        listings.push({
            ...obj,
            geometry,
            owner: "6aac43a5fdd9a820fd448615"
        });
    }

    // WARNING: Replaces all listings in the selected database.
    await Listing.deleteMany({});
    await Listing.insertMany(listings);

    console.log(`Successfully added ${listings.length} listings`);
}

main()
    .catch((err) => {
        console.error("Initialization failed:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
