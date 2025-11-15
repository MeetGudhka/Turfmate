const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (file, folder = 'general') => {
    try {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(file, {
            folder: `turfmate/${folder}`,
            resource_type: 'auto'
        });

        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw new Error('Image upload failed');
    }
};

const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Cloudinary delete failed:', error);
        return false;
    }
};

module.exports = {
    uploadImage,
    deleteImage
};