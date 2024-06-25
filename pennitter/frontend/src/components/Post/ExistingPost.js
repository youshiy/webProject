import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { Typography } from '@mui/material';

import {
  readPostById, updatePost, deletePostByIdWithUserId,
} from '../../api/posts';
import { readIdUsernameAndProfilePictureByUserId } from '../../api/users';
import { appendPostToUserHiddenPostIds, removePostFromUserHiddenPostIds } from '../../api/hideunhidepost';
import ExistingPostHeader from './ExistingPostHeader';
import PostMedia from './PostMedia';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import CommentSection from '../CommentSection/CommentSection';
import UnhidePost from '../Post_Unhide/UnhidePost';
import HidePost from '../Post_Hide/HidePost';
import { ExistingPostDisplayText, ExistingPostDisplayButtons } from './ExistingPostDisplay';
import { ExistingPostEditText, ExistingPostEditButtons } from './ExistingPostEdit';
import './Post.css';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function ExistingPost(props) {
  const {
    postId, loggedInUserId, setAlert, removeFromPostIds,
  } = props;
  const [post, setPost] = useState(null);
  const [originalPost, setOriginalPost] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [imagePreviewFile, setImagePreviewFile] = useState(null);
  const [videoPreviewFile, setVideoPreviewFile] = useState(null);
  const [postAuthor, setPostAuthor] = useState({ username: '', profileImage: '' });

  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const [openDialog, setOpenDialog] = React.useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    async function fetchPostById() {
      try {
        const postData = await readPostById(postId);
        const readPostAuthor = await readIdUsernameAndProfilePictureByUserId(postData.data.userId);
        setPost(postData.data);
        setOriginalPost(postData.data);
        setPostAuthor(readPostAuthor.data);
      } catch (err) {
        setAlert({ severity: 'error', message: `Error fetching your Post: ${err.message ? err.message : err.toString()}` });
      }
    }

    fetchPostById();
  }, [postId, setAlert, loggedInUserId]);

  async function handlePostChange(e) {
    const { name, value } = e.target;
    setPost((postObject) => ({
      ...postObject,
      [name]: value,
    }));
  }

  function handleEditPost() {
    setIsEditingPost(true);
  }

  function handleCancelEditPost() {
    setPost(originalPost);
    setImagePreviewFile(null);
    setVideoPreviewFile(null);
    const fileInput = document.getElementById(`mediaPreview${postId}`);
    fileInput.value = '';
    setIsEditingPost(false);
  }

  async function handleUpdatePost() {
    try {
      const formData = new FormData();
      formData.append('post', JSON.stringify(post));
      if (imagePreviewFile !== null && imagePreviewFile !== '') {
        formData.append('File_0', imagePreviewFile);
      } else if (videoPreviewFile !== null && videoPreviewFile !== '') {
        formData.append('File_0', videoPreviewFile);
      } else if ((imagePreviewFile !== null && imagePreviewFile === '')
              && (videoPreviewFile !== null && videoPreviewFile === '')
      ) {
        formData.append('removeMedia', true);
      }
      const postData = await updatePost(post.id, formData);
      setPost(postData.data);
      setOriginalPost(postData.data);
      setImagePreviewFile(null);
      setVideoPreviewFile(null);
      setIsEditingPost(false);
      setAlert({ severity: 'success', message: 'Post Updated!' });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error updating Post: ${err.message ? err.message : err.toString()}` });
    }
  }

  async function handleDeletePost() {
    try {
      await deletePostByIdWithUserId(postId, loggedInUserId);
      removeFromPostIds(postId);
      setAlert({ severity: 'success', message: 'Your Post has been deleted!' });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error deleting Post: ${err.message ? err.message : err.toString()}` });
    }
  }

  async function handleHidePost() {
    try {
      await appendPostToUserHiddenPostIds(loggedInUserId, postId);
      removeFromPostIds(postId);
      setAlert({ severity: 'success', message: 'Post Hidden!' });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error hiding Post: ${err.message ? err.message : err.toString()}` });
    }
  }

  async function handleUnhidePost() {
    try {
      await removePostFromUserHiddenPostIds(loggedInUserId, postId);
      removeFromPostIds(postId);
      setAlert({ severity: 'success', message: 'Post Unhidden!' });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error unhiding Post: ${err.message ? err.message : err.toString()}` });
    }
  }

  return (
    <div className='postDiv'>
      <Card sx={{ padding: '10px' }}>
        {post
          && <>
            <ExistingPostHeader post={originalPost} loggedInUserId={loggedInUserId}
              setAlert={setAlert} />
            <CardContent>
            {!isEditingPost ? (
              <ExistingPostDisplayText text={post.text} />
            ) : (
              <ExistingPostEditText text={post.text} handlePostChange={handlePostChange} />
            )}
              <PostMedia postId={postId} mediaUrl={post.mediaUrl} setAlert={setAlert}
                setImagePreviewFile={setImagePreviewFile}
                setVideoPreviewFile={setVideoPreviewFile}
                isEditingPost={isEditingPost}
                reRenderMediaKey={0}
              />
            </CardContent>
            <CardActions disableSpacing style={{ justifyContent: 'space-between' }}>
              <div style={{ float: 'left' }}>
                {postAuthor.id === loggedInUserId && (
                  !isEditingPost ? (
                    <ExistingPostDisplayButtons
                      handleEditPost={handleEditPost} handleOpenDialog={handleOpenDialog}
                    />
                  ) : (
                    <ExistingPostEditButtons
                        text={post.text}
                        handleCancelEditPost={handleCancelEditPost}
                        handleUpdatePost={handleUpdatePost}
                    />
                  )
                )}
                {postAuthor.id !== loggedInUserId && (
                  post.hiddenBy.some((item) => item === loggedInUserId) ? (
                    <UnhidePost handleUnhidePost={handleUnhidePost} />
                  ) : (
                    <HidePost handleHidePost={handleHidePost} />
                  )
                )}
              </div>
              <div style={{ float: 'right' }}>
                <Typography style={{ display: 'inline-block' }}>Comment Section</Typography>
                <ExpandMore
                  expand={expanded}
                  onClick={handleExpandClick}
                  aria-expanded={expanded}
                  aria-label="show more"
                  style={{ display: 'inline-block' }}
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              </div>
            </CardActions>
          </>
        }
        <CommentSection expanded={expanded} postId={postId}
          parentCommentId={'-1'} loggedInUserId={loggedInUserId} setAlert={setAlert}
        />
      </Card>
      <ConfirmDialog dialogTitle={'Delete Post'}
        dialogText={'Are you sure you want to delete this post? All comments and replies on this post will also be deleted! This action cannot be reversed!'}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        handleConfirm={handleDeletePost}
      />
    </div>
  );
}

ExistingPost.propTypes = {
  postId: PropTypes.string.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  removeFromPostIds: PropTypes.func.isRequired,
};

export default ExistingPost;
