import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { createPost } from '../../api/posts';
import PostMedia from './PostMedia';
import './Post.css';

function NewPost(props) {
  const {
    postId, loggedInUserId, setAlert, addToPostIds,
  } = props;
  const defaultPostObj = { text: '', mediaUrl: '' };
  const isEditingPost = true;
  const [post, setPost] = useState(defaultPostObj);
  const [imagePreviewFile, setImagePreviewFile] = useState(null);
  const [videoPreviewFile, setVideoPreviewFile] = useState(null);
  const [reRenderMediaKey, setReRenderMediaKey] = useState(0);

  async function handlePostChange(e) {
    const { name, value } = e.target;
    setPost((postObject) => ({
      ...postObject,
      [name]: value,
    }));
  }

  async function handleCreatePost() {
    try {
      const formData = new FormData();
      formData.append('userId', loggedInUserId);
      formData.append('post', JSON.stringify(post));
      if (imagePreviewFile !== null && imagePreviewFile !== '') {
        formData.append('File_0', imagePreviewFile);
      } else if (videoPreviewFile !== null && videoPreviewFile !== '') {
        formData.append('File_0', videoPreviewFile);
      }
      const newPostId = await createPost(formData);
      addToPostIds(newPostId.data);

      setPost(defaultPostObj);
      setImagePreviewFile(null);
      setVideoPreviewFile(null);
      setReRenderMediaKey((prevKey) => prevKey + 1);
      setAlert({ severity: 'success', message: 'Post Created!' });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error creating Post: ${err.message ? err.message : err.toString()}` });
    }
  }

  return (
    <div className='postDiv'>
      <Card>
        <CardContent>
          <TextField name="text" multiline value={post.text} onChange={handlePostChange} placeholder="Start your post here..." />
          <PostMedia postId={postId} mediaUrl={post.mediaUrl} setAlert={setAlert}
            setImagePreviewFile={setImagePreviewFile}
            setVideoPreviewFile={setVideoPreviewFile}
            isEditingPost={isEditingPost}
            reRenderMediaKey={reRenderMediaKey}
          />
        </CardContent>
        <CardActions>
          <Button type="primary" variant="outlined" onClick={handleCreatePost} disabled={post.text === ''} sx={{ width: '100%' }}>Create Post</Button>
        </CardActions>
      </Card>
    </div>
  );
}

NewPost.propTypes = {
  postId: PropTypes.string.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  addToPostIds: PropTypes.func.isRequired,
};

export default NewPost;
