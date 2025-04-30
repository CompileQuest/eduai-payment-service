import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    course_id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    stripe_product_id: {
        type: String,
        required: true,
        unique: true,
    },
    stripe_price_id: {
        type: String,
        required: true,
        unique: true,
    },
    currency: {
        type: String,
        default: 'usd',
    },
    price: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    },
    thumbnail_url: {
        type: String,
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});



const Course = mongoose.model('Course', courseSchema);

export default Course;
