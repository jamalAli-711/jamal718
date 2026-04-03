import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import CartContent from '@/Components/CartContent';

export default function CartIndex() {
    return (
        <CustomerLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">سلة المشتريات</h2>}
        >
            <Head title="عربة التسوق" />

            <div className="py-12" dir="rtl">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-right">
                        <CartContent />
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
