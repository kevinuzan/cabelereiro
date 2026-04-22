// #region PARSE/SERIALIZE

/**
 * Parses a delimited string into a cleaned and transformed array.
 *
 * - Splits the input string using the specified separator
 * - Trims each item
 * - Filters items using the provided filter function
 * - Applies an optional transformation to each item
 *
 * @param {string} [input=''] - The input string to parse
 * @param {Object} [options={}] - Optional configuration
 * @param {string} [options.separator=','] - Delimiter used to split the string (default: ",")
 * @param {(item: string) => any} [options.transform] - Transform function (default: identity)
 * @param {(item: string) => boolean} [options.filter] - Filter function (default: Boolean)
 */
export function parseList(input = '', options = {}) {
    const {
        separator = ','
        , transform = (item) => item
        , filter = Boolean
    } = options;

    return input
        .split(separator)
        .map(s => s.trim())
        .filter(filter)
        .map(transform);
}

// ------------------------------------------------------------------------------------------

/**
 * Serializes an array into a delimited string.
 *
 * - Applies an optional transformation to each item
 * - Filters items using the provided filter function
 * - Joins items using the specified separator
 *
 * @param {Array} [list=[]] - The array to serialize
 * @param {Object} [options={}] - Optional configuration
 * @param {string} [options.separator=','] - Delimiter used to join items (default: ",")
 * @param {Function} [options.transform=(item) => item] - Function to transform each item
 * @param {Function} [options.filter=Boolean] - Function to filter items before joining
 */
export function stringifyList(list = [], options = {}) {
    const {
        separator = ',',
        transform = (item) => item,
        filter = Boolean
    } = options;

    return list
        .filter(filter)
        .map(transform)
        .join(separator);
}

// #endregion PARSE/SERIALIZE