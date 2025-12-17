import express from 'express';
import { authMiddleware } from '../middleware/auth';
import * as testimonialsController from '../controllers/testimonialsController';
import * as valuePropsController from '../controllers/valuePropsController';
import * as educationResourcesController from '../controllers/educationResourcesController';

const router = express.Router();

router.use(authMiddleware);

// Testimonial routes
router.get('/testimonials', testimonialsController.getTestimonials);
router.post('/testimonials', testimonialsController.createTestimonial);
router.put('/testimonials/:id', testimonialsController.updateTestimonial);
router.delete('/testimonials/:id', testimonialsController.deleteTestimonial);

// Education Resource routes
// IMPORTANT: Specific routes (with :id) must come before general routes
router.get('/education-resources/:id', educationResourcesController.getEducationResourceById);
router.get('/education-resources', educationResourcesController.getEducationResources);
router.post('/education-resources', educationResourcesController.createEducationResource);
router.put('/education-resources/:id', educationResourcesController.updateEducationResource);
router.delete('/education-resources/:id', educationResourcesController.deleteEducationResource);

// Value Props routes
router.get('/value-props', valuePropsController.getValueProps);
router.post('/value-props', valuePropsController.createValueProp);
router.put('/value-props/:id', valuePropsController.updateValueProp);
router.delete('/value-props/:id', valuePropsController.deleteValueProp);

export default router;



