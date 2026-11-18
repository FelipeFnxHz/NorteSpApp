import { http } from "@/api/client"
import type { CouponPreview, CouponType, MercadoPagoState, StoreCatalog, StoreCoupon, StoreCategory, StoreLogsPage, StoreOrder, StoreOrderStatus, StoreProduct } from "@/types"

export interface CategoryBody {
  name?: string
  description?: string
}

export interface ProductBody {
  name?: string
  description?: string
  priceCents?: number
  image?: string
  contents?: string[]
  categoryId?: string
  deliveryCommands?: string[]
  rewardRoleId?: string
  active?: boolean
  stock?: number | null
}

export interface CouponBody {
  code: string
  type: CouponType
  value: number
  maxUses: number | null
  expiresAt: string | null
  active: boolean
}

export const storeService = {
  catalog: () => http.get<StoreCatalog>("/api/store"),
  checkout: (items: { productId: string; quantity: number }[], couponCode?: string) =>
    http.post<{ order: StoreOrder }>("/api/store/checkout", { items, ...(couponCode && { couponCode }) }),
  previewCoupon: (items: { productId: string; quantity: number }[], code: string) => http.post<CouponPreview>("/api/store/coupon/preview", { items, code }),
  myOrders: () => http.get<{ orders: StoreOrder[] }>("/api/store/orders"),
  order: (code: string) => http.get<{ order: StoreOrder }>(`/api/store/orders/${code}`),

  categories: () => http.get<{ categories: StoreCategory[] }>("/api/store/admin/categories"),
  createCategory: (body: CategoryBody) => http.post<{ category: StoreCategory }>("/api/store/admin/categories", body),
  updateCategory: (id: string, body: CategoryBody) => http.patch<{ category: StoreCategory }>(`/api/store/admin/categories/${id}`, body),
  removeCategory: (id: string) => http.delete<{ ok: true }>(`/api/store/admin/categories/${id}`),
  reorderCategories: (ids: string[]) => http.put<{ ok: true }>("/api/store/admin/categories/order", { ids }),

  products: () => http.get<{ products: StoreProduct[] }>("/api/store/admin/products"),
  createProduct: (body: ProductBody) => http.post<{ product: StoreProduct }>("/api/store/admin/products", body),
  updateProduct: (id: string, body: ProductBody) => http.patch<{ product: StoreProduct }>(`/api/store/admin/products/${id}`, body),
  removeProduct: (id: string) => http.delete<{ ok: true }>(`/api/store/admin/products/${id}`),
  reorderProducts: (categoryId: string, ids: string[]) => http.put<{ ok: true }>("/api/store/admin/products/order", { categoryId, ids }),
  logs: (params: { page?: number; type?: string } = {}) => {
    const query = new URLSearchParams({ page: String(params.page ?? 1), limit: "25", ...(params.type && { type: params.type }) })
    return http.get<StoreLogsPage>(`/api/store/admin/logs?${query}`)
  },
  coupons: () => http.get<{ coupons: StoreCoupon[] }>("/api/store/admin/coupons"),
  createCoupon: (body: CouponBody) => http.post<{ coupon: StoreCoupon }>("/api/store/admin/coupons", body),
  updateCoupon: (id: string, body: CouponBody) => http.patch<{ coupon: StoreCoupon }>(`/api/store/admin/coupons/${id}`, body),
  removeCoupon: (id: string) => http.delete<{ ok: true }>(`/api/store/admin/coupons/${id}`),
  uploadImage: (file: Blob) => http.upload<{ path: string }>("/api/store/admin/images", file),
  roles: () => http.get<{ roles: { id: string; name: string }[] }>("/api/store/admin/roles"),

  allOrders: (status?: StoreOrderStatus) => http.get<{ orders: StoreOrder[] }>(`/api/store/admin/orders${status ? `?status=${status}` : ""}`),
  redeliver: (code: string) => http.post<{ order: StoreOrder }>(`/api/store/admin/orders/${code}/redeliver`),

  mercadoPago: () => http.get<MercadoPagoState>("/api/store/settings/mercadopago"),
  saveMercadoPago: (body: { accessToken?: string; webhookSecret?: string }) => http.put<MercadoPagoState>("/api/store/settings/mercadopago", body),
  removeMercadoPago: () => http.delete<MercadoPagoState>("/api/store/settings/mercadopago"),
}
