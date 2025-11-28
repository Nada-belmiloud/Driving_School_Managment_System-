// project/scripts/seed.ts
import "dotenv/config";
import connectToDB from "../lib/mongodb";
import Candidate from "../models/Candidate";
import Instructor from "../models/Instructor";
import Vehicle from "../models/Vehicle";
import Course from "../models/Course";
import Exam from "../models/Exam";
import ExamResult from "../models/ExamResult";
import Enrollment from "../models/Enrollment";
import PaymentPlan from "../models/PaymentPlan";
import Payment from "../models/Payment";
import Session from "../models/Session";
import Admin from "../models/Admin";
import bcrypt from "bcryptjs";

async function seed() {
  await connectToDB();
  console.log("Connected to DB (seed)");

  // Clear existing data
  await Promise.all([
    ExamResult.deleteMany({}),
    Exam.deleteMany({}),
    Session.deleteMany({}),
    Payment.deleteMany({}),
    Enrollment.deleteMany({}),
    PaymentPlan.deleteMany({}),
    Candidate.deleteMany({}),
    Instructor.deleteMany({}),
    Vehicle.deleteMany({}),
    Course.deleteMany({}),
    Admin.deleteMany({}),
  ]);

  // Vehicles
  const vehicle1 = await Vehicle.create({
    category: "Car",
    vehicleModel: "Toyota Corolla",
    licensePlate: "DZ-1234",
    status: "active",
    maintenanceHistory: [{ date: new Date("2025-01-15"), description: "Oil change", status: "done" }],
  });

  const vehicle2 = await Vehicle.create({
    category: "Motorbike",
    vehicleModel: "Honda CB500",
    licensePlate: "DZ-5678",
    status: "active",
    maintenanceHistory: [],
  });

  // Instructors
  const instructor1 = await Instructor.create({
    name: "Ali Ben Ahmed",
    phone: "0555123456",
    email: "ali@example.com",
    specialization: "Car",
    hireDate: new Date("2023-05-01"),
    vehicleId: vehicle1._id,
    availability: [
      { date: new Date(), startTime: "09:00", endTime: "12:00" },
      { date: new Date(), startTime: "14:00", endTime: "18:00" },
    ],
  });

  const instructor2 = await Instructor.create({
    name: "Sara Boussad",
    phone: "0555987654",
    email: "sara@example.com",
    specialization: "Motorbike",
    hireDate: new Date("2024-02-10"),
    vehicleId: vehicle2._id,
    availability: [{ date: new Date(), startTime: "10:00", endTime: "13:00" }],
  });

  // Candidates
  const candidate1 = await Candidate.create({
    name: "John Doe",
    phone: "0666123456",
    address: "Algiers",
    dateOfBirth: new Date("2000-01-01"),
    registrationDate: new Date(),
    email: "john@example.com",
    documents: {
      birthCertificate: "birth1.pdf",
      residenceCertificate: "residence1.pdf",
      medicalCertificate: "medical1.pdf",
      photos: ["photo1.jpg"],
      nationalIdCopy: "id1.pdf",
    },
    progress: { crenoHours: 5, codeHours: 10, conduiteHours: 3 },
  });

  const candidate2 = await Candidate.create({
    name: "Fatima Z",
    phone: "0666234567",
    address: "Oran",
    dateOfBirth: new Date("1998-05-10"),
    registrationDate: new Date(),
    email: "fatima@example.com",
    documents: {
      birthCertificate: "birth2.pdf",
      residenceCertificate: "residence2.pdf",
      medicalCertificate: "medical2.pdf",
      photos: ["photo2.jpg"],
      nationalIdCopy: "id2.pdf",
    },
    progress: { crenoHours: 2, codeHours: 8, conduiteHours: 4 },
  });

  // Courses
  const course1 = await Course.create({ type: "theory", title: "Road Rules", duration: 20, price: 5000 });
  const course2 = await Course.create({ type: "practical", title: "Driving Practice", duration: 15, price: 10000 });

  // Payment Plans
  const plan1 = await PaymentPlan.create({ name: "Full Payment", numberOfInstallments: 1, totalAmount: 50000 });
  const plan2 = await PaymentPlan.create({ name: "Installments", numberOfInstallments: 3, totalAmount: 55000 });

  // Enrollments
  const enrollment1 = await Enrollment.create({
    candidateId: candidate1._id,
    planPayId: plan1._id,
    licenseCategory: "B",
    enrollmentDate: new Date(),
    status: "active",
  });

  const enrollment2 = await Enrollment.create({
    candidateId: candidate2._id,
    planPayId: plan2._id,
    licenseCategory: "A",
    enrollmentDate: new Date(),
    status: "active",
  });

  // Payments
  await Payment.create({
    candidateId: candidate1._id,
    planPayId: plan1._id,
    installmentNumber: 1,
    amount: 50000,
    date: new Date(),
    method: "cash",
    status: "completed",
  });

  await Payment.create({
    candidateId: candidate2._id,
    planPayId: plan2._id,
    installmentNumber: 1,
    amount: 20000,
    date: new Date(),
    method: "card",
    status: "completed",
  });

  // Exams
  const exam1 = await Exam.create({ courseId: course1._id, examType: "theory", date: new Date(), instructorId: instructor1._id });
  const exam2 = await Exam.create({ courseId: course2._id, examType: "practical", date: new Date(), instructorId: instructor2._id });

  // Exam Results
  await ExamResult.create({ examId: exam1._id, candidateId: candidate1._id, score: 85, status: "pass" });
  await ExamResult.create({ examId: exam2._id, candidateId: candidate2._id, score: 60, status: "fail" });

  // Sessions
  await Session.create({
    candidateId: candidate1._id,
    instructorId: instructor1._id,
    vehicleId: vehicle1._id,
    sessionType: "creno",
    date: new Date(),
    time: "09:00",
    status: "completed",
  });

  await Session.create({
    candidateId: candidate2._id,
    instructorId: instructor2._id,
    vehicleId: vehicle2._id,
    sessionType: "code",
    date: new Date(),
    time: "10:00",
    status: "scheduled",
  });

  // Admin
  const hashedPassword = await bcrypt.hash("adminpassword", 10);
  await Admin.create({ username: "admin", password: hashedPassword, email: "admin@example.com" });

  console.log("Seeding completed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
