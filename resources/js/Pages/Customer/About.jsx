import { useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head } from '@inertiajs/react';

const BRANDS = [
    { name: 'الشفاء', src: '/storage/products/logos/al-shifa.png' },
    { name: 'Arla', src: '/storage/products/logos/arla.png' },
    { name: 'بيقا', src: '/storage/products/logos/beqa.png' },
    { name: 'Capri-Sun', src: '/storage/products/logos/capri-sun.png' },
    { name: 'Lurpak', src: '/storage/products/logos/lurpak.png' },
    { name: 'Puck', src: '/storage/products/logos/puck.png' },
    { name: 'Sadia', src: '/storage/products/logos/sadia.png' },
    { name: 'Sary', src: '/storage/products/logos/sary.png' },
    { name: 'Starbucks', src: '/storage/products/logos/starbucks.png' },
    { name: 'تيما', src: '/storage/products/logos/teama.png' },
];

export default function About() {
    const [contactToast, setContactToast] = useState(false);

    const handleContactClick = () => {
        setContactToast(true);
        setTimeout(() => setContactToast(false), 4000);
    };

    return (
        <CustomerLayout hideFooter={false}>
            <Head title="من نحن — مؤسسة سعيد نعمان المخلافي للتجارة والتبريد" />

            {/* Contact Toast */}
            <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-700 ${contactToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
                <div className="bg-red-950/95 dark:bg-[#1a1a1f]/95 backdrop-blur-3xl border-2 border-red-500 dark:border-amber-400/30 text-white px-8 sm:px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-black font-black text-lg">
                        📞
                    </div>
                    <div className="text-right">
                        <p className="font-black text-sm text-amber-400">يسعدنا تواصلكم دائماً!</p>
                        <p className="text-xs text-white/90 font-medium">المكتب الرئيسي: اليمن | هاتف: +967 1 234 567</p>
                    </div>
                </div>
            </div>

            <div className="min-h-screen pb-32 text-gray-900 dark:text-white transition-colors duration-300" dir="rtl">

                {/* ===== HERO BANNER SECTION ===== */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 mb-16">
                    <div className="relative rounded-[3rem] md:rounded-[4.5rem] overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-slate-950 dark:from-red-950 dark:via-slate-950 dark:to-black border-2 border-red-600/30 shadow-2xl shadow-red-900/20">
                        {/* Background Overlay Effect */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/30 via-amber-500/10 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

                        <div className="relative z-10 p-8 sm:p-14 md:p-20 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">

                            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 backdrop-blur-md shadow-inner">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                                <span className="text-xs md:text-sm font-black tracking-widest">تأسست عام 1979م • ريادة وتاريخ من الجودة</span>
                            </div>

                            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-tight drop-shadow-xl">
                                مؤسسة سعيد نعمان المخلافي <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-amber-100">
                                    للتجارة والتبريد
                                </span>
                            </h1>

                            <p className="text-base sm:text-xl md:text-2xl font-bold text-white/90 leading-relaxed max-w-3xl">
                                تأسست مؤسسة سعيد نعمان المخلافي للتجارة والتبريد عام 1979م في طليعة المؤسسات الرائدة في استيراد وتوزيع اللحوم والمواد الغذائية المبردة والجافة بكافة مدن ومحافظات اليمن.
                            </p>

                            <div className="pt-4 flex flex-wrap justify-center gap-4">
                                <a href="#about-details" className="px-10 py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-red-600/30 active:scale-95 flex items-center gap-3">
                                    <span>معرفة المزيد</span>
                                    <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </a>
                                <button onClick={handleContactClick} className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-black text-sm uppercase tracking-widest rounded-2xl transition-all backdrop-blur-md active:scale-95 shadow-lg">
                                    تواصل معنا
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== BRANDS LOGOS SECTION ===== */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-24">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-black text-red-700 dark:text-red-400 tracking-tight flex items-center justify-center gap-3">
                            <span className="h-1 w-12 bg-red-600 rounded-full" />
                            علاماتنا التجارية
                            <span className="h-1 w-12 bg-red-600 rounded-full" />
                        </h2>
                        <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 mt-2">توكيل وتوزيع أبرز العلامات التجارية العالمية في اليمن</p>
                    </div>

                    <div className="bg-slate-50/90 dark:bg-[#121216] border-2 border-red-500/20 dark:border-white/5 rounded-[3rem] p-6 sm:p-10 backdrop-blur-3xl shadow-xl dark:shadow-2xl">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 items-center">
                            {BRANDS.map((brand, idx) => (
                                <div
                                    key={idx}
                                    className="h-24 sm:h-28 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-center hover:border-red-500 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 group"
                                >
                                    <img
                                        src={brand.src}
                                        alt={brand.name}
                                        className="max-h-14 max-w-full object-contain filter group-hover:scale-110 transition-all duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== ABOUT US & VISION SECTION ===== */}
                <section id="about-details" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-28">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                        {/* About Card */}
                        <div className="bg-white dark:bg-[#141418] border-2 border-red-500/20 dark:border-white/10 rounded-[3.5rem] p-8 sm:p-12 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
                            <div className="w-16 h-16 rounded-3xl bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-black text-2xl mb-2">
                                🏢
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-red-700 dark:text-red-400">من نحن</h2>
                            <div className="space-y-4 text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                                <p>
                                    تعد <strong className="text-gray-900 dark:text-white font-black">مؤسسة سعيد نعمان المخلافي للتجارة والتبريد</strong> إحدى أهم الشركات الرائدة في اليمن المستوردة والموزعة للمواد الغذائية والمثلجات على مستوى كافة المحافظات والمدن اليمنية. تأسست عام 1979م وتتميز بخبرة عريقة في خطوط الاستيراد والتسويق كإحدى الشركات الرائدة في هذا المجال.
                                </p>
                                <p>
                                    تتميز شبكتنا بأنها شاملة في مختلف مدن اليمن لتغطية جميع متطلبات التوزيع عبر الفروع والوكلاء والموزعين المباشرين والمعتمدين.
                                </p>
                                <p>
                                    على مر السنين، أثبتت المؤسسة تواجدها من أفضل الشركات الرائدة في نقل، والتخزين، والتوزيع المبرد ودفعت بجودة الخدمات المقدمة واستحدثت أسطول الحفظ اللوجستي لنقل وتوزيع الأغذية في اليمن.
                                </p>
                            </div>
                        </div>

                        {/* Vision Card */}
                        <div className="bg-gradient-to-br from-red-900 via-slate-900 to-red-950 dark:from-red-950 dark:via-slate-950 dark:to-black !text-white border-2 border-red-600/40 rounded-[3.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
                            <div className="w-16 h-16 rounded-3xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black text-2xl mb-2">
                                🎯
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-amber-400">رؤيتنا</h2>
                            <div className="space-y-6 text-sm sm:text-base font-bold leading-relaxed text-justify">
                                <p className="text-lg sm:text-xl font-black !text-white leading-loose border-r-4 border-amber-400 pr-6 italic">
                                    "الحفاظ على موقعنا في صدارة الشركات المستوردة والموزعة للأغذية والتبريد في اليمن والوصول إلى أقصى مستويات رضا العملاء والشركاء عبر الالتزام بالتطوير المستمر والجودة الفائقة."
                                </p>
                                <div className="pt-6 border-t border-white/20 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black">✓</div>
                                        <div>
                                            <h4 className="font-black !text-white text-base">التزام غير مشروط بالجودة</h4>
                                            <p className="text-xs !text-gray-200">تطبيق أحدث معايير السلامة والتبريد في نقل وتخزين كافة المنتجات.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black">✓</div>
                                        <div>
                                            <h4 className="font-black !text-white text-base">سرعة وكفاءة التوزيع</h4>
                                            <p className="text-xs !text-gray-200">تغطية لكافة الأسواق اليمنية بأسطول حديث ومجهز بالكامل.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== COVERAGE NETWORK SECTION ===== */}
                <section className="bg-gradient-to-b from-slate-900 via-red-950 to-slate-950 dark:from-[#0a1128] dark:via-[#001f54] dark:to-[#0a1128] text-white py-20 px-4 sm:px-6 lg:px-12 my-20 rounded-[3.5rem] md:rounded-[4.5rem] border-y-4 border-red-600 shadow-2xl">
                    <div className="max-w-7xl mx-auto space-y-16" dir="rtl">
                        <div className="text-center max-w-3xl mx-auto space-y-4">
                            <span className="px-5 py-2 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-black tracking-widest uppercase">
                                التواجد والانتشار الميداني
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">شبكة تغطيتنا</h2>
                            <p className="text-sm sm:text-lg font-bold text-white/80 leading-relaxed">
                                تمتلك المؤسسة أكبر وأقوى شبكة توزيع وتغطية في كافة محافظات الجمهورية اليمنية من خلال الفروع والوكلاء والموزعين المباشرين لضمان وصول المنتجات لجميع العملاء.
                            </p>
                        </div>

                        {/* Direct Coverage */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-0.5 flex-1 bg-gradient-to-l from-red-500/50 to-transparent" />
                                <h3 className="text-xl sm:text-2xl font-black text-amber-400">تغطية الشبكة المباشرة</h3>
                                <div className="h-0.5 flex-1 bg-gradient-to-r from-red-500/50 to-transparent" />
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Stat 1 */}
                                <div className="bg-white/10 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-md text-center hover:bg-white/15 hover:border-amber-400/50 transition-all duration-300 group shadow-lg">
                                    <div className="w-16 h-16 bg-red-600/30 text-red-300 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform">
                                        🏢
                                    </div>
                                    <div className="text-4xl sm:text-5xl font-black text-amber-400 mb-2 tracking-tighter">26</div>
                                    <p className="text-xs sm:text-sm font-bold text-white/90">فرع ومستودع رئيسي</p>
                                </div>

                                {/* Stat 2 */}
                                <div className="bg-white/10 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-md text-center hover:bg-white/15 hover:border-amber-400/50 transition-all duration-300 group shadow-lg">
                                    <div className="w-16 h-16 bg-red-600/30 text-red-300 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform">
                                        🚛
                                    </div>
                                    <div className="text-4xl sm:text-5xl font-black text-amber-400 mb-2 tracking-tighter">230</div>
                                    <p className="text-xs sm:text-sm font-bold text-white/90">سيارة ووسيلة نقل مبردة</p>
                                </div>

                                {/* Stat 3 */}
                                <div className="bg-white/10 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-md text-center hover:bg-white/15 hover:border-amber-400/50 transition-all duration-300 group shadow-lg">
                                    <div className="w-16 h-16 bg-red-600/30 text-red-300 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform">
                                        🏪
                                    </div>
                                    <div className="text-4xl sm:text-5xl font-black text-amber-400 mb-2 tracking-tighter">432</div>
                                    <p className="text-xs sm:text-sm font-bold text-white/90">منفذ بيع مباشر</p>
                                </div>

                                {/* Stat 4 */}
                                <div className="bg-white/10 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-md text-center hover:bg-white/15 hover:border-amber-400/50 transition-all duration-300 group shadow-lg">
                                    <div className="w-16 h-16 bg-red-600/30 text-red-300 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform">
                                        👥
                                    </div>
                                    <div className="text-4xl sm:text-5xl font-black text-amber-400 mb-2 tracking-tighter">2,350</div>
                                    <p className="text-xs sm:text-sm font-bold text-white/90">عميل مباشر (كبار العملاء)</p>
                                </div>
                            </div>
                        </div>

                        {/* Indirect Coverage */}
                        <div className="space-y-8 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="h-0.5 flex-1 bg-gradient-to-l from-amber-400/50 to-transparent" />
                                <h3 className="text-xl sm:text-2xl font-black text-amber-400">تغطية الشبكة غير المباشرة</h3>
                                <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-400/50 to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
                                {/* Stat 1 */}
                                <div className="bg-white/10 border border-white/15 rounded-3xl p-8 backdrop-blur-md text-center hover:bg-white/15 hover:border-amber-400/50 transition-all duration-300 group shadow-lg">
                                    <div className="w-16 h-16 bg-amber-400/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform">
                                        🤝
                                    </div>
                                    <div className="text-4xl sm:text-6xl font-black text-amber-400 mb-2 tracking-tighter">170</div>
                                    <p className="text-sm font-black text-white/90">من كبار الوكلاء والموزعين</p>
                                </div>

                                {/* Stat 2 */}
                                <div className="bg-white/10 border border-white/15 rounded-3xl p-8 backdrop-blur-md text-center hover:bg-white/15 hover:border-amber-400/50 transition-all duration-300 group shadow-lg">
                                    <div className="w-16 h-16 bg-amber-400/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform">
                                        📍
                                    </div>
                                    <div className="text-4xl sm:text-6xl font-black text-amber-400 mb-2 tracking-tighter">132</div>
                                    <p className="text-sm font-black text-white/90">مدينة ومنطقة في اليمن</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== INFRASTRUCTURE SECTION ===== */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-28">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl sm:text-5xl font-black text-red-700 dark:text-red-400 tracking-tight">البنية التحتية</h2>
                        <p className="text-sm sm:text-base font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                            تعتمد مؤسسة سعيد نعمان المخلافي على أحدث البنى التحتية والتقنيات اللوجستية الحديثة لضمان جودة حفظ وتداول المنتجات.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Infra Card 1 */}
                        <div className="bg-white dark:bg-[#141418] border-2 border-red-500/20 dark:border-white/10 rounded-[3rem] p-8 text-center space-y-6 hover:-translate-y-2 transition-all duration-500 shadow-lg dark:shadow-2xl">
                            <div className="w-24 h-24 bg-red-900 dark:bg-[#001f54] text-amber-400 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg border-4 border-white/20">
                                🚚
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">شاحنات النقل</h3>
                            <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                                أسطول ضخم مجهز بأحدث أنظمة التبريد والتجميد الآلية لضمان الحفظ اللوجستي أثناء التنقل.
                            </p>
                        </div>

                        {/* Infra Card 2 */}
                        <div className="bg-white dark:bg-[#141418] border-2 border-red-500/20 dark:border-white/10 rounded-[3rem] p-8 text-center space-y-6 hover:-translate-y-2 transition-all duration-500 shadow-lg dark:shadow-2xl">
                            <div className="w-24 h-24 bg-red-900 dark:bg-[#001f54] text-amber-400 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg border-4 border-white/20">
                                ❄️
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">وحدات التخزين والتبريد</h3>
                            <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                                مجمعات غرف تبريد وتجميد بسعات تخزينية هائلة وتكنولوجيا تبريد متطورة على أحدث طراز.
                            </p>
                        </div>

                        {/* Infra Card 3 */}
                        <div className="bg-white dark:bg-[#141418] border-2 border-red-500/20 dark:border-white/10 rounded-[3rem] p-8 text-center space-y-6 hover:-translate-y-2 transition-all duration-500 shadow-lg dark:shadow-2xl">
                            <div className="w-24 h-24 bg-red-900 dark:bg-[#001f54] text-amber-400 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg border-4 border-white/20">
                                🏬
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">المخازن المركزية</h3>
                            <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                                مخازن ذات معايير عالمية للحفظ والتخزين الجاف والمبرد والمجمد بأعلى درجات السلامة.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ===== CTA BANNER SECTION ===== */}

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-20">
                    <div className="relative rounded-[3rem] md:rounded-[3.5rem] overflow-hidden bg-gradient-to-r from-red-900 via-red-950 to-slate-950 dark:from-red-950 dark:via-red-900 dark:to-black p-8 sm:p-14 !text-white shadow-2xl border-2 border-red-600/40">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
                            <div className="space-y-4 max-w-2xl">
                                <h3 className="text-2xl sm:text-4xl font-black !text-white leading-tight">
                                    توقع أكبر الفائدة لتوريد مواد غذائية معتمدة
                                </h3>
                                <p className="text-xs sm:text-base font-bold !text-gray-200 leading-relaxed">
                                    نعمل بثبات وتطوير مستمر لنضمن توفير أجود المنتجات للأسواق اليمنية مع الالتزام التام بالسلامة والجودة.
                                </p>
                            </div>
                            <button
                                onClick={handleContactClick}
                                className="px-10 py-5 bg-amber-400 hover:bg-amber-300 !text-black font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 whitespace-nowrap"
                            >
                                تواصل معنا
                            </button>
                        </div>
                    </div>
                </section>

                {/* ===== RETAIL PARTNERSHIP SECTION ===== */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-12">
                    <div className="relative rounded-[3rem] md:rounded-[3.5rem] overflow-hidden bg-gradient-to-r from-red-900 via-red-950 to-slate-950 dark:from-red-950 dark:via-red-900 dark:to-black p-8 sm:p-14 !text-white shadow-2xl border-2 border-red-600/40">
                        <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto text-3xl shadow-xl font-black">
                            ⚜️
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">مشاركة التجزئة</h2>
                        <p className="text-sm sm:text-lg font-bold text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            منذ عام 1979م، نساهم في تعزيز سوق التجزئة والجملة في اليمن وتقديم خدمات توزيع متكاملة تلبي احتياجات كافة الشركاء والعملاء في جميع المحافظات.
                        </p>
                    </div>
                </section>

            </div>
        </CustomerLayout>
    );
}
