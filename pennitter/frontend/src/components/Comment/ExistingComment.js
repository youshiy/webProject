import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';
import { readIdUsernameAndProfilePictureByUserId } from '../../api/users';
import { readCommentById, updateComment, deleteCommentByIdWithPostId } from '../../api/comments';
import ExistingCommentHeader from './ExistingCommentHeader';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
// eslint-disable-next-line import/no-cycle
import CommentSection from '../CommentSection/CommentSection';
import { ExistingCommentDisplayText, ExistingCommentDisplayButtons } from './ExistingCommentDisplay';
import { ExistingCommentEditText, ExistingCommentEditButtons } from './ExistingCommentEdit';
import './Comment.css';

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

function ExistingComment(props) {
  const {
    commentId,
    postId,
    parentCommentId,
    loggedInUserId,
    setAlert,
    removeFromCommentIds,
  } = props;
  const [comment, setComment] = useState(null);
  const [originalComment, setOriginalComment] = useState(null);
  const [isEditingExistingComment, setIsEditingExistingComment] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState({ username: '', profileImage: '' });
  let commentOrReplyText = { uppercase: 'Comment', lowercase: 'comment' };

  const [openDialog, setOpenDialog] = React.useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  if (parentCommentId !== '-1') {
    commentOrReplyText = { uppercase: 'Reply', lowercase: 'reply' };
  }

  useEffect(() => {
    async function fetchCommentById() {
      try {
        const commentData = await readCommentById(commentId);
        const idUsrnmProfPic = await
        readIdUsernameAndProfilePictureByUserId(commentData.data.userId);
        setComment(commentData.data);
        setOriginalComment(commentData.data);
        setCommentAuthor(idUsrnmProfPic.data);
      } catch (err) {
        if (parentCommentId !== '-1') {
          setAlert({ severity: 'error', message: `Error fetching Reply: ${err.message ? err.message : err.toString()}` });
        } else {
          setAlert({ severity: 'error', message: `Error fetching Comment: ${err.message ? err.message : err.toString()}` });
        }
      }
    }

    fetchCommentById();
  }, [postId, commentId, setAlert, parentCommentId]);

  async function handleCommentChange(e) {
    const { name, value } = e.target;
    setComment((commentObject) => ({
      ...commentObject,
      [name]: value,
    }));
  }

  function handleEditComment() {
    setIsEditingExistingComment(true);
  }

  function handleCancelEditComment() {
    setComment(originalComment);
    setIsEditingExistingComment(false);
  }

  async function handleUpdateComment() {
    try {
      const commentData = await updateComment(comment);
      setComment(commentData.data);
      setOriginalComment(commentData.data);
      setIsEditingExistingComment(false);
      setAlert({ severity: 'success', message: `${commentOrReplyText.uppercase} Updated!` });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error updating ${commentOrReplyText.uppercase}: ${err.message ? err.message : err.toString()}` });
    }
  }

  async function handleDeleteComment() {
    try {
      await deleteCommentByIdWithPostId(commentId, postId);
      removeFromCommentIds(commentId);
      setAlert({ severity: 'success', message: `Your ${commentOrReplyText.uppercase} has been deleted!` });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error deleting ${commentOrReplyText.uppercase}: ${err.message ? err.message : err.toString()}` });
    }
  }

  return (
    <div className='commentDiv'>
      <Card sx={{ marginTop: '10px', marginLeft: '25px', marginRight: '25px' }}>
        {comment
          && <>
            <ExistingCommentHeader comment={originalComment} parentCommentId={parentCommentId}
              setAlert={setAlert}
            />
            {!isEditingExistingComment ? (
              <ExistingCommentDisplayText text={comment.text} />
            ) : (
              <ExistingCommentEditText text={comment.text} commentOrReplyText={commentOrReplyText}
                handleCommentChange={handleCommentChange}
              />
            )}
            <CardActions disableSpacing style={{ justifyContent: 'space-between' }}>
              <div style={{ float: 'left' }}>
                {commentAuthor.id === loggedInUserId
                  && <div>
                    {!isEditingExistingComment ? (
                      <ExistingCommentDisplayButtons commentOrReplyText={commentOrReplyText}
                        handleEditComment={handleEditComment} handleOpenDialog={handleOpenDialog}
                      />
                    ) : (
                      <ExistingCommentEditButtons
                        text={comment.text}
                        commentOrReplyText={commentOrReplyText}
                        handleCancelEditComment={handleCancelEditComment}
                        handleUpdateComment={handleUpdateComment}
                      />
                    )}
                  </div>
                }
              </div>
              <div style={{ float: 'right' }}>
                <Typography style={{ display: 'inline-block' }}>Reply Section</Typography>
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
          parentCommentId={commentId} loggedInUserId={loggedInUserId} setAlert={setAlert}
        />
      </Card>
      <ConfirmDialog dialogTitle={`Delete ${commentOrReplyText.uppercase}`}
        dialogText={`Are you sure you want to delete this ${commentOrReplyText.lowercase}? All replies to this will also be deleted! This action cannot be reversed!`}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        handleConfirm={handleDeleteComment}
      />
    </div>
  );
}

ExistingComment.propTypes = {
  commentId: PropTypes.string.isRequired,
  postId: PropTypes.string.isRequired,
  parentCommentId: PropTypes.string.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  removeFromCommentIds: PropTypes.func.isRequired,
};

export default ExistingComment;
