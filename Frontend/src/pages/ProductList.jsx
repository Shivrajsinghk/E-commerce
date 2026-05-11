import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        category: searchParams.get("category") || "",
        minPrice: searchParams.get("min_price") || "",
        maxPrice: searchParams.get("max_price") || "",
        sort: searchParams.get("sort") || "newest",
    });

    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
    const PAGE_SIZE = 32;
    
    const buildQueryString = (page = 1, sourceFilters = filters) => {
        const params = new URLSearchParams();

        if (page > 1) {
            params.set("page", page);
        }
        if (sourceFilters.search.trim()) {
            params.set("search", sourceFilters.search.trim());
        }
        if (sourceFilters.category) {
            params.set("category", sourceFilters.category);
        }
        if (sourceFilters.minPrice !== "") {
            params.set("min_price", sourceFilters.minPrice);
        }
        if (sourceFilters.maxPrice !== "") {
            params.set("max_price", sourceFilters.maxPrice);
        }
        if (sourceFilters.sort) {
            params.set("sort", sourceFilters.sort);
        }

        return params.toString();
    };

    const getPageUrl = (page = 1, sourceFilters = filters) => {
        const queryString = buildQueryString(page, sourceFilters)
        return `${BASE_URL}/api/get_products/${queryString ? `?${queryString}` : ""}`
    }

    async function fetchProducts(page = 1, sourceFilters = filters) {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(getPageUrl(page, sourceFilters));
            setProducts(response.data.results || []);
            const total = response.data.count || 0;
            setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
            setCurrentPage(page);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCategories() {
        try {
            const response = await axios.get(`${BASE_URL}/api/get_categories/`);
            setCategories(response.data || []);
        } catch (error) {
            console.error("Failed to load categories", error?.response || error);
        }
    }

    function syncUrl(page = 1, sourceFilters = filters) {
        setSearchParams(buildQueryString(page, sourceFilters));
    }

    function handleFilterChange(event) {
        const { name, value } = event.target;
        const updatedFilters = {
            ...filters,
            [name]: value,
        };
        setFilters(updatedFilters);
        syncUrl(1, updatedFilters);
        fetchProducts(1, updatedFilters);
    }

    function applyFilters(event) {
        event.preventDefault();
        syncUrl(1, filters);
        fetchProducts(1, filters);
    }

    function clearFilters() {
        const clearedFilters = {
            search: "",
            category: "",
            minPrice: "",
            maxPrice: "",
            sort: "newest",
        };
        setFilters(clearedFilters);
        syncUrl(1, clearedFilters);
        fetchProducts(1, clearedFilters);
    }

    useEffect(() => {
        const initialFilters = {
            search: searchParams.get("search") || "",
            category: searchParams.get("category") || "",
            minPrice: searchParams.get("min_price") || "",
            maxPrice: searchParams.get("max_price") || "",
            sort: searchParams.get("sort") || "newest",
        };
        const page = Number(searchParams.get("page") || 1);

        setFilters(initialFilters);
        fetchCategories();
        fetchProducts(page, initialFilters);
    }, [BASE_URL, searchParams]);

    if (loading) {
        return <Loading />
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            {/* 🔥 HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Products</h1>
                {/* Sort on right */}
                <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    className="w-44 appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white 
                    backdrop-blur-md focus:ring-2 focus:ring-indigo-500 hover:border-indigo-400"
                >
                    <option className="bg-gray-900" value="newest">Newest</option>
                    <option className="bg-gray-900" value="oldest">Oldest</option>
                    <option className="bg-gray-900" value="price_asc">Price ↑</option>
                    <option className="bg-gray-900" value="price_desc">Price ↓</option>
                    <option className="bg-gray-900" value="name_asc">A to Z</option>
                    <option className="bg-gray-900" value="name_desc">Z to A</option>
                </select>
            </div>
            {/* 🔥 FILTER BAR */}
            <form
                onSubmit={applyFilters}
                className="flex flex-wrap items-center gap-3 mb-6 
                rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-3"
            >
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search products..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-white/10 bg-transparent text-white 
                        placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute left-2 top-2 text-gray-400">🔍</span>
                </div>

                {/* Category */}
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-36 appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                >
                    <option className="bg-gray-900" value="">Category</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-gray-900">
                            {c.name}
                        </option>
                    ))}
                </select>

                {/* Price */}
                <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min ₹"
                    className="w-24 px-2 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white"
                />
                <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max ₹"
                    className="w-24 px-2 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white"
                />

                {/* Reset */}
                <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
                >
                    Reset
                </button>
            </form>

            {/* 🔥 ACTIVE FILTERS */}
            <div className="flex flex-wrap gap-2 mb-4">
                {filters.search && (
                    <span className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded">
                        🔍 {filters.search}
                    </span>
                )}
                {filters.category && (
                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                        Cat: {filters.category}
                    </span>
                )}
                {filters.minPrice && (
                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">
                        ₹{filters.minPrice}+
                    </span>
                )}
            </div>

            {/* 🔥 PRODUCT COUNT */}
            <div className="mb-4 text-sm text-gray-400">
                Showing <span className="text-white font-medium">{products.length}</span> products
            </div>

            {/* 🔥 GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* EMPTY */}
            {products.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                    No products found 😕
                </div>
            )}
            {/* Pagination */}
            <div className="flex justify-center items-center mt-8 gap-3 flex-wrap">
                {/* First */}
                <button
                    onClick={() => {
                        syncUrl(1);
                        fetchProducts(1);
                    }}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95
                    ${currentPage === 1
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:scale-105 hover:shadow-lg"}
                    `}
                >
                    ⏮ First
                </button>
                {/* Previous */}
                <button
                    onClick={() => {
                        const page = currentPage - 1;
                        syncUrl(page);
                        fetchProducts(page);
                    }}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95
                    ${currentPage === 1
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-105 hover:shadow-lg"}
                    `}
                >
                    ⬅ Prev
                </button>
                {/* Page Info */}
                <div className="px-5 py-2 rounded-xl bg-gray-900 text-white font-semibold shadow-inner border border-gray-700">
                    Page <span className="text-indigo-400">{currentPage}</span> of{" "}
                    <span className="text-blue-400">{totalPages}</span>
                </div>
                {/* Next */}
                <button
                    onClick={() => {
                        const page = currentPage + 1;
                        syncUrl(page);
                        fetchProducts(page);
                    }}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95
                    ${currentPage === totalPages
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105 hover:shadow-lg"}
                    `}
                >
                    Next ➡
                </button>
                {/* Last */}
                <button
                    onClick={() => {
                        syncUrl(totalPages);
                        fetchProducts(totalPages);
                    }}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95
                    ${currentPage === totalPages
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-pink-500 to-red-500 text-white hover:scale-105 hover:shadow-lg"}
                    `}
                >
                    Last ⏭
                </button>
            </div>
        </div>
    );
}

export default ProductList;