"use client";

import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import {
  createProduct,
  deleteProduct,
  setProductActive,
  updatePrice,
  updateStock,
  type NewProductInput,
} from "@/lib/inventory";
import { categories, formatPKR } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  LOW_STOCK_THRESHOLD,
  inputClass,
  listAdminProducts,
  variantLabel,
  type AdminProduct,
} from "../_shared";
import type { ProductVariant } from "@/lib/types";

type Row = { product: AdminProduct; variant: ProductVariant | null };
type EditTarget = { productId: string; variantId: string | null; draft: string };
type Notice = { kind: "success" | "error"; text: string };

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "stock-asc", label: "Stock: low to high" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [editingPrice, setEditingPrice] = useState<EditTarget | null>(null);
  const [editingStock, setEditingStock] = useState<EditTarget | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);

  // Add-product form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [formBusy, setFormBusy] = useState(false);

  async function load() {
    try {
      setProducts(await listAdminProducts());
    } catch {
      setNotice({
        kind: "error",
        text: "Could not load products. Please refresh the page.",
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  /** Run a mutation, then re-fetch so the table always shows fresh data. */
  async function mutate(action: () => Promise<void>, successText?: string) {
    setNotice(null);
    try {
      await action();
      setProducts(await listAdminProducts());
      if (successText) setNotice({ kind: "success", text: successText });
    } catch {
      setNotice({ kind: "error", text: "Something went wrong. Please try again." });
      try {
        setProducts(await listAdminProducts());
      } catch {
        // Keep the stale list; the error notice is already shown.
      }
    }
  }

  const rows = useMemo<Row[]>(() => {
    if (!products) return [];
    let list: Row[] = products.flatMap(
      (product): Row[] =>
        product.variants.length > 0
          ? product.variants.map((variant) => ({ product, variant }))
          : [{ product, variant: null }]
    );

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        ({ product, variant }) =>
          product.name.toLowerCase().includes(q) ||
          (variant?.sku ?? "").toLowerCase().includes(q)
      );
    }
    if (category !== "all") {
      list = list.filter(({ product }) => product.category === category);
    }

    const priceOf = (row: Row) => row.variant?.price ?? row.product.price;
    const stockOf = (row: Row) => row.variant?.stock ?? 0;

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => priceOf(a) - priceOf(b));
        break;
      case "price-desc":
        list.sort((a, b) => priceOf(b) - priceOf(a));
        break;
      case "stock-asc":
        list.sort((a, b) => stockOf(a) - stockOf(b));
        break;
      case "name":
      default:
        list.sort((a, b) =>
          a.product.name.localeCompare(b.product.name, "en")
        );
        break;
    }
    return list;
  }, [products, search, category, sort]);

  /* ---------------- price editing ---------------- */

  function commitPrice(row: Row) {
    const target = editingPrice;
    setEditingPrice(null);
    if (!target) return;
    const current = row.variant?.price ?? row.product.price;
    const n = Math.round(Number(target.draft));
    if (target.draft.trim() === "" || !Number.isFinite(n) || n <= 0 || n === current) {
      return;
    }
    mutate(
      () => updatePrice(row.product.id, row.variant ? row.variant.id : null, n),
      "Price updated."
    );
  }

  function priceInputKeyDown(event: KeyboardEvent<HTMLInputElement>, row: Row) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      setEditingPrice(null);
    }
  }

  /* ---------------- stock editing ---------------- */

  function changeStock(row: Row, delta: number) {
    const variant = row.variant;
    if (!variant) return;
    const next = Math.max(0, Math.round(variant.stock + delta));
    if (next === variant.stock) return;
    mutate(() => updateStock(row.product.id, variant.id, next));
  }

  function commitStock(row: Row) {
    const target = editingStock;
    setEditingStock(null);
    if (!target) return;
    const variant = row.variant;
    if (!variant) return;
    const n = Math.round(Number(target.draft));
    if (
      target.draft.trim() === "" ||
      !Number.isFinite(n) ||
      n < 0 ||
      n === variant.stock
    ) {
      return;
    }
    mutate(() => updateStock(row.product.id, variant.id, n));
  }

  function stockInputKeyDown(event: KeyboardEvent<HTMLInputElement>, row: Row) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      setEditingStock(null);
    }
  }

  /* ---------------- add product ---------------- */

  function resetAddForm() {
    setFormName("");
    setFormCategory("");
    setFormPrice("");
    setFormStock("");
    setFormTagline("");
    setFormDescription("");
    setFormImageUrl("");
    setFormActive(true);
    setFormError("");
  }

  function openAddModal() {
    resetAddForm();
    setAddOpen(true);
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    const priceNum = Math.round(Number(formPrice));
    const stockNum = Math.round(Number(formStock));

    if (!formName.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!formCategory) {
      setFormError("Choose a category.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setFormError("Price must be a positive number.");
      return;
    }
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      setFormError("Stock must be zero or more.");
      return;
    }

    setFormError("");
    setFormBusy(true);
    try {
      const input: NewProductInput = {
        name: formName.trim(),
        category: formCategory,
        price: priceNum,
        stock: stockNum,
        description: formDescription.trim(),
        tagline: formTagline.trim() || undefined,
        imageUrl: formImageUrl.trim() || undefined,
        active: formActive,
      };
      await createProduct(input);
      setAddOpen(false);
      resetAddForm();
      setProducts(await listAdminProducts());
      setNotice({ kind: "success", text: "Product added." });
    } catch {
      setFormError("Could not add the product. Please try again.");
    } finally {
      setFormBusy(false);
    }
  }

  /* ---------------- delete product ---------------- */

  async function confirmDelete() {
    if (!deleting) return;
    const id = deleting.id;
    const name = deleting.name;
    setDeleting(null);
    await mutate(() => deleteProduct(id), `Deleted "${name}".`);
  }

  /* ---------------- render ---------------- */

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-espresso">Inventory</h1>
          <p className="mt-1 text-sm text-espresso/60">
            Click a price or stock value to edit it inline.
          </p>
        </div>
        <Button onClick={openAddModal} size="md">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add product
        </Button>
      </div>

      {notice ? (
        <div
          className={clsx(
            "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium",
            notice.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-[#8C2F2F]/20 bg-[#8C2F2F]/5 text-[#8C2F2F]"
          )}
        >
          <p>{notice.text}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss message"
            className="rounded-full p-1 hover:bg-black/5"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-72">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/40"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or SKU"
            aria-label="Search products"
            className={clsx(inputClass, "pl-10")}
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
          className={clsx(inputClass, "md:w-48")}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          aria-label="Sort products"
          className={clsx(inputClass, "md:w-52")}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-espresso/10 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-espresso/10 text-xs uppercase tracking-wide text-espresso/50">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products === null ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-espresso/5">
                  <td className="px-4 py-3" colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-espresso/60">
                  No products match your filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const key = row.variant
                  ? `${row.product.id}:${row.variant.id}`
                  : row.product.id;
                const price = row.variant?.price ?? row.product.price;
                const stock = row.variant?.stock;
                const isLow = stock !== undefined && stock <= LOW_STOCK_THRESHOLD;
                const priceEditing =
                  editingPrice &&
                  editingPrice.productId === row.product.id &&
                  editingPrice.variantId === (row.variant ? row.variant.id : null);
                const stockEditing =
                  editingStock &&
                  editingStock.productId === row.product.id &&
                  editingStock.variantId === (row.variant ? row.variant.id : null);

                return (
                  <tr
                    key={key}
                    className={clsx(
                      "border-b border-espresso/5 last:border-0",
                      isLow && "bg-amber-50/70"
                    )}
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {row.product.images[0] ? (
                          <img
                            src={row.product.images[0]}
                            alt=""
                            loading="lazy"
                            className="h-11 w-11 shrink-0 rounded-xl border border-espresso/10 object-cover"
                          />
                        ) : (
                          <span
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-espresso/5 text-espresso/40"
                            aria-hidden="true"
                          >
                            <Package className="h-5 w-5" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-espresso">{row.product.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {row.variant ? (
                              <span className="text-xs text-espresso/50">
                                {variantLabel(row.variant)}
                              </span>
                            ) : null}
                            {isLow ? (
                              <Badge tone="low">
                                <TriangleAlert
                                  className="mr-1 h-3 w-3"
                                  aria-hidden="true"
                                />
                                Low stock
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* SKU */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-espresso/70">
                        {row.variant ? row.variant.sku : "-"}
                      </span>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3 text-espresso/80">
                      {categoryName(row.product.category)}
                    </td>
                    {/* Price */}
                    <td className="px-4 py-3">
                      {priceEditing ? (
                        <input
                          autoFocus
                          type="number"
                          min={1}
                          value={editingPrice.draft}
                          onChange={(event) =>
                            setEditingPrice({ ...editingPrice, draft: event.target.value })
                          }
                          onBlur={() => commitPrice(row)}
                          onKeyDown={(event) => priceInputKeyDown(event, row)}
                          aria-label={`Edit price for ${row.product.name}`}
                          className="w-28 rounded-lg border border-cognac bg-white px-2 py-1 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-cognac/30"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingPrice({
                              productId: row.product.id,
                              variantId: row.variant ? row.variant.id : null,
                              draft: String(price),
                            })
                          }
                          title="Click to edit price"
                          className="rounded px-1 py-0.5 font-medium text-espresso hover:bg-espresso/5"
                        >
                          {formatPKR(price)}
                        </button>
                      )}
                    </td>
                    {/* Stock */}
                    <td className="px-4 py-3">
                      {row.variant ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`Decrease stock for ${row.product.name}`}
                            onClick={() => changeStock(row, -1)}
                            disabled={stock === 0}
                            className="rounded-full p-1.5 text-espresso transition-colors hover:bg-espresso/5 disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          {stockEditing ? (
                            <input
                              autoFocus
                              type="number"
                              min={0}
                              value={editingStock.draft}
                              onChange={(event) =>
                                setEditingStock({
                                  ...editingStock,
                                  draft: event.target.value,
                                })
                              }
                              onBlur={() => commitStock(row)}
                              onKeyDown={(event) => stockInputKeyDown(event, row)}
                              aria-label={`Edit stock for ${row.product.name}`}
                              className="w-16 rounded-lg border border-cognac bg-white px-2 py-1 text-center text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-cognac/30"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingStock({
                                  productId: row.product.id,
                                  variantId: row.variant ? row.variant.id : null,
                                  draft: String(stock),
                                })
                              }
                              title="Click to type exact stock"
                              className={clsx(
                                "min-w-10 rounded px-1 py-0.5 text-center font-semibold",
                                isLow ? "text-amber-800" : "text-espresso",
                                "hover:bg-espresso/5"
                              )}
                            >
                              {stock}
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label={`Increase stock for ${row.product.name}`}
                            onClick={() => changeStock(row, 1)}
                            className="rounded-full p-1.5 text-espresso transition-colors hover:bg-espresso/5"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-espresso/40">-</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          mutate(() =>
                            setProductActive(row.product.id, !row.product.active)
                          )
                        }
                        title={
                          row.product.active ? "Set as draft" : "Set as active"
                        }
                      >
                        <Badge tone={row.product.active ? "new" : "default"}>
                          {row.product.active ? "Active" : "Draft"}
                        </Badge>
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDeleting(row.product)}
                        aria-label={`Delete ${row.product.name}`}
                        title="Delete product"
                        className="rounded-full p-2 text-espresso/50 transition-colors hover:bg-[#8C2F2F]/10 hover:text-[#8C2F2F]"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add product modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add product">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label htmlFor="new-name" className="mb-1.5 block text-sm font-medium text-espresso">
              Name *
            </label>
            <input
              id="new-name"
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
              className={inputClass}
              placeholder="e.g. Voyager Duffle"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new-category" className="mb-1.5 block text-sm font-medium text-espresso">
                Category *
              </label>
              <select
                id="new-category"
                value={formCategory}
                onChange={(event) => setFormCategory(event.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-price" className="mb-1.5 block text-sm font-medium text-espresso">
                Price (PKR) *
              </label>
              <input
                id="new-price"
                type="number"
                min={1}
                value={formPrice}
                onChange={(event) => setFormPrice(event.target.value)}
                className={inputClass}
                placeholder="e.g. 12500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new-stock" className="mb-1.5 block text-sm font-medium text-espresso">
                Stock *
              </label>
              <input
                id="new-stock"
                type="number"
                min={0}
                value={formStock}
                onChange={(event) => setFormStock(event.target.value)}
                className={inputClass}
                placeholder="e.g. 20"
              />
            </div>
            <div>
              <label htmlFor="new-tagline" className="mb-1.5 block text-sm font-medium text-espresso">
                Tagline
              </label>
              <input
                id="new-tagline"
                value={formTagline}
                onChange={(event) => setFormTagline(event.target.value)}
                className={inputClass}
                placeholder="Short selling line"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-description" className="mb-1.5 block text-sm font-medium text-espresso">
              Description
            </label>
            <textarea
              id="new-description"
              value={formDescription}
              onChange={(event) => setFormDescription(event.target.value)}
              rows={4}
              className={inputClass}
              placeholder="Full product description"
            />
          </div>

          <div>
            <ImageUploadField
              label="Product image"
              help="Upload from your computer, or paste a URL below."
              value={formImageUrl}
              onChange={setFormImageUrl}
            />
            <label
              htmlFor="new-image"
              className="mb-1.5 mt-3 block text-sm font-medium text-espresso"
            >
              Or image URL
            </label>
            <input
              id="new-image"
              type="url"
              value={formImageUrl}
              onChange={(event) => setFormImageUrl(event.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-espresso/50">
              Used as the product thumbnail. Leave empty to use the category image.
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-espresso">
            <input
              type="checkbox"
              checked={formActive}
              onChange={(event) => setFormActive(event.target.checked)}
              className="h-4 w-4 rounded accent-[#C17A3D]"
            />
            Active (visible in the store)
          </label>

          {formError ? (
            <p className="text-sm font-medium text-[#8C2F2F]">{formError}</p>
          ) : null}

          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={formBusy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formBusy}>
              {formBusy ? "Adding..." : "Add product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete product"
      >
        {deleting ? (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-espresso/80">
              Delete <strong className="text-espresso">{deleting.name}</strong>? This
              removes the product and all of its variants permanently.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleting(null)}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8C2F2F] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#6f2525] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C2F2F]"
              >
                Delete product
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
