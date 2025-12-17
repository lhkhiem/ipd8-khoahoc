import { Router } from 'express';
import { getProductDetail, listProducts } from '../controllers/public/productController';

const router = Router();

// Danh sách sản phẩm public với filter/sort/pagination
router.get('/', listProducts);

// Chi tiết sản phẩm theo slug
router.get('/:slug', getProductDetail);

export default router;



