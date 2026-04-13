export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-outline-variant bg-surface text-secondary shadow-sm focus:ring-secondary transition-all ' +
                className
            }
        />
    );
}
