import { Request, Response } from "express";
import Product from "../database/model/product-model";

/**
 * Create Product
 */
// export const createProduct = async (req: Request, res: Response) => {
//   const {
//     name,
//     brand,
//     category,
//     description,
//     price,
//     originalPrice,
//     badge,
//     rating,
//     reviews,
//     features,
//     frameDetails,
//   } = req.body;

//   const image = req.file
//     ? req.file.path
//     : "https://via.placeholder.com/500";

//   if (!name || !price || !category || !description) {
//     return res.status(400).json({
//       message: "Please provide name, price and category!",
//     });
//   }

//   const product = await Product.create({
//     name,
//     brand: brand || null,
//     category,
//     description: description || null,
//     price,
//     originalPrice: originalPrice || null,
//     badge: badge || null,
//     image,
//     alt: req.body.alt || null,
//     rating: rating || 0,
//     reviews: reviews || 0,
//     features: features || [],
//     frameDetails: frameDetails || [],
//   });

//   res.status(200).json({
//     message: "Product created successfully!",
//     product,
//   });
// };
export const createProduct = async (req: Request, res: Response) => {
  const {
    name, brand, category, description, price,
    originalPrice, badge, rating, reviews, features, frameDetails, alt
  } = req.body;

  const files = req.files as Express.Multer.File[];
  const imagePaths = files && files.length > 0 
    ? files.map(file => file.path) 
    : ["https://via.placeholder.com/500"];

  const product = await Product.create({
    name,
    brand: brand || null,
    category,
    description,
    badge: badge || null,
    alt: alt || null,
    // Convert strings from FormData to Numbers for Sequelize
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : null,
    rating: parseFloat(rating) || 0,
    reviews: parseInt(reviews) || 0,
    // Storage logic
    image: imagePaths[0],
    gallery: imagePaths,
    features: typeof features === 'string' ? JSON.parse(features) : (features || []),
    frameDetails: typeof frameDetails === 'string' ? JSON.parse(frameDetails) : (frameDetails || []),
  });

  res.status(201).json({ message: "Product created successfully!", product });
};


/**
 * Get All Products
 */
export const getAllProducts = async (_req: Request, res: Response) => {
  const products = await Product.findAll({
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    message: "Products fetched successfully.",
    products,
  });
};


// export const getProductById = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   const product = await Product.findOne({ where: { id } });

//   if (!product) {
//     return res.status(404).json({
//       message: "Product not found!",
//     });
//   }

//   // Ensure features and frameDetails are always arrays
//   const formattedProduct = {
//     ...product.toJSON(),
//     features: Array.isArray(product.features)
//       ? product.features
//       : product.features
//       ? JSON.parse(product.features)
//       : [],
//     frameDetails: Array.isArray(product.frameDetails)
//       ? product.frameDetails
//       : product.frameDetails
//       ? JSON.parse(product.frameDetails)
//       : [],
//   };

//   res.status(200).json({
//     message: "Product fetched successfully.",
//     product: formattedProduct,
//   });
// };
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await Product.findOne({ where: { id } });

  if (!product) {
    return res.status(404).json({ message: "Product not found!" });
  }

  const productData = product.toJSON();

  const formattedProduct = {
    ...productData,
    gallery: Array.isArray(productData.gallery) ? productData.gallery : [],
    features: typeof productData.features === 'string' ? JSON.parse(productData.features) : (productData.features || []),
    frameDetails: typeof productData.frameDetails === 'string' ? JSON.parse(productData.frameDetails) : (productData.frameDetails || []),
  };

  res.status(200).json({ message: "Product fetched successfully.", product: formattedProduct });
};


/**
 * Update Product
 */
// export const updateProduct = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   const {
//     name,
//     brand,
//     category,
//     description,
//     price,
//     originalPrice,
//     badge,
//     alt,
//     rating,
//     reviews,
//     features,
//     frameDetails,
//   } = req.body;

//   const product = await Product.findOne({ where: { id } });

//   if (!product) {
//     return res.status(404).json({
//       message: "Product not found!",
//     });
//   }

//   const image = req.file ? req.file.path : product.image;

//   if (name) product.name = name;
//   if (brand !== undefined) product.brand = brand;
//   if (category) product.category = category;
//   if (description !== undefined) product.description = description;
//   if (price !== undefined) product.price = price;
//   if (originalPrice !== undefined) product.originalPrice = originalPrice;
//   if (badge !== undefined) product.badge = badge;
//   if (alt !== undefined) product.alt = alt;
//   if (rating !== undefined) product.rating = rating;
//   if (reviews !== undefined) product.reviews = reviews;
//   if (features !== undefined) product.features = features;
//   if (frameDetails !== undefined) product.frameDetails = frameDetails;

//   product.image = image;

//   await product.save();

//   res.status(200).json({
//     message: "Product updated successfully!",
//     product,
//   });
// };
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await Product.findOne({ where: { id } });

  if (!product) {
    return res.status(404).json({ message: "Product not found!" });
  }

  // 1. Handle New Files if any
  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    const newImagePaths = files.map(file => file.path);
    product.image = newImagePaths[0]; // Update main image
    product.gallery = newImagePaths;  // Replace gallery
  }

  // 2. Update other fields
  const fields = req.body;
  Object.keys(fields).forEach((key) => {
    if (fields[key] !== undefined) {
      // Handle parsing for arrays if they come as strings from frontend
      if ((key === 'features' || key === 'frameDetails') && typeof fields[key] === 'string') {
        (product as any)[key] = JSON.parse(fields[key]);
      } else {
        (product as any)[key] = fields[key];
      }
    }
  });

  await product.save();
  res.status(200).json({ message: "Product updated successfully!", product });
};
/**
 * Delete Product
 */
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findOne({ where: { id } });

  if (!product) {
    return res.status(404).json({
      message: "Product not found!",
    });
  }

  await product.destroy();

  res.status(200).json({
    message: "Product deleted successfully!",
  });
};

/**
 * Get Products By Category
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  const { category } = req.params;

  if (!category) {
    return res.status(400).json({
      message: "Category is required!",
    });
  }

  const products = await Product.findAll({
    where: {
      category,
    },
  });

  if (products.length === 0) {
    return res.status(404).json({
      message: `No products found for category "${category}"`,
    });
  }

  res.status(200).json({
    message: `${category} products fetched successfully`,
    data: products,
  });
};

/**
 * Get Featured Products
 */
export const getFeaturedProducts = async (_req: Request, res: Response) => {
  const data = await Product.findAll({
    where: {
      badge: "Bestseller",
    },
  });

  res.status(200).json({
    message: "Featured products fetched successfully",
    data,
  });
};