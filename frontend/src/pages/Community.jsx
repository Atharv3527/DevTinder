import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const MOCK_POSTS = [
  {
    id: 1,
    user: { name: 'Sarah Drasner', handle: '@sarah_edo', avatar: 'S', role: 'Engineering Manager' },
    content: "Just finalized the migration from Webpack to Vite. The difference in developer experience is absolutely staggering. Startup times went from 45 seconds to 300ms. If you haven't made the switch yet, what's holding you back?\n\n#vite #webdev #frontend",
    likes: 342,
    comments: 48,
    isLiked: false,
    timestamp: '2h ago',
    showComments: false,
    replies: [
      { id: 101, user: 'Dan Abramov', content: "It really is a game changer for large codebases." }
    ]
  },
  {
    id: 2,
    user: { name: 'Guillermo Rauch', handle: '@rauchg', avatar: 'G', role: 'CEO @ Vercel' },
    content: "The edge compute paradigm is completely shifting how we think about fullstack applications. By moving compute to where the user is, we eliminate entire classes of latency issues.",
    likes: 890,
    comments: 120,
    isLiked: false,
    timestamp: '5h ago',
    showComments: false,
    replies: []
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Simulate network load for the skeleton
    const timer = setTimeout(() => {
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: Date.now(),
      user: { name: 'You', handle: '@developer', avatar: 'Y', role: 'Full Stack Engineer' },
      content: newPostContent,
      likes: 0,
      comments: 0,
      isLiked: false,
      timestamp: 'Just now',
      showComments: false,
      replies: []
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsFocused(false);
  };

  const toggleLike = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return { 
          ...post, 
          isLiked: !post.isLiked, 
          likes: post.isLiked ? post.likes - 1 : post.likes + 1 
        };
      }
      return post;
    }));
  };

  const toggleComments = (id) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, showComments: !post.showComments } : post
    ));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12 w-full pt-4">
        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6 pb-12 w-full pt-4 relative z-10"
    >
      {/* Create Post Box */}
      <motion.div variants={itemVariants} className="bg-surface border border-border rounded-xl p-4 shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-primary/10">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-background border border-border rounded-full flex flex-shrink-0 items-center justify-center font-bold text-primary">
            Y
          </div>
          <form onSubmit={handlePostSubmit} className="flex-1">
             <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => { if (!newPostContent) setIsFocused(false) }}
              placeholder="What are you working on right now?"
              className="w-full bg-transparent resize-none outline-none text-text-primary placeholder:text-text-secondary min-h-[40px] transition-all text-sm leading-relaxed"
              style={{ height: isFocused || newPostContent ? '100px' : '40px' }}
             />
             
             <AnimatePresence>
              {(isFocused || newPostContent) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between items-center pt-3 border-t border-border mt-2"
                >
                  <div className="flex gap-2 text-text-secondary">
                    <button type="button" className="p-2 hover:bg-background rounded-full transition-colors hover:text-primary">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button type="button" className="p-2 hover:bg-background rounded-full transition-colors hover:text-primary">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </button>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!newPostContent.trim()}
                    className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-sm"
                  >
                    Post
                  </motion.button>
                </motion.div>
              )}
             </AnimatePresence>
          </form>
        </div>
      </motion.div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <EmptyState 
            icon="💬" 
            title="No posts yet" 
            message="Be the first to start a conversation in the community!" 
          />
        ) : (
          posts.map(post => (
            <motion.div key={post.id} variants={itemVariants} className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-border/80 transition-colors">
              <div className="flex gap-3 items-start mb-3">
                <div className="w-10 h-10 bg-background border border-border rounded-lg flex flex-shrink-0 items-center justify-center font-bold text-lg text-primary">
                  {post.user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary truncate">{post.user.name}</span>
                    <span className="text-xs text-text-secondary truncate">{post.user.handle}</span>
                    <span className="text-xs text-text-secondary flex-shrink-0">• {post.timestamp}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{post.user.role}</p>
                </div>
                <button className="text-text-secondary hover:text-text-primary p-1">
                  •••
                </button>
              </div>
              
              <div className="pl-13 mb-4">
                <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-6 border-t border-border pt-3 mt-4 text-text-secondary">
                <motion.button 
                  onClick={() => toggleLike(post.id)}
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }} 
                  className={`flex items-center gap-2 group text-sm ${post.isLiked ? 'text-blue-500' : 'hover:text-blue-500'}`}
                >
                  <div className={`p-1.5 rounded-full transition-colors ${post.isLiked ? 'bg-blue-500/20' : 'group-hover:bg-blue-500/10'}`}>
                    <svg className={`w-5 h-5 ${post.isLiked ? 'fill-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={post.isLiked ? 0 : 2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <span className="font-medium">{post.likes}</span>
                </motion.button>

                <motion.button 
                  onClick={() => toggleComments(post.id)}
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }} 
                  className="flex items-center gap-2 group hover:text-primary text-sm"
                >
                  <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="font-medium">{post.comments}</span>
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }} 
                  className="flex items-center gap-2 group hover:text-green-500 text-sm ml-auto"
                >
                  <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368l5.662 3.397m-5.662-3.397a3 3 0 005.662 3.397m-5.662-3.397l5.662-3.397m0 0a3 3 0 105.662 3.397m-5.662-3.397a3 3 0 015.662 3.397" />
                    </svg>
                  </div>
                </motion.button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {post.showComments && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border flex flex-col gap-3"
                  >
                    {/* Add Comment */}
                    <div className="flex gap-2">
                       <div className="w-8 h-8 bg-background border border-border rounded-full flex flex-shrink-0 items-center justify-center font-bold text-xs text-primary">Y</div>
                       <input type="text" placeholder="Add a comment..." className="flex-1 bg-background border border-border rounded-full px-4 py-1.5 text-sm outline-none focus:border-primary transition-colors text-text-primary" />
                    </div>
                    {/* Replies */}
                    {post.replies.map(reply => (
                      <div key={reply.id} className="flex gap-2 mt-2">
                        <div className="w-8 h-8 bg-background border border-border rounded-full flex flex-shrink-0 items-center justify-center font-bold text-xs text-primary">{reply.user[0]}</div>
                        <div className="bg-background border border-border rounded-xl px-3 py-2 text-sm max-w-[85%]">
                          <span className="font-semibold block text-text-primary">{reply.user}</span>
                          <span className="text-text-secondary">{reply.content}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
