import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { shopService } from './shop.service';
import { ListShopsQuery, RejectShopInput } from './shop.validation';

// === SELLER ROUTES ===
const getMyShop = asyncHandler(async (req, res) => {
  const shop = await shopService.getMyShop(req.user!.userId);

  ApiResponse.success(res, shop);
});

const createShop = asyncHandler(async (req, res) => {
  const shop = await shopService.createShop(req.user!.userId, req.body);

  ApiResponse.created(res, shop, 'Shop registered successfully');
});

// === ADMIN ROUTES ===
const getAllShops = asyncHandler(async (req, res) => {
  const result = await shopService.getAllShops(
    req.validatedQuery as unknown as ListShopsQuery,
  );

  ApiResponse.success(res, result);
});

const getShopById = asyncHandler(async (req, res) => {
  const shop = await shopService.getShopById(req.params.id as string);

  ApiResponse.success(res, shop);
});

const approveShop = asyncHandler(async (req, res) => {
  const shop = await shopService.approveShop(req.params.id as string);

  ApiResponse.success(res, shop, 'Shop approved successfully');
});

const rejectShop = asyncHandler(async (req, res) => {
  const { rejectedReason } = req.body as RejectShopInput;
  const shop = await shopService.rejectShop(
    req.params.id as string,
    rejectedReason,
  );

  ApiResponse.success(res, shop, 'Shop rejected successfully');
});

export {
  getMyShop,
  createShop,
  getAllShops,
  getShopById,
  approveShop,
  rejectShop,
};
