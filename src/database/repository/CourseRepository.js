const CourseModel = require('../models/Course');

class CourseRepository {
    async createCourse(courseData) {
        try {
            const newCourse = new CourseModel(courseData);
            return await newCourse.save();
        } catch (err) {
            throw new Error(`Unable to create course: ${err.message}`);
        }
    }

    async getCourseById(courseId) {
        try {
            return await CourseModel.findById(courseId);
        } catch (err) {
            throw new Error(`Unable to fetch course: ${err.message}`);
        }
    }

    async getAllCourses() {
        try {
            return await CourseModel.find();
        } catch (err) {
            throw new Error(`Unable to fetch courses: ${err.message}`);
        }
    }

    async updateCourse(courseId, courseData) {
        try {
            return await CourseModel.findByIdAndUpdate(
                courseId,
                courseData,
                { new: true }
            );
        } catch (err) {
            throw new Error(`Unable to update course: ${err.message}`);
        }
    }

    async deleteCourse(courseId) {
        try {
            return await CourseModel.findByIdAndDelete(courseId);
        } catch (err) {
            throw new Error(`Unable to delete course: ${err.message}`);
        }
    }
}

module.exports = CourseRepository; 