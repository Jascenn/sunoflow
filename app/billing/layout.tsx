import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Billing & Plans - SunoFlow',
    description: 'Manage your subscription, recharge credits, and view transaction history.',
};

export default function BillingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
