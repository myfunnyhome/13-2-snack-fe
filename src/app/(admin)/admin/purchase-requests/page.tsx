import { Suspense } from 'react';

import PurchaseRequestsView from './PurchaseRequestsView';

export default function PurchaseRequestsPage() {
  return (
    <Suspense>
      <PurchaseRequestsView />
    </Suspense>
  );
}
