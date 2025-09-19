'use client';

import { useState, useEffect } from 'react';

interface CategoryData {
  [category: string]: {
    subcategories: string[];
    description: string;
  };
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<CategoryData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategories, setNewSubcategories] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editSubcategories, setEditSubcategories] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim() || !newSubcategories.trim() || !newDescription.trim()) return;

    setSaving(true);
    try {
      const subcategories = newSubcategories.split(',').map(s => s.trim()).filter(Boolean);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategory.trim(),
          subcategories,
          description: newDescription.trim()
        }),
      });

      if (response.ok) {
        setNewCategory('');
        setNewSubcategories('');
        setNewDescription('');
        await loadCategories();
      } else {
        alert('Failed to add category');
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = async (categoryName: string) => {
    if (!editSubcategories.trim() && !editDescription.trim()) return;

    setSaving(true);
    try {
      const updateData: any = {};

      if (editSubcategories.trim()) {
        updateData.subcategories = editSubcategories.split(',').map(s => s.trim()).filter(Boolean);
      }

      if (editDescription.trim()) {
        updateData.description = editDescription.trim();
      }

      const response = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setEditingCategory(null);
        setEditSubcategories('');
        setEditDescription('');
        await loadCategories();
      } else {
        alert('Failed to update category');
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCategories();
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    } finally {
      setSaving(false);
    }
  };

  const reindexEmbeddings = async () => {
    if (!confirm('This will recreate all category embeddings. Continue?')) return;

    setReindexing(true);
    try {
      const response = await fetch('/api/reindex', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Reindexing completed! ${result.categoriesIndexed} categories indexed.`);
      } else {
        alert('Failed to reindex embeddings');
      }
    } catch (error) {
      console.error('Failed to reindex:', error);
      alert('Failed to reindex embeddings');
    } finally {
      setReindexing(false);
    }
  };

  const startEditing = (category: string, subcategories: string[], description: string) => {
    setEditingCategory(category);
    setEditSubcategories(subcategories.join(', '));
    setEditDescription(description);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Category Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage expense categories and subcategories
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Add New Category */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Add New Category
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Category name (e.g., Food)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <textarea
                placeholder="Category description (e.g., Meals, groceries, snacks, and dining)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
              <input
                type="text"
                placeholder="Subcategories (comma-separated)"
                value={newSubcategories}
                onChange={(e) => setNewSubcategories(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <button
              onClick={addCategory}
              disabled={saving || !newCategory.trim() || !newSubcategories.trim() || !newDescription.trim()}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Category</span>
            </button>
          </div>

          {/* Reindex Button */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Reindex Embeddings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Recreate category embeddings for better search results
                </p>
              </div>
              <button
                onClick={reindexEmbeddings}
                disabled={reindexing}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 flex items-center space-x-2"
              >
                {reindexing ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>{reindexing ? 'Reindexing...' : 'Reindex'}</span>
              </button>
            </div>
          </div>

          {/* Existing Categories */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Existing Categories ({Object.keys(categories).length})
            </h2>

            {Object.keys(categories).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No categories found.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(categories).map(([category, data]: [string, any]) => {
                  // Ensure data has the expected structure
                  const categoryData = data && typeof data === 'object'
                    ? data
                    : { subcategories: [], description: 'No description available' };

                  return (
                    <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {category}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(category, categoryData.subcategories || [], categoryData.description || '')}
                            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCategory(category)}
                            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                          {categoryData.description || 'No description available'}
                        </p>
                      </div>

                      {editingCategory === category ? (
                        <div className="space-y-3">
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Category description"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          />
                          <input
                            type="text"
                            value={editSubcategories}
                            onChange={(e) => setEditSubcategories(e.target.value)}
                            placeholder="Subcategories (comma-separated)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateCategory(category)}
                              disabled={saving}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(categoryData.subcategories || []).map((sub: string) => (
                            <span
                              key={sub}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            ← Back to Chat
          </a>
        </div>
      </div>
    </div>
  );
}
