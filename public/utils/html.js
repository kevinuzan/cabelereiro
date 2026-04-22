// #region CLASS

/**
 * Appends BEM modifier classes to a base class string.
 * Skips any modifier whose value is falsy.
 * @example
 * applyCxModifiers('btn', { accent: true, full: false }) // 'btn btn--accent'
 */
function applyCxModifiers(base, modifiers) {
    let result = base;
    for (const mod in modifiers) {
        if (!modifiers[mod]) continue;
        result += ' ' + base + '--' + mod;
    }
    return result;
}

/**
 * Creates a BEM class builder scoped to a block.
 * Returns an object with two methods so class names are composed
 * programmatically, without writing BEM separators (__ or --)
 * anywhere outside this utility.
 * @example
 * const cx = createCx('appointment-item');
 * cx.element('name') // 'appointment-item__name'
 * cx.element('detail', { active: true }) // 'appointment-item__detail appointment-item__detail--active'
 * cx.modifier({ highlighted: true }) // 'appointment-item--highlighted'
 */
export function createCx(block) {
    return {
        element(element, modifiers = {}) {
            const base = `${block}__${element}`;
            return applyCxModifiers(base, modifiers);
        },
        modifier(modifiers = {}) {
            return applyCxModifiers(block, modifiers);
        },
    };
}

// #endregion CLASS