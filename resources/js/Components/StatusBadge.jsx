import { ORDER_STATUSES } from '@/constants';

const colorMap = {
    amber:  'bg-amber-50 text-amber-700 border border-amber-100',
    blue:   'bg-blue-50 text-[#0058be] border border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100',
    green:  'bg-emerald-50 text-emerald-700 border border-emerald-100',
    red:    'bg-rose-50 text-rose-700 border border-rose-100',
    gray:   'bg-gray-50 text-gray-600 border border-gray-200',
};

export default function StatusBadge({ status, map = ORDER_STATUSES }) {
    const info = map[status] || { label: status, color: 'gray' };
    return (
        <span className={`badge-editorial ${colorMap[info.color] || colorMap.gray}`}>
            {info.label}
        </span>
    );
}
