import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { isValidImageUrl, isValidVideoUrl } from '../../utilities/utilities';

function PostMedia(props) {
  const {
    postId, mediaUrl, setAlert,
    setImagePreviewFile, setVideoPreviewFile, isEditingPost, reRenderMediaKey,
  } = props;
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');

  useEffect(() => {
    const fileInput = document.getElementById(`mediaPreview${postId}`);
    if (fileInput?.value) {
      fileInput.value = '';
    }

    if (isValidImageUrl(mediaUrl)) {
      setImagePreview(mediaUrl);
      setVideoPreview('');
    } else if (isValidVideoUrl(mediaUrl)) {
      setVideoPreview(mediaUrl);
      setImagePreview('');
    } else {
      setImagePreview('');
      setVideoPreview('');
    }
  }, [postId, mediaUrl, isEditingPost, reRenderMediaKey]);

  function clearMediaPreview() {
    setImagePreview('');
    setImagePreviewFile('');
    setVideoPreview('');
    setVideoPreviewFile('');
    const fileInput = document.getElementById(`mediaPreview${postId}`);
    fileInput.value = '';
  }

  function handleMediaPreview(e) {
    // in bytes, since file.size is in bytes
    const maxSizeImage = 1 * 1024 * 1024; // 1MB for images
    const maxSizeVideo = 20 * 1024 * 1024; // 20MB for videos

    const reader = new FileReader();
    const file = e.target.files[0];

    if (file.type.startsWith('image/')) {
      if (file.size <= maxSizeImage) {
        reader.onload = (event) => {
          setImagePreview(event.target.result);
          setImagePreviewFile(file);
          setVideoPreview('');
          setVideoPreviewFile(null);
        };
        reader.readAsDataURL(file);
      } else {
        clearMediaPreview();
        setAlert({ severity: 'error', message: 'Image file size exceeds the limit (1MB)' });
      }
    } else if (file.type.startsWith('video/')) {
      if (file.size <= maxSizeVideo) {
        reader.onload = (event) => {
          setVideoPreview(event.target.result);
          setVideoPreviewFile(file);
          setImagePreview('');
          setImagePreviewFile(null);
        };
        reader.readAsDataURL(file);
      } else {
        clearMediaPreview();
        setAlert({ severity: 'error', message: 'Video file size exceeds the limit (20MB)' });
      }
    } else {
      clearMediaPreview();
      setAlert({ severity: 'error', message: 'Unsupported file type' });
    }
  }

  return (
    <>
      {isEditingPost
        && <>
          <div>
            <label style={{ display: 'block' }}>Upload Photo/Video:</label>
            <input id={`mediaPreview${postId}`} data-testid={`mediaPreview${postId}`} type="file" accept="image/*, video/*" onChange={handleMediaPreview} />
          </div>
          <br />
          {(imagePreview || videoPreview) && <Button variant='contained' onClick={clearMediaPreview}>Clear Media</Button>}
        </>
      }
      <div>
        {imagePreview && <img src={imagePreview} alt="Img Preview" />}
        {videoPreview && <video src={videoPreview} frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          controls
          loop
          muted
          preload="auto" />}
      </div>
    </>
  );
}

PostMedia.propTypes = {
  postId: PropTypes.string.isRequired,
  mediaUrl: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  setImagePreviewFile: PropTypes.func.isRequired,
  setVideoPreviewFile: PropTypes.func.isRequired,
  isEditingPost: PropTypes.bool.isRequired,
  reRenderMediaKey: PropTypes.number.isRequired,
};

export default PostMedia;
