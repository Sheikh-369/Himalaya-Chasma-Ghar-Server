import multer from "multer";
import { storage } from "../services/cloudinary-config";
const upload=multer({storage:storage})

export default upload