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
}

module.exports = CourseRepository; 