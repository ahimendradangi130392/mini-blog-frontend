import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Calendar, Heart, MessageCircle, RotateCcw, ChevronRight, User, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { postsAPI, commentsAPI } from '../services/api'
import { Post, Comment as PostComment } from '../types'
import Card from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/textarea'
import UserMentionAutocomplete from '../components/ui/UserMentionAutocomplete'
import Skeleton from '../components/ui/Skeleton'
import { H1, H2, H3, P, Muted, Small } from '../components/ui/typography'

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Likes / Repost states
  const [likeLoading, setLikeLoading] = useState(false);
  const [repostLoading, setRepostLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Check if we're on the edit route
  const isEditRoute = location.pathname.endsWith('/edit');

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const postData = await postsAPI.getPostById(id);
        setPost(postData);
        setEditData({
          title: postData.title,
          content: postData.content
        });
        
        // Auto-enable edit mode if accessed via edit route
        if (isEditRoute) {
          if (user?._id === postData.author._id) {
            setIsEditing(true);
          } else {
            // If not the author, redirect to view mode
            navigate(`/post/${id}`, { replace: true });
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isEditRoute, user?._id, navigate]);

  const fetchComments = async (page: number = 1) => {
    if (!id) return;
    try {
      setCommentsLoading(true);
      const res = await commentsAPI.getCommentsByPost(id, page, 10);
      const list = (res.data || []) as PostComment[];
      if (page === 1) {
        setComments(list);
      } else {
        setComments(prev => [...prev, ...list]);
      }
      setHasMoreComments(res.pagination?.hasNext || false);
    } catch (err: any) {
      // swallow and show inline state below
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchComments(1);
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      title: post?.title || '',
      content: post?.content || ''
    });
  };

  const handleSave = async () => {
    if (!id || !editData.title.trim() || !editData.content.trim()) return;
    
    try {
      setEditLoading(true);
      const updatedPost = await postsAPI.updatePost(id, editData);
      setPost(updatedPost);
      setIsEditing(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await postsAPI.deletePost(id);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
    }
  };

  const handleToggleLike = async () => {
    if (!id || !isAuthenticated) return;
    
    try {
      setLikeLoading(true);
      const updatedPost = await postsAPI.toggleLike(id);
      setPost(updatedPost);
    } catch (err: any) {
      console.error('Failed to toggle like:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleRepost = async () => {
    if (!id || !isAuthenticated) return;
    
    try {
      setRepostLoading(true);
      const updatedPost = await postsAPI.rePost(id);
      setPost(updatedPost);
    } catch (err: any) {
      console.error('Failed to repost:', err);
    } finally {
      setRepostLoading(false);
    }
  };

  const submitComment = async () => {
    if (!id || !commentText.trim() || !isAuthenticated) return;
    
    try {
      setCommentSubmitting(true);
      await commentsAPI.createComment({
        postId: id,
        content: commentText
      });
      setCommentText('');
      fetchComments(1); // Refresh comments
    } catch (err: any) {
      console.error('Failed to submit comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const loadMoreComments = () => {
    if (hasMoreComments && !commentsLoading) {
      fetchComments(commentsPage + 1);
      setCommentsPage(prev => prev + 1);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!isAuthenticated) return;
    
    try {
      await commentsAPI.toggleLike(commentId);
      fetchComments(1); // Refresh comments
    } catch (err: any) {
      console.error('Failed to toggle comment like:', err);
    }
  };

  // Computed values
  const isAuthor = user?._id === post?.author._id;
  const isLiked = post?.likes?.includes(user?._id || '') || false;
  const isReposted = post?.rePosts?.includes(user?._id || '') || false;

  // Highlight mentions in content
  const highlightedContent = useMemo(() => {
    if (!post?.content) return '';
    return post.content.replace(/@(\w+)/g, '<span class="text-primary-600 font-medium">@$1</span>');
  }, [post?.content]);

  // Utility functions
  const formatUsername = (username: string) => username || 'Anonymous';
  const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')
  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <Skeleton className="h-8 sm:h-12 w-64 sm:w-80 mx-auto mb-4 sm:mb-6" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center py-8 sm:py-12">
          <div className="mb-6">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
            <H3>Failed to load post</H3>
            <Muted className="mb-4">{error || 'Post not found'}</Muted>
            <div className="space-x-4">
              <Button onClick={() => navigate('/')} variant="default">
                Go Home
              </Button>
              <Button onClick={() => window.location.reload()} variant="secondary">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Back to Posts
          </Link>
        </div>

        {/* Enhanced Post Card */}
        <Card className="relative overflow-hidden shadow-xl border-0 mb-8">
          {isEditing ? (
            <div className="p-4 sm:p-8 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Post</h2>
                <p className="text-sm text-gray-600 mt-1">Make changes to your post below</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="Enter post title"
                    required
                    maxLength={100}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <Textarea
                    id="content"
                    value={editData.content}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    placeholder="Write your post content here..."
                    required
                    maxLength={1000}
                    className="w-full min-h-[200px]"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                  <Button onClick={handleCancel} variant="secondary" size="lg" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="default"
                    disabled={editLoading}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-8">
              {/* Post Header */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 lg:mb-8 space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <H1>{post.title}</H1>
                  <Muted className="mt-2">By {formatUsername(post.author.username)}</Muted>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
                    <Link 
                      to={`/user/${post.author._id}`}
                      className="hover:text-primary-600 transition-colors duration-200 font-medium flex items-center group"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2 group-hover:bg-primary-200 transition-colors duration-200">
                        <span className="text-xs sm:text-sm font-bold text-primary-600">
                          {post.author.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      {formatUsername(post.author.username)}
                    </Link>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {getTimeAgo(post.createdAt)}
                    </span>
                    {post.updatedAt !== post.createdAt && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        edited {getTimeAgo(post.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
                
                {isAuthor && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:ml-6">
                    <Button onClick={handleEdit} variant="secondary" size="sm" className="shadow-sm w-full sm:w-auto">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button onClick={handleDelete} variant="destructive" size="sm" className="shadow-sm w-full sm:w-auto">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="prose max-w-none mb-6 lg:mb-8">
                <P className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightedContent }} />
              </div>

              {/* Enhanced Actions */}
              <div className="border-t border-gray-100 pt-4 lg:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button 
                      variant={isLiked ? 'secondary' : 'default'} 
                      size="lg" 
                      onClick={handleToggleLike} 
                      disabled={likeLoading}
                      className="shadow-sm hover:shadow-md transition-shadow duration-200 w-full sm:w-auto"
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'text-red-500' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'} ({post.likes?.length || 0})
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      onClick={handleRepost} 
                      disabled={repostLoading}
                      className="hover:bg-gray-100 transition-colors duration-200 w-full sm:w-auto"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Re-post ({post.rePosts?.length || 0})
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full text-center sm:text-left">
                    <span className="font-medium">{post.comments?.length || comments.length}</span> comments
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Enhanced Comments Section */}
        <Card className="shadow-xl border-0">
          <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
              <H2>Comments</H2>
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-center sm:text-left">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </div>
            </div>
            
            {/* Comment Input */}
            <div className="mb-6 lg:mb-8">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                    <span className="text-sm font-bold text-primary-600">
                      {user?.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <UserMentionAutocomplete
                      placeholder={isAuthenticated ? 'Write a comment… Use @username to mention' : 'Login to write a comment'}
                      value={commentText}
                      onChange={setCommentText}
                      onSelect={(username) => {
                        // The component already handles the mention insertion
                      }}
                      disabled={!isAuthenticated || commentSubmitting}
                      maxLength={500}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <span className="text-xs text-gray-500 text-center sm:text-left">
                        {commentText.length}/500 characters
                      </span>
                      <Button 
                        variant="default" 
                        onClick={submitComment} 
                        disabled={!isAuthenticated || commentSubmitting || !commentText.trim()} 
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {commentSubmitting ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {commentsLoading && comments.length === 0 ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h4>
                <p className="text-gray-600">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((c: PostComment) => {
                  const cLiked = !!(user && c.likes?.includes(user._id));
                  const authorId = typeof (c as any).author === 'string' ? (c as any).author : (c as any).author?._id;
                  const authorUsername = typeof (c as any).author === 'object' && (c as any).author?.username
                    ? (c as any).author.username
                    : (user && authorId === user._id ? user.username : 'user');
                  return (
                    <div key={c._id} className="group hover:bg-gray-50 rounded-xl p-4 transition-colors duration-200">
                      <div className="flex space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary-600">
                            {authorUsername?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <Link 
                              to={`/user/${authorId || ''}`} 
                              className="font-medium text-gray-900 hover:text-primary-600 transition-colors duration-200"
                            >
                              {formatUsername(authorUsername)}
                            </Link>
                            <Small className="text-gray-500">{getTimeAgo(c.createdAt)}</Small>
                          </div>
                          
                          <P className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: c.content.replace(/@(\w+)/g, m => `<a href='/user/${m.slice(1)}' class='text-primary-600 hover:underline font-medium'>${m}</a>`) }} />
                          
                          <div className="flex items-center space-x-4">
                            <Button 
                              variant={cLiked ? 'secondary' : 'ghost'} 
                              size="sm" 
                              onClick={() => toggleCommentLike(c._id)}
                              className="text-sm hover:bg-gray-100 transition-colors duration-200"
                            >
                              <Heart className={`w-4 h-4 mr-1 ${cLiked ? 'text-red-500' : ''}`} />
                              {cLiked ? 'Liked' : 'Like'} ({c.likes?.length || 0})
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load More Comments */}
                {hasMoreComments && (
                  <div className="pt-6 text-center">
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      onClick={loadMoreComments} 
                      disabled={commentsLoading}
                      className="shadow-sm hover:shadow-md transition-shadow duration-200 w-full sm:w-auto"
                    >
                      {commentsLoading ? 'Loading…' : 'Load more comments'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PostDetail; 
