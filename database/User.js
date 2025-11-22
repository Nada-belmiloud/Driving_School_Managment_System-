// database/User.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

// 1. Candidates
const candidateSchema = new Schema({
  name: String,
  phone: String,
  address: String,
  date_of_birth: Date,
  registration_date: Date,
  email: String,
  documents: {
    birth_certificate: String,
    residence_certificate: String,
    medical_certificate: String,
    photos: [String],
    national_id_copy: String,
    parental_authorization: { type: String, default: null },
  },
  progress: {
    creno_hours: Number,
    code_hours: Number,
    conduite_hours: Number,
  },
});
const Candidate = mongoose.model("Candidate", candidateSchema);

// 2. Instructors
const instructorSchema = new Schema({
  name: String,
  phone: String,
  email: String,
  specialization: String,
  hire_date: Date,
  vehicle_id: { type: Schema.Types.ObjectId, ref: "Vehicle" },
  availability: [
    {
      date: Date,
      start_time: String,
      end_time: String,
    },
  ],
});
const Instructor = mongoose.model("Instructor", instructorSchema);

// 3. Vehicles
const vehicleSchema = new Schema({
  category: String,
  model: String,
  license_plate: String,
  status: String,
  maintenance_history: [
    {
      maintenance_id: Schema.Types.ObjectId,
      date: Date,
      description: String,
      status: String,
    },
  ],
});
const Vehicle = mongoose.model("Vehicle", vehicleSchema);

// 4. Enrollment
const enrollmentSchema = new Schema({
  candidate_id: { type: Schema.Types.ObjectId, ref: "Candidate" },
  plan_pay_id: { type: Schema.Types.ObjectId, ref: "PaymentPlan" },
  license_category: String,
  enrollment_date: Date,
  status: String,
});
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

// 5. Payment Plans
const paymentPlanSchema = new Schema({
  name: String,
  number_of_installments: Number,
  total_amount: Number,
});
const PaymentPlan = mongoose.model("PaymentPlan", paymentPlanSchema);

// 6. Payments
const paymentSchema = new Schema({
  candidate_id: { type: Schema.Types.ObjectId, ref: "Candidate" },
  plan_pay_id: { type: Schema.Types.ObjectId, ref: "PaymentPlan" },
  installment_number: Number,
  amount: Number,
  date: Date,
  method: String,
  status: String,
});
const Payment = mongoose.model("Payment", paymentSchema);

// 7. Courses
const courseSchema = new Schema({
  type: String,
  title: String,
  duration: Number,
  price: Number,
});
const Course = mongoose.model("Course", courseSchema);

// 8. Exams
const examSchema = new Schema({
  course_id: { type: Schema.Types.ObjectId, ref: "Course" },
  exam_type: String,
  date: Date,
});
const Exam = mongoose.model("Exam", examSchema);

// 9. Exam Results
const examResultSchema = new Schema({
  exam_id: { type: Schema.Types.ObjectId, ref: "Exam" },
  candidate_id: { type: Schema.Types.ObjectId, ref: "Candidate" },
  score: Number,
  status: String,
});
const ExamResult = mongoose.model("ExamResult", examResultSchema);

// 10. Sessions
const sessionSchema = new Schema({
  candidate_id: { type: Schema.Types.ObjectId, ref: "Candidate" },
  instructor_id: { type: Schema.Types.ObjectId, ref: "Instructor" },
  session_type: String,
  date: Date,
  time: String,
  status: String,
});
const Session = mongoose.model("Session", sessionSchema);

// 11. Admins
const adminSchema = new Schema({
  username: String,
  password: String, // hashed
  email: String,
});
const Admin = mongoose.model("Admin", adminSchema);

module.exports = {
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
};