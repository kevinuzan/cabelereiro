// #region FETCH

export async function request(url, options = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
}

// #endregion FETCH

// ------------------------------------------------------------------------------------------

// #region HANDLERS

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const notFoundHandler = (req, res) => res.status(404).json({ error: 'Route not found', path: req.originalUrl });

// #endregion HANDLERS

// ------------------------------------------------------------------------------------------

// #region METHODS

export const methods = {
    post: 'POST',
    get: 'GET',
    delete: 'DELETE',
    patch: 'PATCH',
};

// #endregion METHODS
