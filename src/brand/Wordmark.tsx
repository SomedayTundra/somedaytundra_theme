import clsx from 'clsx'

type WordmarkProps = {
    size: 'sm' | 'md'
    className?: string
}

// SOMEDAYTUNDRA in small caps, with the S and T set larger.
export default function Wordmark({ size, className }: WordmarkProps) {
    const capital = size === 'md' ? 'text-[22px]' : 'text-[16px]'
    return (
        <span
            className={clsx(
                'font-extrabold tracking-[0.04em] text-st-wordmark',
                size === 'md' ? 'text-[17px] leading-none' : 'text-[13px]',
                className
            )}
        >
            <span className={capital}>S</span>OMEDAY<span className={capital}>T</span>UNDRA
        </span>
    )
}
