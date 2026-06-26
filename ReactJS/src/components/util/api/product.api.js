import axios from '../axios.customize';

export const getProductDetailApi = (id) => {
    return axios.get(`/api/products/${id}`);
};

export const getBestSellingProductsApi = (page = 1, limit = 10) => {
    return axios.get(`/api/products/bestselling?page=${page}&limit=${limit}`);
};

export const getAllProductsStoreApi = (params = {}) => {
    const {
        page = 1,
        limit = 12,
        search = '',
        sort = 'default',
        category,
        brandId,
        minPrice,
        maxPrice,
        ram,
    } = params;

    const query = new URLSearchParams();

    query.set('page', page);
    query.set('limit', limit);

    if (search)                query.set('search', search);
    if (sort && sort !== 'default') query.set('sort', sort);
    if (minPrice)              query.set('minPrice', minPrice);
    if (maxPrice)              query.set('maxPrice', maxPrice);

    category?.forEach(c => query.append('category', c));
    brandId?.forEach(b  => query.append('brandId',  b));
    ram?.forEach(r      => query.append('ram',       r));

    return axios.get(`/api/products?${query.toString()}`);
};

export const getPublicBrandsApi = () => {
    return axios.get('/api/brands');
};

export const getPublicCategoriesApi = () => {
    return axios.get('/api/categories');
};