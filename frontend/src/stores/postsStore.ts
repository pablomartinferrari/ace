import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Post, PostType } from '../types/Post';

interface PostsState {
  // State
  posts: Post[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filterType: PostType | 'ALL';
  refreshTrigger: number;

  // Actions
  setPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: PostType | 'ALL') => void;
  triggerRefresh: () => void;

  // Computed getters
  filteredPosts: Post[];
  hasPosts: boolean;
  isSearching: boolean;
}

export const usePostsStore = create<PostsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      posts: [],
      loading: true,
      error: null,
      searchQuery: '',
      filterType: 'ALL',
      refreshTrigger: 0,

      // Actions
      setPosts: (posts) => set({ posts, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFilterType: (filterType) => set({ filterType }),
      triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

      // Computed getters
      get filteredPosts() {
        const { posts, searchQuery, filterType } = get();
        let filtered = posts;

        if (filterType !== 'ALL') {
          filtered = filtered.filter(post => post.type === filterType);
        }

        if (searchQuery && searchQuery.length >= 3) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(post =>
            post.content.toLowerCase().includes(query) ||
            post.userName.toLowerCase().includes(query) ||
            (post.tags?.some(tag => tag.toLowerCase().includes(query))) ||
            (post.propertyDetails?.propertyType?.toLowerCase().includes(query)) ||
            (post.propertyDetails?.industry?.some(industry => industry.toLowerCase().includes(query))) ||
            (post.propertyDetails?.location?.city?.toLowerCase().includes(query)) ||
            (post.propertyDetails?.location?.state?.toLowerCase().includes(query))
          );
        }

        // Copy array before sorting
        return [...filtered].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },

      get hasPosts() {
        return get().posts.length > 0;
      },

      get isSearching() {
        return get().searchQuery.length >= 3;
      },
    }),
    {
      name: 'posts-store',
    }
  )
);