import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SupplierLayout from './SupplierLayout';
import SupplierDashboard from './SupplierDashboard';
import SupplierCatalogue from './SupplierCatalogue';
import { SupplierOrderDetail, SupplierOrders } from './SupplierOrders';
import SupplierPayments from './SupplierPayments';
import SupplierCompany from './SupplierCompany';
import OrderInvoice from './OrderInvoice';

/** /fournisseur/* — the supplier space (loaded on demand: salons never download it). */
const SupplierSpace: React.FC = () => (
  <Routes>
    <Route path="factures/:id" element={<OrderInvoice />} />
    <Route element={<SupplierLayout />}>
      <Route index element={<SupplierDashboard />} />
      <Route path="catalogue" element={<SupplierCatalogue />} />
      <Route path="commandes" element={<SupplierOrders />} />
      <Route path="commandes/:id" element={<SupplierOrderDetail />} />
      <Route path="paiements" element={<SupplierPayments />} />
      <Route path="entreprise" element={<SupplierCompany />} />
      <Route path="*" element={<Navigate to="/fournisseur" replace />} />
    </Route>
  </Routes>
);

export default SupplierSpace;
