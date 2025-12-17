import express from 'express';

import {
  getHeroSliders,
  getBestSellerProducts,
  getFeaturedCategories,
  getFeaturedBrands,
  getValueProps,
  getTestimonials,
  getEducationResources,
  getHomepageStats,
  getLearningLibraryPosts,
} from '../controllers/public/homepageController';
import { getEducationResourceBySlug } from '../controllers/educationResourcesController';

const router = express.Router();

router.get('/hero-sliders', getHeroSliders);
router.get('/best-sellers', getBestSellerProducts);
router.get('/featured-categories', getFeaturedCategories);
router.get('/featured-brands', getFeaturedBrands);
router.get('/value-props', getValueProps);
router.get('/testimonials', getTestimonials);
// IMPORTANT: Specific routes (with :slug) must come before general routes
router.get('/education-resources/:slug', getEducationResourceBySlug);
router.get('/education-resources', getEducationResources);
router.get('/stats', getHomepageStats);
router.get('/learning-posts', getLearningLibraryPosts);

export default router;


