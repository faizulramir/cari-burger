import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/burger-marker.svg"
            alt="Cariburger"
            className={props.className || 'size-5'}
            style={{ objectFit: 'contain' }}
        />
    );
}
