const mongoose = require("mongoose");
const connectDB = require("./db");
const {
  Candidate,
  Instructor,
  Vehicle,
  Enrollment,
  PaymentPlan,
  Payment,
  Course,
  Exam,
  ExamResult,
  Session,
  Admin,
} = require("./User");

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      Candidate.deleteMany({}),
      Instructor.deleteMany({}),
      Vehicle.deleteMany({}),
      Enrollment.deleteMany({}),
      PaymentPlan.deleteMany({}),
      Payment.deleteMany({}),
      Course.deleteMany({}),
      Exam.deleteMany({}),
      ExamResult.deleteMany({}),
      Session.deleteMany({}),
      Admin.deleteMany({}),
    ]);

    //  Vehicles
    const vehicle1 = await Vehicle.create({
      category: "Car",
      model: "Toyota Corolla",
      license_plate: "DZ-1234",
      status: "active",
      maintenance_history: [
        {
          // maintenance_id removed here
          date: new Date("2025-01-15"),
          description: "Oil change",
          status: "done",
        },
      ],
    });

    const vehicle2 = await Vehicle.create({
      category: "Motorbike",
      model: "Honda CB500",
      license_plate: "DZ-5678",
      status: "active",
      maintenance_history: [],
    });

    //  Instructors
    const instructor1 = await Instructor.create({
      name: "Ali Ben Ahmed",
      phone: "0555123456",
      email: "ali@example.com",
      specialization: "Car",
      hire_date: new Date("2023-05-01"),
      vehicle_id: vehicle1._id,
      availability: [
        { date: new Date(), start_time: "09:00", end_time: "12:00" },
        { date: new Date(), start_time: "14:00", end_time: "18:00" },
      ],
    });

    const instructor2 = await Instructor.create({
      name: "Sara Boussad",
      phone: "0555987654",
      email: "sara@example.com",
      specialization: "Motorbike",
      hire_date: new Date("2024-02-10"),
      vehicle_id: vehicle2._id,
      availability: [{ date: new Date(), start_time: "10:00", end_time: "13:00" }],
    });

    //  Candidates
    const candidate1 = await Candidate.create({
      name: "John Doe",
      phone: "0666123456",
      address: "Algiers",
      date_of_birth: new Date("2000-01-01"),
      registration_date: new Date(),
      email: "john@example.com",
      documents: {
        birth_certificate: "birth1.pdf",
        residence_certificate: "residence1.pdf",
        medical_certificate: "medical1.pdf",
        photos: ["photo1.jpg"],
        national_id_copy: "id1.pdf",
      },
      progress: { creno_hours: 5, code_hours: 10, conduite_hours: 3 },
    });

    const candidate2 = await Candidate.create({
      name: "Fatima Z",
      phone: "0666234567",
      address: "Oran",
      date_of_birth: new Date("1998-05-10"),
      registration_date: new Date(),
      email: "fatima@example.com",
      documents: {
        birth_certificate: "birth2.pdf",
        residence_certificate: "residence2.pdf",
        medical_certificate: "medical2.pdf",
        photos: ["photo2.jpg"],
        national_id_copy: "id2.pdf",
      },
      progress: { creno_hours: 2, code_hours: 8, conduite_hours: 4 },
    });

    //  Payment Plans
    const plan1 = await PaymentPlan.create({
      name: "Full Payment",
      number_of_installments: 1,
      total_amount: 50000,
    });

    const plan2 = await PaymentPlan.create({
      name: "Installments",
      number_of_installments: 3,
      total_amount: 55000,
    });

    //  Enrollments
    await Enrollment.create({
      candidate_id: candidate1._id,
      plan_pay_id: plan1._id,
      license_category: "B",
      enrollment_date: new Date(),
      status: "active",
    });

    const enrollment2 = await Enrollment.create({
      candidate_id: candidate2._id,
      plan_pay_id: plan2._id,
      license_category: "A",
      enrollment_date: new Date(),
      status: "active",
    });

    //  Payments
    await Payment.create({
      candidate_id: candidate1._id,
      plan_pay_id: plan1._id,
      installment_number: 1,
      amount: 50000,
      date: new Date(),
      method: "cash",
      status: "completed",
    });

    await Payment.create({
      candidate_id: candidate2._id,
      plan_pay_id: plan2._id,
      installment_number: 1,
      amount: 20000,
      date: new Date(),
      method: "card",
      status: "completed",
    });

    //  Courses
    const course1 = await Course.create({
      type: "theory",
      title: "Road Rules",
      duration: 20,
      price: 5000,
    });

    const course2 = await Course.create({
      type: "practical",
      title: "Driving Practice",
      duration: 15,
      price: 10000,
    });

    //  Exams
    const exam1 = await Exam.create({
      course_id: course1._id,
      exam_type: "theory",
      date: new Date(),
    });

    const exam2 = await Exam.create({
      course_id: course2._id,
      exam_type: "practical",
      date: new Date(),
    });

    //  Exam Results
    await ExamResult.create({
      exam_id: exam1._id,
      candidate_id: candidate1._id,
      score: 85,
      status: "pass",
    });

    await ExamResult.create({
      exam_id: exam2._id,
      candidate_id: candidate2._id,
      score: 60,
      status: "fail",
    });

    //  Sessions (Updated with vehicle_id)
    await Session.create({
      candidate_id: candidate1._id,
      instructor_id: instructor1._id,
      vehicle_id: vehicle1._id, // Added vehicle reference for a practical session
      session_type: "creno",
      date: new Date(),
      time: "09:00",
      status: "completed",
    });

    await Session.create({
      candidate_id: candidate2._id,
      instructor_id: instructor2._id,
      vehicle_id: vehicle2._id, // Added vehicle reference for a practical session
      session_type: "code",
      date: new Date(),
      time: "10:00",
      status: "scheduled",
    });

    // 1 Admins
    await Admin.create({
      username: "admin",
      password: "$2b$10$hashedpassword", // replace with real hashed password
      email: "admin@example.com",
    });

    console.log("Database seeded successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
