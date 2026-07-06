import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { shopService } from './shop.service';

const createShop = asyncHandler(async (req, res) => {
  const shop = await shopService.createShop(req.user!.userId, req.body);

  ApiResponse.created(res, shop, 'Shop registered successfully');
});

export { createShop };
