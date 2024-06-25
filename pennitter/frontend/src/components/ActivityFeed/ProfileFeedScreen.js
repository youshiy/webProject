import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import Follow from '../Follow/Follow';
import { readPostIdsByUserId } from '../../api/posts';
import { readUserHiddenPostIds } from '../../api/hideunhidepost';
import NewPostSection from './NewPostSection';
import ExistingPostsSection from './ExistingPostsSection';
import DropdownOption from '../DropdownOption/DropdownOption';
import './ProfileFeedScreen.css';

function ProfileFeedScreen(props) {
  const {
    loggedInUserId,
    setAlert,
    ownerUser,
  } = props;

  const viewOptionHeader = 'View:';
  const viewOptions = [
    { value: 'all', description: 'Posts from this User' },
    { value: 'hidden', description: 'Posts from this User you have Hidden' },
  ];

  const [infiniteScrollPage, setInfiniteScrollPage] = useState(1);
  const infiniteScrollPageSize = 3;
  const [hasMore, setHasMore] = useState(false);

  const [postIds, setPostIds] = useState([]);
  const [selectedViewOption, setViewOption] = useState(viewOptions[0].value);

  const fetchPostIds = useCallback(async () => {
    try {
      let responsePostIds = await readPostIdsByUserId(ownerUser.id);
      responsePostIds = responsePostIds.data;
      let hiddenPostIds = await readUserHiddenPostIds(loggedInUserId);
      hiddenPostIds = hiddenPostIds.data;

      if (selectedViewOption === 'hidden') {
        responsePostIds = responsePostIds.filter((item) => hiddenPostIds.includes(item));
      } else {
        responsePostIds = responsePostIds.filter((item) => !hiddenPostIds.includes(item));
      }

      setHasMore(responsePostIds.length > postIds.length);
      setPostIds(responsePostIds.slice(0, infiniteScrollPage * infiniteScrollPageSize));
    } catch (err) {
      setAlert({ severity: 'error', message: `Error fetching Posts: ${err.message ? err.message : err.toString()}` });
    }
  }, [ownerUser.id, loggedInUserId, selectedViewOption,
    postIds.length, infiniteScrollPage, setAlert]);

  useEffect(() => {
    fetchPostIds();

    const intervalId = setInterval(() => {
      fetchPostIds();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchPostIds]);

  const handleChange = (e) => {
    setInfiniteScrollPage(1);
    setViewOption(e.target.value);
  };

  function addToPostIds(postId) {
    setPostIds((prevPostIds) => [postId, ...prevPostIds]);
  }

  function removeFromPostIds(postIdToRemove) {
    setPostIds((prevPostIds) => prevPostIds.filter((postId) => postId !== postIdToRemove));
  }

  return (
    <div className='profileFeedScreenDiv'>
      <div className='profileFeedScreenHeader'>
        <h1>{ownerUser.username}&apos;s Profile Feed</h1>
        {loggedInUserId !== ownerUser.id
          && <DropdownOption headerText={viewOptionHeader} options={viewOptions}
            selectedOption={selectedViewOption} handleChange={handleChange} />
        }
      </div>
      <div className='followUser'>
        {loggedInUserId !== ownerUser.id
          && <Follow loggedInUserId={loggedInUserId} ownerUser={ownerUser}
            setAlert={setAlert} />
        }
      </div>
      {(ownerUser.id === loggedInUserId)
        && <NewPostSection loggedInUserId={loggedInUserId}
          setAlert={setAlert} addToPostIds={addToPostIds} />
      }
      <InfiniteScroll
        dataLength={postIds.length}
        next={() => setInfiniteScrollPage((prev) => prev + 1)}
        hasMore={hasMore}
        scrollThreshold={1.0}
        loader={<h4>Loading...</h4>}
      >
        <ExistingPostsSection postIds={postIds}
          loggedInUserId={loggedInUserId}
          setAlert={setAlert} removeFromPostIds={removeFromPostIds}
        />
      </InfiniteScroll>
    </div>
  );
}

ProfileFeedScreen.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  ownerUser: PropTypes.object,
};

export default ProfileFeedScreen;
