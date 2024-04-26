const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../config/mailSender");
const {courseEnrollmentEmail} = require("../mailTemplates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mailTemplates/paymentSuccessEmail");

const mongoose = require("mongoose");
const crypto = require("crypto");
// initiate the razorpay order
exports.capturePayment = async(req, res) => {
    const {courses} = req.body;
    const userId = req.user.id;

    if(courses.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide Course Id"
        })
    }

    // calculating the total amount 
    let totalAmount = 0;
    for(const course_id of courses){
        let course;
        try{
            // find the course
            course = await Course.findById(course_id)
            if(!course){
                return res.status(200).json({
                    success: false,
                    message: "Course not Found!!"
                })
            }
            // check whether the student is already enrolled in this course
            const uid = new mongoose.Types.ObjectId(userId)
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success: false,
                    message: "Student is already Enrolled in this course!!"
                })
            }
            totalAmount += course.price;
        }
        catch(error){
            console.log(error)
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    // before creating the razorpay instance, we have to give an argument options
        // creating options.
        const options = {
            amount: totalAmount * 100,
            currency: "USD",
            receipt: Math.random(Date.now()).toString()
        }
        // creating order
        try{
            const paymentResponse = await instance.orders.create(options);
            res.status(200).json({
                success: true,
                message: paymentResponse
            })
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Could not Initaite the Order"
            })
        }

}

const enrollStudents = async(courses, user, res) => {
    if(!courses || !user){
        return res.status(400).json({
            success: false,
            message: "Please provide data for Courses or userId"
        })
    }

    for (const courseId of courses){
        
        try{
            //find the course and enroll the student
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {$push: {studentsEnrolled: user}},
                {new:true}
            )

            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message: "Course not found"
                })
            }

            // find the student and add the course to his courses
            const enrollStudent = await User.findByIdAndUpdate(
                {_id: user},
                {
                    $push:{
                        courses: courseId
                    }
                },
                {new: true}
            )

            // send mail to the student
            await mailSender(enrollStudent.emailID, `Successfully Enrolled into ${enrolledCourse.name}`, courseEnrollmentEmail(enrolledCourse.name, enrollStudent.firstName))
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Course enrollment error"
            })
        }

    }

}

// payment verification
exports.verifyPayment = async(req, res) => {
    const razorpay_order_id  = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;

    const courses = req.body?.courses;
    const user = req.user?.id;

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user || !courses){
        return res.status(200).json({
            success: false,
            message: "Payment Failed!!"
        })
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    // we call the final output that we got from hashing as "digest" -- hexadecimal format
    // converting hmac object to string format
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body.toString()).digest("hex")
    if(expectedSignature == razorpay_signature) {
        // payment sucess
        // enroll student
        await enrollStudents(courses, user, res);
        return res.status(200).json({
            success: true,
            message: "Payment verified"
        })
    }
    return res.status(200).json({
        success: "false",
        message: "Payment Failed"
    })
}

exports.sendPaymentSuccessEmail = async(req, res) => {
    const {orderId, paymentId, amount} = req.body;
    const userId = req.user.id;
    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({
            success: false,
            message: "Please provide all the details"
        })
    }

    try{
        const enrolledStudent = await User.findById(userId);
        await mailSender(enrolledStudent.emailID, `Payment Received`, paymentSuccessEmail(enrolledStudent.firstName, amount/100, orderId, paymentId))
    }
    catch(error){
        console.log("error in sending mail", error);
        return res.status(500).json({
            success: false,
            message: "Could not send email"
        })
    }
}


