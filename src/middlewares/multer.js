// multer configuration (unchanged)
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const originalName = file.originalname;
        const extension = path.extname(originalName);
        const uniqueName = originalName.replace(extension, '') + '-' + timestamp + extension;
        cb(null, uniqueName);
    }
});

export const upload = multer({ storage });


