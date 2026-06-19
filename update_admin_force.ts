import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function updateAdmin() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/poker");
  const hashed = await bcrypt.hash("adminpassword123", 10);
  
  const collection = mongoose.connection.collection("users");
  
  const result = await collection.updateOne(
    { username: "admin" },
    { $set: { password: hashed, role: "admin" } },
    { upsert: true }
  );
  
  console.log("Matched:", result.matchedCount);
  console.log("Modified:", result.modifiedCount);
  
  await mongoose.disconnect();
}

updateAdmin().catch(console.error);
