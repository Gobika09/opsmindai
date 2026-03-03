// testMongo.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

async function run() {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 2️⃣ Define a schema for vectors
    const testSchema = new mongoose.Schema({
      name: String,
      embedding: [Number], // store vector
    });

    // 3️⃣ Create a model
    const Test = mongoose.model("Test", testSchema);

    // 4️⃣ Create and save a test document
    const doc = await Test.create({
      name: "Example",
      embedding: [0.1, 0.2, 0.3],
    });

    // 5️⃣ Print saved document
    console.log(doc);

    // Close connection
    await mongoose.connection.close();
    console.log("✅ MongoDB Connection Closed");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

run();