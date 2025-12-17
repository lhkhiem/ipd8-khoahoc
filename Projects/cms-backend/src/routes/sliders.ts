import { Router } from 'express';
import * as sliderController from '../controllers/sliderController';

const router = Router();

// Specific routes must come before parameterized routes
router.post('/reorder', sliderController.reorderSliders);
router.get('/', sliderController.getAllSliders);
router.post('/', sliderController.createSlider);
router.get('/:id', sliderController.getSliderById);
router.put('/:id', sliderController.updateSlider);
router.delete('/:id', sliderController.deleteSlider);

export default router;

