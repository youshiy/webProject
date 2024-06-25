import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { readPostIdsByUserId, readActivityFeedPostIds } from '../../api/posts';
import { readUserHiddenPostIds } from '../../api/hideunhidepost';
import NewPostSection from './NewPostSection';
import ExistingPostsSection from './ExistingPostsSection';
import DropdownOption from '../DropdownOption/DropdownOption';
import './ActivityFeedScreen.css';

function ActivityFeedScreen(props) {
  const {
    loggedInUserId,
    setAlert,
  } = props;

  const viewOptionHeader = 'View:';
  const viewOptions = [
    { value: 'all', description: 'Posts from Users you follow and You' },
    { value: 'follows', description: 'Posts from Users you follow' },
    { value: 'hidden', description: 'Posts you have Hidden' },
  ];

  const [infiniteScrollPage, setInfiniteScrollPage] = useState(1);
  const infiniteScrollPageSize = 3;
  const [hasMore, setHasMore] = useState(false);

  const [postIds, setPostIds] = useState([]);
  const [selectedViewOption, setViewOption] = useState(viewOptions[0].value);

  const fetchPostIds = useCallback(async () => {
    try {
      let responsePostIds = await readActivityFeedPostIds(loggedInUserId);
      responsePostIds = responsePostIds.data;

      if (selectedViewOption === 'follows') {
        let loggedInUserPostIds = await readPostIdsByUserId(loggedInUserId);
        loggedInUserPostIds = loggedInUserPostIds.data;
        responsePostIds = responsePostIds.filter((item) => !loggedInUserPostIds.includes(item));
      }

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
  }, [loggedInUserId, selectedViewOption, postIds.length, infiniteScrollPage, setAlert]);

  function addToPostIds(postId) {
    setPostIds((prevPostIds) => [postId, ...prevPostIds]);
  }

  function removeFromPostIds(postIdToRemove) {
    setPostIds((prevPostIds) => prevPostIds.filter((postId) => postId !== postIdToRemove));
  }

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

  return (
    <div className='activityFeedScreenDiv'>
      <div className='activityFeedScreenHeader'>
        <h1>Activity Feed</h1>
        <DropdownOption headerText={viewOptionHeader} options={viewOptions}
          selectedOption={selectedViewOption} handleChange={handleChange} />
      </div>
      <NewPostSection loggedInUserId={loggedInUserId}
        setAlert={setAlert} addToPostIds={addToPostIds} />
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

ActivityFeedScreen.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
};

export default ActivityFeedScreen;
