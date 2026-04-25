export function createButton({
    label,
    onClick,
    variant = 'primary',
    full = false,
}) {
    const $btn = $('<button>')
        .addClass(`btn btn--${variant}${full ? ' btn--full' : ''}`)
        .text(label);

    if (onClick) $btn.on('click', onClick);
    return $btn[0];
}