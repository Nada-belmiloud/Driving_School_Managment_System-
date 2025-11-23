const mongoose = require("mongoose");
const { Schema } = mongoose;

// 1. Candidates
const candidateSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: {
   type: String,
   required: true,
   trim: true,
   unique: true,
   match: [/^\d{10}$/, "Phone must be 10 digits"]
  }
  address: { type: String, required: true, trim: true },

  date_of_birth: { type: Date, required: true },
  registration_date: { type: Date, default: Date.now },

  email: { 
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
  },

  documents: {
    birth_certificate: { type: String, required: true },
    residence_certificate: { type: String, required: true },
    medical_certificate: { type: String, required: true },
    photos: { type: [String], default: [] },
    national_id_copy: { type: String, required: true },
    parental_authorization: { type: String, default: null },
  },

  progress: {
    creno_hours: { type: Number, default: 0 },
    code_hours: { type: Number, default: 0 },
    conduite_hours: { type: Number, default: 0 },
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema);


// 2. Instructors
const instructorSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: {
   type: String,
   required: true,
   trim: true,
   unique: true,
   match: [/^\d{10}$/, "Phone must be 10 digits"]
  }
  email: { 
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
  },

  specialization: { type: String, required: true },
  hire_date: { type: Date, default: Date.now },

  vehicle_id: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },

  availability: [
    {
      date: { type: Date, required: true },
      start_time: { type: String , default: null},
      end_time: { type: String , default: null},
    },
  ],
});

const Instructor = mongoose.model("Instructor", instructorSchema);


// 3. Vehicles
const vehicleSchema = new Schema({
  category: { type: String, required: true },
  model: { type: String, required: true },
  license_plate: { type: String, required: true, unique: true },
  status: { type: String, default: "available" },

  maintenance_history: [
    {
      maintenance_id: Schema.Types.ObjectId,
      date: { type: Date, required: true },
      description: { type: String, required: true },
      status: { type: String, required: true },
    },
  ],
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);


// 4. Enrollment
const enrollmentSchema = new Schema({
  candidate_id: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
  plan_pay_id: { type: Schema.Types.ObjectId, ref: "PaymentPlan", required: true },
  license_category: { type: String, required: true },
  enrollment_date: { type: Date, default: Date.now },
  status: { type: String, default: "active" },
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);


// 5. Payment Plans
const paymentPlanSchema = new Schema({
  name: { type: String, required: true },
  number_of_installments: { type: Number, required: true },
  total_amount: { type: Number, required: true },
});

const PaymentPlan = mongoose.model("PaymentPlan", paymentPlanSchema);


// 6. Payments
const paymentSchema = new Schema({
  candidate_id: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
  plan_pay_id: { type: Schema.Types.ObjectId, ref: "PaymentPlan", required: true },

  installment_number: { type: Number, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },

  method: { type: String, required: true },
  status: { type: String, default: "pending" },
});

const Payment = mongoose.model("Payment", paymentSchema);


// 7. Courses
const courseSchema = new Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
});

const Course = mongoose.model("Course", courseSchema);


// 8. Exams
const examSchema = new Schema({
  course_id: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  exam_type: { type: String, required: true },
  date: { type: Date, required: true },
});

const Exam = mongoose.model("Exam", examSchema);


// 9. Exam Results
const examResultSchema = new Schema({
  exam_id: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  candidate_id: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
  score: { type: Number, required: true },
  status: { type: String, required: true },
});

const ExamResult = mongoose.model("ExamResult", examResultSchema);


// 10. Sessions
const sessionSchema = new Schema({
  candidate_id: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
  instructor_id: { type: Schema.Types.ObjectId, ref: "Instructor", required: true },

  session_type: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, default: "scheduled" },
});

const Session = mongoose.model("Session", sessionSchema);


// 11. Admins
const adminSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // hashed
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
});

const Admin = mongoose.model("Admin", adminSchema);


// EXPORTS
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
