import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { vendorService } from './vendor.service';
import { ListVendorsQuery, RejectVendorInput } from './vendor.validation';

// === VENDOR ROUTES ===
const getMyVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getMyVendor(req.user!.userId);

  ApiResponse.success(res, vendor);
});

const createVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.createVendor(req.user!.userId, req.body);

  ApiResponse.created(res, vendor, 'Vendor registered successfully');
});

// === ADMIN ROUTES ===
const getAllVendors = asyncHandler(async (req, res) => {
  const result = await vendorService.getAllVendors(
    req.validatedQuery as unknown as ListVendorsQuery,
  );

  ApiResponse.success(res, result);
});

const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorById(req.params.id as string);

  ApiResponse.success(res, vendor);
});

const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.approveVendor(req.params.id as string);

  ApiResponse.success(res, vendor, 'Vendor approved successfully');
});

const rejectVendor = asyncHandler(async (req, res) => {
  const { rejectedReason } = req.body as RejectVendorInput;
  const vendor = await vendorService.rejectVendor(
    req.params.id as string,
    rejectedReason,
  );

  ApiResponse.success(res, vendor, 'Vendor rejected successfully');
});

export {
  getMyVendor,
  createVendor,
  getAllVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
};
