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
    brand: "Toyota",
    model: "Corolla",
    licensePlate: "DZ-1234",
    status: "active",
    maintenanceHistory: [{ date: new Date("2025-01-15"), description: "Oil change", status: "done" }],
  });

  // Instructors
  const instructor1 = await Instructor.create({
    name: "Ali Ben Ahmed",
    phone: "0555123456",
    email: "ali@example.com",
    specialization: "Car",
    workingHours: "09:00-18:00",
    maxStudents: 8,
    currentStudents: 2,
    vehicleId: vehicle1._id,
    availability: [{ date: new Date(), startTime: "09:00", endTime: "12:00" }],
  });

  // Candidates (with embedded payments and phases)
  const candidate1 = await Candidate.create({
    name: "John Doe",
    dateOfBirth: new Date("2000-01-01"),
    age: 25,
    licenseCategory: "B",
    documents: [
      { name: "birth_certificate", checked: true },
      { name: "national_id", checked: true },
      { name: "medical_certificate", checked: true },
    ],
    payments: [{
      planId: null,
      installmentNumber: 1,
      amount: 50000,
      date: new Date(),
      method: "cash",
      status: "completed",
    }],
    totalFee: 50000,
    paidAmount: 50000,
    phases: [
      { phase: "highway_code", status: "completed", sessionsCompleted: 20, sessionsPlanned: 20 },
      { phase: "parking", status: "in_progress", sessionsCompleted: 2, sessionsPlanned: 10 },
      { phase: "driving", status: "not_started", sessionsCompleted: 0, sessionsPlanned: 15 },
    ],
    instructorId: instructor1._id,
    status: "active",
    sessionHistory: [],
    examHistory: [],
    phone: "0666123456",
    address: "Algiers",
    email: "john@example.com",
  });

  // Courses, exams, results, enrollment...
  const course1 = await Course.create({ type: "theory", title: "Road Rules", duration: 20, price: 5000 });
  const course2 = await Course.create({ type: "practical", title: "Driving Practice", duration: 15, price: 10000 });

  const plan1 = await PaymentPlan.create({ name: "Full Payment", numberOfInstallments: 1, totalAmount: 50000 });

  const enrollment1 = await Enrollment.create({
    candidateId: candidate1._id,
    planPayId: plan1._id,
    licenseCategory: "B",
    status: "active",
  });

  const exam1 = await Exam.create({ courseId: course1._id, examType: "theory", date: new Date() });
  const examRes1 = await ExamResult.create({ examId: exam1._id, candidateId: candidate1._id, score: 85, status: "pass" });

  const session1 = await Session.create({
    candidateId: candidate1._id,
    instructorId: instructor1._id,
    vehicleId: vehicle1._id,
    sessionType: "driving",
    date: new Date(),
    time: "09:00",
    status: "completed",
  });

  // push session/exam refs to candidate arrays (so frontend sees history)
  candidate1.sessionHistory.push(session1._id);
  candidate1.examHistory.push(examRes1._id);
  candidate1.paidAmount = candidate1.payments.reduce((s, p) => s + p.amount, 0);
  await candidate1.save();

  // Admin
  const hashed = await bcrypt.hash("adminpassword", 10);
  await Admin.create({ username: "admin", password: hashed, email: "admin@example.com" });

  console.log("Seeding completed.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
