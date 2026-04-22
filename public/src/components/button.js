import { createCx } from '../../utils/html.js';

export function createButton({
    label,
    onClick,
    variant = 'primary',
    full = false,
}) {
    const btn = document.createElement('button');
    const cx = createCx('btn');

    btn.textContent = label;
    btn.className = cx.modifier({ [variant]: true, full });

    if (onClick) btn.addEventListener('click', onClick);

    return btn;
}
