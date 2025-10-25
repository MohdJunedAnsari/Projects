
import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SAMPLE_POSTS = [
  {
    id: 'welcome-to-smartblog',
    title: 'Welcome to SmartBlog',
    excerpt: 'A modern, minimal blog built with React and Tailwind. Create posts and write in Markdown.',
    content: `# Welcome to SmartBlog\n\nThis is a sample blog post. You can write **Markdown** here.\n\n- Create posts\n- Edit posts\n- Search and filter\n\nEnjoy!`,
    date: new Date().toISOString(),
    tags: ['intro', 'guide']
  },
  {
    id: 'react-patterns',
    title: 'React Patterns for Clean Code',
    excerpt: 'Some recommended patterns when building React applications (brief).',
    content: `## React Patterns\n\n1. Keep components small.\n2. Use hooks for logic reuse.\n3. Lift state up when necessary.\n\n> This is a quote example.`,
    date: new Date(Date.now() - 1000*60*60*24*3).toISOString(),
    tags: ['react', 'patterns']
  }
];

const storageKey = 'smartblog_posts_v1';

function usePosts() {
  const [posts, setPosts] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if(!raw) return SAMPLE_POSTS;
      return JSON.parse(raw);
    } catch(e){ return SAMPLE_POSTS; }
  });

  useEffect(()=>{ localStorage.setItem(storageKey, JSON.stringify(posts)); }, [posts]);

  function createPost(post){ setPosts(p => [post, ...p]); }
  function updatePost(id, updates){ setPosts(p => p.map(x => x.id === id ? {...x, ...updates} : x)); }
  function deletePost(id){ setPosts(p => p.filter(x => x.id !== id)); }

  return { posts, createPost, updatePost, deletePost };
}

function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleString();
}

function Home({ posts }){
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');

  const tags = useMemo(()=>{
    const s = new Set();
    posts.forEach(p => (p.tags||[]).forEach(t => s.add(t)));
    return Array.from(s);
  }, [posts]);

  const filtered = posts.filter(p => {
    const matchQ = q.trim() === '' || (p.title + ' ' + p.excerpt + ' ' + p.content).toLowerCase().includes(q.toLowerCase());
    const matchTag = !tag || (p.tags||[]).includes(tag);
    return matchQ && matchTag;
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">SmartBlog</h1>
        <Link to="/create" className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow">New Post</Link>
      </div>

      <div className="flex gap-3 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search posts..." className="flex-1 px-3 py-2 rounded-md border" />
        <select value={tag} onChange={e=>setTag(e.target.value)} className="px-3 py-2 rounded-md border">
          <option value="">All tags</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && <div className="p-6 bg-white/5 rounded">No posts found.</div>}
        {filtered.map(post => (
          <article key={post.id} className="p-4 bg-white/3 rounded-md shadow-sm">
            <Link to={`/post/${post.id}`} className="block">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-sm text-slate-300">{post.excerpt}</p>
            </Link>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
              <div>{formatDate(post.date)}</div>
              <div className="flex gap-2">
                {(post.tags||[]).map(t => <span key={t} className="px-2 py-1 bg-slate-700 rounded text-xs">#{t}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PostView({ posts, onDelete }){
  const { id } = useParams();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === id);

  if(!post) return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="text-center py-12">Post not found — <Link to="/">Go home</Link></div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="text-slate-400 text-sm">{formatDate(post.date)}</div>
        </div>
        <div className="flex gap-2">
          <Link to={`/edit/${post.id}`} className="px-3 py-2 border rounded">Edit</Link>
          <button onClick={()=>{ if(confirm('Delete post?')) { onDelete(post.id); navigate('/'); } }} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      <div className="mt-6 flex gap-2">
        {(post.tags||[]).map(t => <span key={t} className="px-2 py-1 bg-slate-700 rounded text-xs">#{t}</span>)}
      </div>
    </div>
  );
}

function Editor({ initial = null, onSave }){
  const navigate = useNavigate();
  const [title, setTitle] = useState(initial?.title || '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [content, setContent] = useState(initial?.content || '');
  const [tags, setTags] = useState((initial?.tags||[]).join(', '));

  function makeIdFromTitle(t){
    return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || String(Date.now());
  }

  function handleSave(){
    if(!title.trim()){ alert('Title required'); return; }
    const id = initial?.id || makeIdFromTitle(title);
    const post = { id, title: title.trim(), excerpt: excerpt.trim() || content.slice(0,140), content, tags: tags.split(',').map(s=>s.trim()).filter(Boolean), date: initial?.date || new Date().toISOString() };
    onSave(post);
    navigate(`/post/${post.id}`);
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{initial ? 'Edit Post' : 'Create Post'}</h2>
        <div className="flex gap-2">
          <button onClick={()=>navigate(-1)} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
        </div>
      </div>

      <label className="block mb-2">Title</label>
      <input className="w-full p-2 mb-4 rounded border" value={title} onChange={e=>setTitle(e.target.value)} />

      <label className="block mb-2">Excerpt</label>
      <input className="w-full p-2 mb-4 rounded border" value={excerpt} onChange={e=>setExcerpt(e.target.value)} />

      <label className="block mb-2">Tags (comma separated)</label>
      <input className="w-full p-2 mb-4 rounded border" value={tags} onChange={e=>setTags(e.target.value)} />

      <label className="block mb-2">Content (Markdown)</label>
      <textarea rows={12} className="w-full p-3 mb-4 rounded border font-mono" value={content} onChange={e=>setContent(e.target.value)} />

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Preview</h3>
        <div className="p-4 bg-white/5 rounded prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '*Nothing yet*'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const postsState = usePosts();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-900 text-white"> 
        <header className="border-b border-white/6 py-4">
          <div className="container mx-auto px-4 max-w-4xl flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">SmartBlog</Link>
            <nav className="flex gap-3 items-center">
              <Link to="/" className="text-sm">Home</Link>
              <Link to="/create" className="text-sm px-3 py-1 bg-indigo-600 rounded">New</Link>
            </nav>
          </div>
        </header>

        <main className="py-8">
          <Routes>
            <Route path="/" element={<Home posts={postsState.posts} />} />
            <Route path="/post/:id" element={<PostView posts={postsState.posts} onDelete={postsState.deletePost} />} />
            <Route path="/create" element={<Editor onSave={(p)=>postsState.createPost(p)} />} />
            <Route path="/edit/:id" element={<EditWrapper posts={postsState.posts} onUpdate={postsState.updatePost} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="border-t border-white/6 py-6 mt-12">
          <div className="container mx-auto px-4 max-w-4xl text-sm text-slate-400">Made with ❤️ — SmartBlog demo</div>
        </footer>
      </div>
    </Router>
  );
}

function EditWrapper({ posts, onUpdate }){
  const { id } = useParams();
  const post = posts.find(p => p.id === id);
  if(!post) return <div className="container mx-auto p-4">Post not found</div>;
  return <Editor initial={post} onSave={(p)=>onUpdate(id, p)} />;
}

function NotFound(){
  return (
    <div className="container mx-auto p-4 text-center">
      <h2 className="text-2xl font-bold">404 — Page not found</h2>
      <Link to="/" className="mt-4 inline-block text-indigo-400">Back home</Link>
    </div>
  );
}
