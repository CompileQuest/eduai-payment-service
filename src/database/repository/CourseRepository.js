const CourseModel = require('../models/Course');

class CourseRepository {
    async create(courseData) {
        try {
            const course = new CourseModel(courseData);
            return await course.save();
        } catch (error) {
            throw new Error(`Database Error: ${error.message}`);
        }
    }

    async findAll(page, limit) {
        try {
            const skip = (page - 1) * limit;
            const [courses, total] = await Promise.all([
                CourseModel.find()
                    .skip(skip)
                    .limit(limit)
                    .sort({ created_at: -1 }),
                CourseModel.countDocuments()
            ]);

            return {
                courses,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    pageSize: limit
                }
            };
        } catch (error) {
            throw new Error(`Database Error: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            return await CourseModel.findById(id);
        } catch (error) {
            throw new Error(`Database Error: ${error.message}`);
        }
    }

    async update(id, updateData) {
        try {
            return await CourseModel.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            throw new Error(`Database Error: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            await CourseModel.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Database Error: ${error.message}`);
        }
    }
}

module.exports = CourseRepository;