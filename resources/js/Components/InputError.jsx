export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-xs font-black uppercase tracking-widest text-primary mt-2 ' + className}
        >
            {message}
        </p>
    ) : null;
}
