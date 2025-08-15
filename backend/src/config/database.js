const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Determinar la URI de MongoDB basado en el entorno
    let mongoUri = process.env.MONGODB_URI;

    // Si no hay MONGODB_URI específica, construir basado en el entorno
    if (!mongoUri) {
      const isDocker = process.env.DOCKER_ENV === "true";
      const host = isDocker ? "mongodb" : "localhost";
      const port = isDocker ? "27017" : (process.env.MONGO_PORT || "27027");
      const username = process.env.MONGO_USERNAME || "testai_user";
      const password = process.env.MONGO_PASSWORD || "testai_password123";
      const database = process.env.MONGO_DATABASE || "testai";

      mongoUri = `mongodb://${username}:${password}@${host}:${port}/${database}`;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connection successful!");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Using URI: ${mongoUri.replace(/\/\/.*@/, "//***:***@")}`); // Log sin credenciales
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
