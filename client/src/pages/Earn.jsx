import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./Earn.module.css";

const Earn = () => {
  const { user, token } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState({});
  const [videoCompleted, setVideoCompleted] = useState({});
  const [userBalance, setUserBalance] = useState(0);
  const [watchedAds, setWatchedAds] = useState([]);
  const videoRef = useRef(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);



  useEffect(() => {
    if (user && token) {
      fetchAds();
      fetchUserBalance();
      fetchWatchedAds();
    }
  }, [user, token]);

  const fetchAds = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/earn/ads`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAds(response.data.ads);
        console.log("✅ Fetched real ads from backend:", response.data.ads.length);
      } else {
        console.log("❌ No ads found in backend");
        setAds([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Failed to fetch ads:", error);
      toast.error("Failed to load videos. Please try again.");
      setAds([]);
      setLoading(false);
    }
  };

  // Start cooldown timer
  const startCooldown = () => {
    setCooldownActive(true);
    setCooldownTime(300); // 5 minutes = 300 seconds
    
    const timer = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCooldownActive(false);
          setCurrentAdIndex(prev => (prev + 1) % ads.length);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchUserBalance = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserBalance(response.data.user.walletBalance || 0);
      }
    } catch (error) {
      console.error("❌ Failed to fetch user balance:", error);
    }
  };

  const fetchWatchedAds = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/earn/watched-ads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const watchedAdIds = response.data.watchedAds
          .filter(watch => watch.adId && watch.adId._id) // Filter out null adId
          .map(watch => watch.adId._id);
        setWatchedAds(watchedAdIds);
        console.log("✅ Fetched watched ads:", watchedAdIds);
      }
    } catch (error) {
      console.error("❌ Failed to fetch watched ads:", error);
    }
  };

  const startWatching = (adId) => {
    setWatching(prev => ({ ...prev, [adId]: true }));
    setVideoCompleted(prev => ({ ...prev, [adId]: false }));
    
    console.log(`🎬 Started watching ad: ${adId}`);
    
    // Get the video element and start playing
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Failed to play video:', error);
        toast.error('Failed to start video. Please try again.');
      });
    }
  };

  const handleVideoEnded = async (ad) => {
    console.log(`🎬 Video completed for: ${ad.title}`);
    setVideoCompleted(prev => ({ ...prev, [ad._id]: true }));
    setWatching(prev => ({ ...prev, [ad._id]: false }));
    
    // Automatically mark as watched and add reward
    await markAsWatched(ad);
    
    // Start cooldown for next ad
    startCooldown();
  };

  const handleVideoPlay = (adId) => {
    console.log(`▶️ Video started playing for ad: ${adId}`);
    setWatching(prev => ({ ...prev, [adId]: true }));
  };

  const handleVideoPause = (adId) => {
    console.log(`⏸️ Video paused for ad: ${adId}`);
    setWatching(prev => ({ ...prev, [adId]: false }));
  };

  const markAsWatched = async (ad) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/earn/watch-ad`,
        { adId: ad._id },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

             if (response.data.success) {
         toast.success(`🎉 Congratulations! You earned ₹${ad.reward} ($${response.data.usdReward}) from "${response.data.adTitle}"!`);
         fetchUserBalance(); // Update balance in real-time
         
         // Refresh ads and watched status
         setTimeout(() => {
           fetchAds();
           fetchWatchedAds();
         }, 1000);
       }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to mark as watched");
      }
    }
  };



  if (!user) {
    return (
      <>
        <Navbar />
        <div className={styles.unauthorized}>
          <h2>Login Required</h2>
          <p>Please login to access the earn feature.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.earnContainer}>
        <div className={styles.earnHeader}>
          <h1>💰 Earn Money</h1>
          <p>Watch videos and earn ₹100 for each video!</p>
          <div className={styles.balanceInfo}>
            <span>Current Balance: ${userBalance.toFixed(2)}</span>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading videos...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className={styles.noAds}>
            <h3>No Videos Available</h3>
            <p>There are currently no videos available to watch. Please check back later!</p>
          </div>
        ) : cooldownActive ? (
          <div className={styles.cooldownContainer}>
            <div className={styles.cooldownContent}>
              <h2>🎉 Video Completed!</h2>
              <p>You earned ₹100 for watching the video!</p>
              <div className={styles.timerContainer}>
                <h3>⏱️ Next Video Available In:</h3>
                <div className={styles.timer}>{formatTime(cooldownTime)}</div>
              </div>
              <p>Please wait for the next video to become available.</p>
            </div>
          </div>
        ) : (
          <div className={styles.singleAdContainer}>
            {ads[currentAdIndex] && (
              <div className={styles.adCard}>
                <div className={styles.adHeader}>
                  <h3>{ads[currentAdIndex].title}</h3>
                  <div className={styles.adStatus}>
                    <span className={styles.reward}>₹{ads[currentAdIndex].reward} (${(ads[currentAdIndex].reward * 0.012).toFixed(2)})</span>
                    {watchedAds.includes(ads[currentAdIndex]._id) && (
                      <span className={styles.watchedBadge}>✅ Watched</span>
                    )}
                  </div>
                </div>
                
                <div className={styles.adDescription}>
                  <p>{ads[currentAdIndex].description}</p>
                </div>

                                 <div className={styles.videoContainer}>
                   <video
                     ref={videoRef}
                     width="100%"
                     height="300"
                     controls
                     style={{
                       borderRadius: '8px',
                       backgroundColor: '#000',
                       cursor: 'pointer'
                     }}
                     onLoadStart={() => console.log(`📹 Video loading: ${ads[currentAdIndex].title}`)}
                     onLoadedData={() => console.log(`📹 Video loaded: ${ads[currentAdIndex].title}`)}
                     onPlay={() => handleVideoPlay(ads[currentAdIndex]._id)}
                     onPause={() => handleVideoPause(ads[currentAdIndex]._id)}
                     onEnded={() => handleVideoEnded(ads[currentAdIndex])}
                     onError={(e) => {
                       console.error(`❌ Video error for ${ads[currentAdIndex].title}:`, e);
                     }}
                   >
                     <source src={ads[currentAdIndex].videoUrl} type="video/mp4" />
                     Your browser does not support the video tag.
                   </video>
                 </div>

                <div className={styles.adActions}>
                  {watchedAds.includes(ads[currentAdIndex]._id) ? (
                    <div className={styles.completedContainer}>
                      <span className={styles.completedText}>✅ Already Watched & Earned ₹{ads[currentAdIndex].reward} (${(ads[currentAdIndex].reward * 0.012).toFixed(2)})</span>
                    </div>
                  ) : (
                    <>
                      {!watching[ads[currentAdIndex]._id] && !videoCompleted[ads[currentAdIndex]._id] && (
                        <button
                          onClick={() => startWatching(ads[currentAdIndex]._id)}
                          className={styles.watchBtn}
                        >
                          ▶️ Start Watching Video
                        </button>
                      )}

                      {watching[ads[currentAdIndex]._id] && !videoCompleted[ads[currentAdIndex]._id] && (
                        <div className={styles.watchingContainer}>
                          <div className={styles.watchingStatus}>
                            🎬 Currently Watching...
                          </div>
                          <p>Complete the video to earn ₹{ads[currentAdIndex].reward} (${(ads[currentAdIndex].reward * 0.012).toFixed(2)})!</p>
                        </div>
                      )}

                      {videoCompleted[ads[currentAdIndex]._id] && !watchedAds.includes(ads[currentAdIndex]._id) && (
                        <div className={styles.completedContainer}>
                          <span className={styles.completedText}>🎉 Video Completed! Reward will be added automatically...</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Earn; 