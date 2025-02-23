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

    async getAllCourses(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            
            const courses = await CourseModel.find()
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });  // Sort by creation date, newest first
            
            const totalCourses = await CourseModel.countDocuments();
            const totalPages = Math.ceil(totalCourses / limit);

            return {
                courses,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalCourses,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (err) {
            throw new Error(`Unable to fetch courses: ${err.message}`);
        }
    }
}

module.exports = CourseRepository; 