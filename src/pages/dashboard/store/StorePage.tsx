import { useState } from "react"
import { CreditCard, Package, ReceiptText, ScrollText, Store, Tag, Tags, Truck } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { CategoriesManager } from "./CategoriesManager"
import { CouponsManager } from "./CouponsManager"
import { OrdersHistory } from "./OrdersHistory"
import { PaymentSettings } from "./PaymentSettings"
import { ProductsManager } from "./ProductsManager"
import { StoreFront } from "./StoreFront"
import { StoreLogsPanel } from "./StoreLogsPanel"
import { StoreOrdersAdmin } from "./StoreOrdersAdmin"
import { CartProvider } from "./useCart"

export function StorePage() {
  const { isStaff, isAdmin } = useAuth()
  const [ordersVersion, setOrdersVersion] = useState(0)

  return (
    <DashboardLayout title="Loja" description="Adquira VIPs, veículos, itens e moedas. A entrega é automática após o pagamento.">
      <CartProvider>
        <Tabs defaultValue="loja">
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="loja">
              <Store className="size-4" /> Loja
            </TabsTrigger>
            <TabsTrigger value="pedidos">
              <ReceiptText className="size-4" /> Meus pedidos
            </TabsTrigger>
            {isStaff && (
              <>
                <TabsTrigger value="produtos">
                  <Package className="size-4" /> Produtos
                </TabsTrigger>
                <TabsTrigger value="categorias">
                  <Tags className="size-4" /> Categorias
                </TabsTrigger>
                <TabsTrigger value="cupons">
                  <Tag className="size-4" /> Cupons
                </TabsTrigger>
                <TabsTrigger value="vendas">
                  <Truck className="size-4" /> Vendas
                </TabsTrigger>
                <TabsTrigger value="logs">
                  <ScrollText className="size-4" /> Logs
                </TabsTrigger>
              </>
            )}
            {isAdmin && (
              <TabsTrigger value="pagamentos">
                <CreditCard className="size-4" /> Pagamentos
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="loja">
            <StoreFront onOrderChanged={() => setOrdersVersion(version => version + 1)} />
          </TabsContent>
          <TabsContent value="pedidos">
            <OrdersHistory refreshKey={ordersVersion} />
          </TabsContent>
          {isStaff && (
            <>
              <TabsContent value="produtos">
                <ProductsManager />
              </TabsContent>
              <TabsContent value="categorias">
                <CategoriesManager />
              </TabsContent>
              <TabsContent value="cupons">
                <CouponsManager />
              </TabsContent>
              <TabsContent value="vendas">
                <StoreOrdersAdmin />
              </TabsContent>
              <TabsContent value="logs">
                <StoreLogsPanel />
              </TabsContent>
            </>
          )}
          {isAdmin && (
            <TabsContent value="pagamentos">
              <PaymentSettings />
            </TabsContent>
          )}
        </Tabs>
      </CartProvider>
    </DashboardLayout>
  )
}
