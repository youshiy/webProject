// Profile page
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import {
  readProfileImageByUserId, updateUserProfileImage, deleteUserProfileImage,
  updateUser,
} from '../../api/users';
import './ProfileImage.css';

function ProfileImage(props) {
  const {
    loggedInUserId, setAlert,
  } = props;
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviewFile, setImagePreviewFile] = useState(null);

  useEffect(() => {
    async function fetchProfileImageUrlByUserId(id) {
      try {
        const profileImage = await readProfileImageByUserId(id);
        setProfileImageUrl(profileImage.data);
      } catch (err) {
        setAlert({ severity: 'error', message: `Error fetching user profile image: ${err.message ? err.message : err.toString()}` });
      }
    }
    fetchProfileImageUrlByUserId(loggedInUserId);
  }, [loggedInUserId, setAlert]);

  function clearImagePreview() {
    setImagePreview(null);
    setImagePreviewFile(null);
    const fileInput = document.getElementById('imagePreview');
    fileInput.value = '';
  }

  function handleImagePreview(e) {
    // in bytes, since file.size is in bytes
    const maxSizeImage = 1 * 1024 * 1024; // 1MB for images

    const reader = new FileReader();
    const file = e.target.files[0];

    if (file.type.startsWith('image/')) {
      if (file.size <= maxSizeImage) {
        reader.onload = (event) => {
          setImagePreview(event.target.result);
          setImagePreviewFile(file);
        };
        reader.readAsDataURL(file);
      } else {
        clearImagePreview();
        setAlert({ severity: 'error', message: 'Image file size exceeds the limit (1MB)' });
      }
    } else {
      clearImagePreview();
      setAlert({ severity: 'error', message: 'Unsupported file type' });
    }
  }

  async function updateProfileImage() {
    try {
      const formData = new FormData();
      formData.append('File_0', imagePreviewFile);
      if (profileImageUrl.split('amazonaws.com/')[1] !== 'defaultProfilePicture.jpg') {
        formData.append('currentProfileImage', encodeURIComponent(profileImageUrl.split('amazonaws.com/')[1]));
      }
      const result = await updateUserProfileImage(loggedInUserId, formData);
      const s3ImageUrl = decodeURIComponent(result.data);
      setProfileImageUrl(s3ImageUrl);
      clearImagePreview();

      setAlert({ severity: 'success', message: 'Profile Picture Updated!' });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error updating Profile Picture: ${err.message ? err.message : err.toString()}` });
    }
  }

  async function deleteProfileImage() {
    try {
      if (profileImageUrl.split('amazonaws.com/')[1] === 'defaultProfilePicture.jpg') {
        setAlert({ severity: 'error', message: 'You cannot delete the default Profile Picture!' });
        return;
      }
      await deleteUserProfileImage(loggedInUserId);
      const defaultImageUrl = 'https://projectmediadocuments.s3.us-east-1.amazonaws.com/defaultProfilePicture.jpg';
      await updateUser({ id: loggedInUserId, profileImage: defaultImageUrl });
      setProfileImageUrl(defaultImageUrl);

      setAlert({ severity: 'success', message: 'Profile Picture Deleted!' });
    } catch (err) {
      setAlert({ severity: 'error', message: `Error deleting Profile Picture: ${err.message ? err.message : err.toString()}` });
    }
  }

  return (
    <div className='profileImageDiv'>
      <h5>Profile Picture</h5>
      {profileImageUrl && (
        <>
          <img src={profileImageUrl} alt="Profile Pic" />
          <div>
            <Button variant='contained' onClick={deleteProfileImage} sx={{ width: '100%' }}>Delete Profile Picture</Button>
          </div>
        </>
      )}
      <br />
      <div>
        <label style={{ display: 'block' }}>Upload new Profile Picture:</label>
        <input id='imagePreview' data-testid='imagePreview' type="file" accept="image/*" onChange={handleImagePreview} />
      </div>
      <br />
      {imagePreview && (
        <>
          <div>
            <h5>Image Preview</h5>
            <img src={imagePreview} alt="Profile Pic Preview" />
          </div>
          <div>
            <Button variant='contained' onClick={clearImagePreview} sx={{ width: '100%' }}>Clear Image Preview</Button>
            <Button variant='contained' onClick={updateProfileImage} sx={{ width: '100%' }}>Update Profile Picture</Button>
          </div>
        </>
      )}
    </div>
  );
}

ProfileImage.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default ProfileImage;
