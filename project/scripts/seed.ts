import "dotenv/config";
import connectToDB from "../lib/mongodb";

import Candidate from "../models/Candidate";
import Instructor from "../models/Instructor";
import Vehicle from "../models/Vehicle";
import Course from "../models/Course";

async function seed() {
  await connectToDB();
  console.log("Connected to DB");

  await Candidate.deleteMany({});
  await Instructor.deleteMany({});
  await Vehicle.deleteMany({});
  await Course.deleteMany({});

  await Candidate.insertMany([
    { firstName: "Nada", lastName: "Belmiloud", phone: "0555555555" },
  ]);

  await Instructor.insertMany([
    { firstName: "Ali", lastName: "Zerrouki", phone: "0666666666" },
  ]);

  await Vehicle.insertMany([
    { model: "Clio 4", licensePlate: "123-456-00", category: "B" },
  ]);

  await Course.insertMany([
    { name: "Permis B", category: "B", price: 25000 },
  ]);

  console.log("Seeding finished!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
