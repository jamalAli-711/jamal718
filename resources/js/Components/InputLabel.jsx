export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
